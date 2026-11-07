
import { hexToHsl, hslToHex } from './colorConversions'

/**
 * Armonie cromatiche: unica fonte di verità per id, etichetta e angoli
 * (in gradi sulla ruota HSL, relativi al colore di base).
 * Le usano la ruota, il generatore di palette e la palette da immagine.
 */
export const HARMONIES = [
    { id: 'analogous', label: 'Analogo', angles: [-30, 0, 30] },
    { id: 'complementary', label: 'Complementare', angles: [0, 180] },
    {
        id: 'split-complementary',
        label: 'Complementare diviso',
        angles: [0, 150, 210],
    },
    { id: 'triadic', label: 'Triade', angles: [0, 120, 240] },
]

export const HARMONY_ANGLES = Object.fromEntries(
    HARMONIES.map((harmony) => [harmony.id, harmony.angles])
)

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

    const angles = HARMONY_ANGLES[type] ?? HARMONY_ANGLES.triadic

    return angles.map((angle) => {
        const hue = (h + angle + 360) % 360

        return {
            color: hslToHex(hue, saturation, lightness),
            hue,
        }
    })
}
