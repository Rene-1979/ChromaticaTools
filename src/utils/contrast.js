
/**
 * Converte un colore HEX nella sua luminanza relativa WCAG.
 *
 * Esempio:
 * getLuminance('#ffffff')
 */
export function getLuminance(hex) {
    const rgb = hex
        .match(/[0-9a-f]{2}/gi)
        .map((value) => parseInt(value, 16) / 255)

    const linear = rgb.map((value) =>
        value <= 0.04045
            ? value / 12.92
            : ((value + 0.055) / 1.055) ** 2.4
    )

    return (
        0.2126 * linear[0] +
        0.7152 * linear[1] +
        0.0722 * linear[2]
    )
}

/**
 * Calcola il rapporto di contrasto tra due colori.
 *
 * Il risultato va da 1:1 a 21:1.
 */
export function getContrastRatio(color1, color2) {
    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)

    const lighter = Math.max(lum1, lum2)
    const darker = Math.min(lum1, lum2)

    return (lighter + 0.05) / (darker + 0.05)
}
