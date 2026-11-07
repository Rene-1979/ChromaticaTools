/**
 * Conversioni verso OKLab, uno spazio colore percettivo: la distanza
 * euclidea tra due colori somiglia a quanto un occhio li vede diversi.
 *
 * Riferimento: https://bottosson.github.io/posts/oklab/
 */

function toLinear(channel) {
    const value = channel / 255

    return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4
}

/**
 * Converte un colore sRGB (canali 0-255) in OKLab.
 * L = luminosità percepita (0-1), a/b = asse verde-rosso e blu-giallo.
 */
export function rgbToOklab(r, g, b) {
    const red = toLinear(r)
    const green = toLinear(g)
    const blue = toLinear(b)

    const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue)
    const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue)
    const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue)

    return {
        L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
        a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
        b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    }
}

/** Croma OKLCH: quanto un colore è lontano dal grigio (0 = neutro). */
export function oklabChroma({ a, b }) {
    return Math.hypot(a, b)
}

/** Distanza euclidea al quadrato tra due colori OKLab. */
export function oklabDistanceSquared(first, second) {
    const dL = first.L - second.L
    const da = first.a - second.a
    const db = first.b - second.b

    return dL * dL + da * da + db * db
}

/** Distanza euclidea tra due colori OKLab. */
export function oklabDistance(first, second) {
    return Math.sqrt(oklabDistanceSquared(first, second))
}
