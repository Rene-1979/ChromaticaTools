import { hexToHsl } from './colorConversions'
import {
    oklabChroma,
    oklabDistance,
    oklabDistanceSquared,
    rgbToOklab,
} from './oklab'

/** Lato lungo (in pixel) a cui viene ridotta l'immagine prima dell'analisi. */
export const SAMPLE_MAX_SIDE = 128

/** Numero massimo di gruppi di colore cercati dal K-means. */
export const DEFAULT_CLUSTERS = 10

/** Sotto questa croma OKLab un colore è considerato neutro (grigio). */
export const NEUTRAL_CHROMA = 0.03

// Pixel più trasparenti di così vengono ignorati.
const ALPHA_MIN = 125

// Due gruppi più vicini di così (distanza OKLab) diventano uno solo.
const MERGE_DISTANCE = 0.04

// Gruppi che coprono meno di questa quota di pixel sono rumore.
const MIN_SHARE = 0.003

const MAX_ITERATIONS = 30

/** Dimensioni a cui ridurre l'immagine, mantenendo le proporzioni. */
export function getSampleSize(width, height, maxSide = SAMPLE_MAX_SIDE) {
    const scale = Math.min(1, maxSide / Math.max(width, height))

    return {
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale)),
    }
}

function toHex(r, g, b) {
    return (
        '#' +
        [r, g, b]
            .map((value) =>
                Math.round(Math.max(0, Math.min(255, value)))
                    .toString(16)
                    .padStart(2, '0')
            )
            .join('')
    ).toUpperCase()
}

/**
 * Raggruppa i pixel opachi in "bin" da 5 bit per canale (max 32.768):
 * ogni bin tiene la media dei suoi pixel e quanti sono. L'ordine dei bin
 * dipende solo dai colori, quindi il risultato è sempre lo stesso.
 */
function buildBins(pixels) {
    const bins = new Map()
    let total = 0

    for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] < ALPHA_MIN) continue

        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)

        let bin = bins.get(key)
        if (!bin) {
            bin = { count: 0, r: 0, g: 0, b: 0 }
            bins.set(key, bin)
        }

        bin.count++
        bin.r += r
        bin.g += g
        bin.b += b
        total++
    }

    const points = [...bins.entries()]
        .sort((first, second) => first[0] - second[0])
        .map(([, bin]) => {
            const r = bin.r / bin.count
            const g = bin.g / bin.count
            const b = bin.b / bin.count

            return { count: bin.count, r, g, b, lab: rgbToOklab(r, g, b) }
        })

    return { points, total }
}

/**
 * Centri iniziali deterministici, in stile k-means++ ma senza casualità:
 * parte dal colore più frequente e sceglie ogni centro successivo dove
 * (peso del punto × distanza² dal centro più vicino) è massimo.
 */
function pickInitialCenters(points, k) {
    let first = 0
    points.forEach((point, index) => {
        if (point.count > points[first].count) first = index
    })

    const centers = [{ ...points[first].lab }]
    const nearest = points.map((point) =>
        oklabDistanceSquared(point.lab, centers[0])
    )

    while (centers.length < k) {
        let best = -1
        let bestScore = 0

        points.forEach((point, index) => {
            const score = point.count * nearest[index]
            if (score > bestScore) {
                bestScore = score
                best = index
            }
        })

        if (best < 0) break

        const center = { ...points[best].lab }
        centers.push(center)

        points.forEach((point, index) => {
            const distance = oklabDistanceSquared(point.lab, center)
            if (distance < nearest[index]) nearest[index] = distance
        })
    }

    return centers
}

/** K-means pesato in OKLab. Restituisce, per ogni punto, il suo gruppo. */
function runKMeans(points, centers) {
    const assignment = new Array(points.length).fill(-1)

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
        let changed = false

        points.forEach((point, index) => {
            let best = 0
            let bestDistance = Infinity

            centers.forEach((center, centerIndex) => {
                const distance = oklabDistanceSquared(point.lab, center)
                if (distance < bestDistance) {
                    bestDistance = distance
                    best = centerIndex
                }
            })

            if (assignment[index] !== best) {
                assignment[index] = best
                changed = true
            }
        })

        if (!changed) break

        const sums = centers.map(() => ({ weight: 0, L: 0, a: 0, b: 0 }))

        points.forEach((point, index) => {
            const sum = sums[assignment[index]]
            sum.weight += point.count
            sum.L += point.lab.L * point.count
            sum.a += point.lab.a * point.count
            sum.b += point.lab.b * point.count
        })

        centers.forEach((center, centerIndex) => {
            const sum = sums[centerIndex]
            if (sum.weight === 0) return

            center.L = sum.L / sum.weight
            center.a = sum.a / sum.weight
            center.b = sum.b / sum.weight
        })
    }

    return assignment
}

function makeCluster(weight, r, g, b) {
    return { weight, r, g, b, lab: rgbToOklab(r, g, b) }
}

/** Unisce ripetutamente i due gruppi più vicini, finché sono troppo simili. */
function mergeSimilarClusters(clusters) {
    const merged = [...clusters]

    while (merged.length > 1) {
        let pair = null
        let pairDistance = MERGE_DISTANCE

        for (let i = 0; i < merged.length; i++) {
            for (let j = i + 1; j < merged.length; j++) {
                const distance = oklabDistance(merged[i].lab, merged[j].lab)
                if (distance < pairDistance) {
                    pairDistance = distance
                    pair = [i, j]
                }
            }
        }

        if (!pair) break

        const [i, j] = pair
        const first = merged[i]
        const second = merged[j]
        const weight = first.weight + second.weight

        merged[i] = makeCluster(
            weight,
            (first.r * first.weight + second.r * second.weight) / weight,
            (first.g * first.weight + second.g * second.weight) / weight,
            (first.b * first.weight + second.b * second.weight) / weight
        )
        merged.splice(j, 1)
    }

    return merged
}

/**
 * Estrae i colori principali da un'immagine.
 *
 * @param {Uint8ClampedArray} pixels dati RGBA (come ImageData.data)
 * @param {{ k?: number }} options numero massimo di gruppi iniziali
 * @returns {Array<{
 *   hex: string,
 *   share: number,
 *   hsl: { h: number, s: number, l: number },
 *   oklab: { L: number, a: number, b: number },
 *   chroma: number,
 *   neutral: boolean,
 * }>} colori ordinati dal più frequente; vuoto se l'immagine è trasparente
 *
 * Stessa immagine → stesso risultato: nessun elemento casuale.
 */
export function extractColors(pixels, { k = DEFAULT_CLUSTERS } = {}) {
    const { points, total } = buildBins(pixels)

    if (total === 0) return []

    const centers = pickInitialCenters(points, Math.min(k, points.length))
    const assignment = runKMeans(points, centers)

    const accumulators = centers.map(() => ({ weight: 0, r: 0, g: 0, b: 0 }))

    points.forEach((point, index) => {
        const accumulator = accumulators[assignment[index]]
        accumulator.weight += point.count
        accumulator.r += point.r * point.count
        accumulator.g += point.g * point.count
        accumulator.b += point.b * point.count
    })

    const clusters = accumulators
        .filter((accumulator) => accumulator.weight > 0)
        .map((accumulator) =>
            makeCluster(
                accumulator.weight,
                accumulator.r / accumulator.weight,
                accumulator.g / accumulator.weight,
                accumulator.b / accumulator.weight
            )
        )

    const colors = mergeSimilarClusters(clusters)
        .map((cluster) => {
            const hex = toHex(cluster.r, cluster.g, cluster.b)
            const chroma = oklabChroma(cluster.lab)

            return {
                hex,
                share: cluster.weight / total,
                hsl: hexToHsl(hex),
                oklab: cluster.lab,
                chroma,
                neutral: chroma < NEUTRAL_CHROMA,
            }
        })
        .sort(
            (first, second) =>
                second.share - first.share ||
                first.hex.localeCompare(second.hex)
        )

    const significant = colors.filter((color) => color.share >= MIN_SHARE)

    return significant.length > 0 ? significant : colors.slice(0, 1)
}
