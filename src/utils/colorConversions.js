
/**
 * Converte un colore HEX in valori HSL.
 *
 * H = tonalità (0-360)
 * S = saturazione (0-100)
 * L = luminosità (0-100)
 *
 * Esempio: hexToHsl('#266297')
 */
export function hexToHsl(hex) {
    const normalizedHex = hex.replace('#', '')

    const rgb = normalizedHex.match(/[0-9a-f]{2}/gi)

    if (!rgb || rgb.length !== 3) {
        throw new Error('Colore HEX non valido: ' + hex)
    }

    const [r, g, b] = rgb.map(
        (value) => parseInt(value, 16) / 255
    )

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)

    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
        const delta = max - min

        s = l > 0.5
            ? delta / (2 - max - min)
            : delta / (max + min)

        switch (max) {
            case r:
                h = (g - b) / delta + (g < b ? 6 : 0)
                break

            case g:
                h = (b - r) / delta + 2
                break

            default:
                h = (r - g) / delta + 4
                break
        }

        h *= 60
    }

    return {
        h: Math.round(h),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    }
}

/**
 * Converte valori HSL in un colore HEX.
 *
 * Esempio: hslToHex(204, 60, 37)
 */
export function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360
    s = Math.max(0, Math.min(100, s)) / 100
    l = Math.max(0, Math.min(100, l)) / 100

    const chroma = (1 - Math.abs(2 * l - 1)) * s
    const x = chroma * (
        1 - Math.abs((h / 60) % 2 - 1)
    )
    const m = l - chroma / 2

    let r = 0
    let g = 0
    let b = 0

    if (h < 60) {
        r = chroma
        g = x
    } else if (h < 120) {
        r = x
        g = chroma
    } else if (h < 180) {
        g = chroma
        b = x
    } else if (h < 240) {
        g = x
        b = chroma
    } else if (h < 300) {
        r = x
        b = chroma
    } else {
        r = chroma
        b = x
    }

    const toHex = (value) =>
        Math.round((value + m) * 255)
            .toString(16)
            .padStart(2, '0')

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}
