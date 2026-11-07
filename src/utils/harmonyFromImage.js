import { HARMONIES } from './colorHarmony'
import { hslToHex } from './colorConversions'
import { oklabDistance, rgbToOklab } from './oklab'

/** Tolleranza (in gradi di hue HSL) per riconoscere un colore dell'immagine come "quello giusto" di un'armonia. */
export const HUE_TOLERANCE = 28

/** Palette massime proposte per ogni armonia. */
export const PALETTES_PER_HARMONY = 3

// Colori con meno di questa quota non contano come "vivaci" o neutri affidabili.
const MIN_VIVID_SHARE = 0.01
const MIN_NEUTRAL_SHARE = 0.02

// Neutri chiaro e scuro devono differire almeno così in luminosità OKLab per essere entrambi utili.
const NEUTRAL_LIGHTNESS_GAP = 0.15

// Due palette con colori armonici più vicini di così (OKLab) sono considerate la stessa.
const DUPLICATE_DISTANCE = 0.06

const normalizeHue = (hue) => ((hue % 360) + 360) % 360

function hueDistance(first, second) {
    const difference = Math.abs(first - second) % 360
    return Math.min(difference, 360 - difference)
}

// Conversione hex → OKLab per i colori calcolati dall'armonia.
function hexToOklab(hex) {
    return rgbToOklab(
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16)
    )
}

function maxBy(items, getValue) {
    let best = null
    let bestValue = -Infinity

    items.forEach((item) => {
        const value = getValue(item)
        if (value > bestValue) {
            bestValue = value
            best = item
        }
    })

    return best
}

/**
 * Sceglie fino a 3 colori di partenza (basi) tutti diversi:
 * 1. il più dominante (per frequenza)
 * 2. il più vivace (croma più alta)
 * 3. quello con luminosità più lontana dalle basi già scelte
 */
function pickBases(chromatic) {
    const bases = []
    const used = new Set()

    const take = (color, kind, label) => {
        if (!color) return
        used.add(color.hex)
        bases.push({ color, kind, label })
    }

    const available = () => chromatic.filter((color) => !used.has(color.hex))

    take(chromatic[0], 'dominant', 'Base: colore dominante')

    const vividPool = available()
    const meaningful = vividPool.filter((color) => color.share >= MIN_VIVID_SHARE)
    take(
        maxBy(meaningful.length > 0 ? meaningful : vividPool, (color) => color.chroma),
        'vivid',
        'Base: colore più vivace'
    )

    const contrastPool = available()
    if (contrastPool.length > 0 && bases.length > 0) {
        const meanLightness =
            bases.reduce((sum, base) => sum + base.color.oklab.L, 0) / bases.length
        const farthest = maxBy(contrastPool, (color) =>
            Math.abs(color.oklab.L - meanLightness)
        )

        take(
            farthest,
            'contrast',
            farthest.oklab.L < meanLightness
                ? 'Base: colore più scuro'
                : 'Base: colore più chiaro'
        )
    }

    return bases
}

/** Saturazione e luminosità medie dell'immagine (pesate sulla frequenza), per i colori calcolati. */
function getImageTone(chromatic) {
    const weight = chromatic.reduce((sum, color) => sum + color.share, 0)

    return {
        s: chromatic.reduce((sum, color) => sum + color.hsl.s * color.share, 0) / weight,
        l: chromatic.reduce((sum, color) => sum + color.hsl.l * color.share, 0) / weight,
    }
}

/**
 * Cerca nell'immagine il colore che meglio realizza un angolo dell'armonia:
 * vicino per hue entro la tolleranza, preferendo colori frequenti e saturi.
 */
function findImageMatch(targetHue, chromatic, taken, maxShare, maxChroma) {
    let best = null
    let bestScore = -Infinity

    chromatic.forEach((color) => {
        if (taken.has(color.hex)) return

        const distance = hueDistance(color.hsl.h, targetHue)
        if (distance > HUE_TOLERANCE) return

        const score =
            0.5 * (1 - distance / HUE_TOLERANCE) +
            0.25 * (color.share / maxShare) +
            0.25 * (color.chroma / maxChroma)

        if (score > bestScore) {
            bestScore = score
            best = color
        }
    })

    return best
}

/** Neutri dell'immagine utili come sfondi: il più chiaro e il più scuro (o il più frequente, se sono simili). */
function pickNeutrals(neutrals) {
    const reliable = neutrals.filter((color) => color.share >= MIN_NEUTRAL_SHARE)
    if (reliable.length === 0) return []

    const byLightness = [...reliable].sort((a, b) => b.oklab.L - a.oklab.L)
    const lightest = byLightness[0]
    const darkest = byLightness[byLightness.length - 1]

    if (lightest.oklab.L - darkest.oklab.L < NEUTRAL_LIGHTNESS_GAP) {
        return [reliable[0]]
    }

    return [lightest, darkest]
}

function buildPalette({ base, harmony, chromatic, neutrals, tone, maxShare, maxChroma }) {
    const taken = new Set([base.color.hex])

    const colors = harmony.angles.map((angle) => {
        if (angle === 0) {
            return {
                hex: base.color.hex,
                source: 'image',
                role: 'base',
                share: base.color.share,
            }
        }

        const targetHue = normalizeHue(base.color.hsl.h + angle)
        const match = findImageMatch(targetHue, chromatic, taken, maxShare, maxChroma)

        if (match) {
            taken.add(match.hex)
            return { hex: match.hex, source: 'image', role: 'harmony', share: match.share }
        }

        // Nessun colore adatto: colore teorico con tono vicino a quello dell'immagine.
        const saturation = Math.min(95, Math.max(30, (tone.s + base.color.hsl.s) / 2))
        const lightness = Math.min(80, Math.max(25, (tone.l + base.color.hsl.l) / 2))

        return {
            hex: hslToHex(targetHue, saturation, lightness),
            source: 'computed',
            role: 'harmony',
            share: 0,
        }
    })

    pickNeutrals(neutrals).forEach((neutral) => {
        colors.push({
            hex: neutral.hex,
            source: 'image',
            role: 'neutral',
            share: neutral.share,
        })
    })

    return {
        id: `${harmony.id}-${base.kind}`,
        harmonyId: harmony.id,
        kind: base.kind,
        baseLabel: base.label,
        baseHex: base.color.hex,
        colors,
    }
}

/** Due palette sono "la stessa" se i loro colori armonici si corrispondono a coppie. */
function isSamePalette(first, second, labs) {
    const pick = (palette) => palette.colors.filter((color) => color.role !== 'neutral')
    const a = pick(first)
    const b = pick(second)

    if (a.length !== b.length) return false

    const remaining = [...b]

    return a.every((color) => {
        const index = remaining.findIndex(
            (other) =>
                other.hex === color.hex ||
                oklabDistance(labs.get(color.hex), labs.get(other.hex)) < DUPLICATE_DISTANCE
        )

        if (index < 0) return false
        remaining.splice(index, 1)
        return true
    })
}

/**
 * Costruisce, per ogni armonia, fino a 3 palette con basi diverse.
 *
 * @param colors colori estratti da `extractColors`
 * @returns {{
 *   status: 'ok' | 'empty' | 'grayscale',
 *   groups: Array<{ id, label, palettes, note }>
 * }}
 *
 * Ogni swatch ha `source`: 'image' (colore presente nell'immagine) o
 * 'computed' (colore teorico dell'armonia); `role`: 'base' | 'harmony' | 'neutral'.
 */
export function buildImagePalettes(colors) {
    if (colors.length === 0) return { status: 'empty', groups: [] }

    const chromatic = colors.filter((color) => !color.neutral)
    const neutrals = colors.filter((color) => color.neutral)

    if (chromatic.length === 0) return { status: 'grayscale', groups: [] }

    const bases = pickBases(chromatic)
    const tone = getImageTone(chromatic)
    const maxShare = Math.max(...chromatic.map((color) => color.share))
    const maxChroma = Math.max(...chromatic.map((color) => color.chroma))

    // Per confrontare i colori calcolati (che non hanno OKLab) con quelli dell'immagine.
    const labs = new Map(colors.map((color) => [color.hex, color.oklab]))

    const groups = HARMONIES.map((harmony) => {
        const palettes = []

        bases.forEach((base) => {
            const palette = buildPalette({
                base,
                harmony,
                chromatic,
                neutrals,
                tone,
                maxShare,
                maxChroma,
            })

            palette.colors.forEach((color) => {
                if (!labs.has(color.hex)) labs.set(color.hex, hexToOklab(color.hex))
            })

            if (!palettes.some((existing) => isSamePalette(existing, palette, labs))) {
                palettes.push(palette)
            }
        })

        const note =
            palettes.length < PALETTES_PER_HARMONY
                ? `Per questa armonia ho trovato ${
                      palettes.length === 1
                          ? 'una sola palette diversa'
                          : `solo ${palettes.length} palette diverse`
                  }: i colori con una tonalità marcata sono pochi o molto simili tra loro.`
                : ''

        return { id: harmony.id, label: harmony.label, palettes, note }
    })

    return { status: 'ok', groups }
}

