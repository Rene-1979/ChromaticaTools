import { hexToHsl, hslToHex } from './colorConversions'
import { getContrastRatio } from './contrast'

// Contrasto minimo che cerchiamo di raggiungere (WCAG AA, testo normale).
const TARGET_RATIO = 4.5

// Sei tonalità distribuite ogni 60°, sfasate di 30° rispetto al colore attuale.
// Quando scegli un colore, la tonalità di partenza cambia e quindi
// cambiano TUTTE e sei le proposte.
const HUE_OFFSETS = [30, 90, 150, 210, 270, 330]

// Luminosità da provare, partendo dal centro e allontanandosi.
const LIGHTNESS_STEPS = [
    50, 44, 56, 38, 62, 32, 68, 26, 74, 20, 80, 14, 86, 8, 92,
]

/**
 * Restituisce sei colori per il testo, con tonalità diverse,
 * regolati in luminosità per avere un buon contrasto con lo sfondo.
 *
 * Esempio: getContrastSuggestions('#FFFFFF', '#000000')
 */
export function getContrastSuggestions(foreground, background) {
    const { h, s } = hexToHsl(foreground)
    const saturation = Math.min(90, Math.max(60, s))

    return HUE_OFFSETS.map((offset) => {
        const hue = (h + offset) % 360
        let fallback = null

        for (const lightness of LIGHTNESS_STEPS) {
            const color = hslToHex(hue, saturation, lightness)
            const ratio = getContrastRatio(color, background)

            // Primo colore che raggiunge il contrasto richiesto.
            if (ratio >= TARGET_RATIO) {
                return { color, ratio }
            }

            // Altrimenti teniamo il migliore trovato.
            if (!fallback || ratio > fallback.ratio) {
                fallback = { color, ratio }
            }
        }

        return fallback
    })
}
