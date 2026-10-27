
import { hexToHsl, hslToHex } from './colorConversions'

/**
 * Restituisce i colori di un'armonia cromatica.
 *
 * Tipi supportati:
 * - complementary: complementare
 * - analogous: analoghi
 * - triadic: triade
 * - split-complementary: complementare diviso
 */
export function getColorHarmony(hex, type = 'triadic') {
    const { h, s, l } = hexToHsl(hex)

    // Migliora i colori di partenza troppo estremi.
    const saturation = s < 15 ? 65 : Math.max(35, s)

    const lightness = Math.min(75, Math.max(40, l))

    let angles = []

    switch (type) {
        case 'complementary':
            angles = [0, 180]
            break

        case 'analogous':
            angles = [-30, 0, 30]
            break

        case 'triadic':
            angles = [0, 120, 240]
            break

        case 'split-complementary':
            angles = [0, 150, 210]
            break

        default:
            angles = [0, 120, 240]
    }

    return angles.map((angle) => {
        const hue = (h + angle + 360) % 360

        return {
            color: hslToHex(hue, saturation, lightness),
            hue,
        }
    })
}
