import { getContrastRatio, getWcagStatus } from './contrast'

const LIGHT_TEXT = '#FFFFFF'
const DARK_TEXT = '#000000'

/** Etichetta WCAG del miglior livello raggiunto da un rapporto di contrasto. */
export function getWcagLabel(ratio) {
    const status = getWcagStatus(ratio)

    if (status.aaaNormal) return 'AAA'
    if (status.aaNormal) return 'AA'
    if (status.aaLarge) return 'AA testo grande'

    return 'Non superato'
}

/**
 * Per ogni colore di una palette sceglie il testo migliore (bianco o nero)
 * e ne calcola contrasto e livello WCAG.
 *
 * @param {string[]} hexes colori della palette
 * @returns {{ rows: Array<{ hex, text, ratio, label, passesAA }>, passing: number, total: number }}
 */
export function checkPaletteContrast(hexes) {
    const rows = hexes.map((hex) => {
        const light = getContrastRatio(LIGHT_TEXT, hex)
        const dark = getContrastRatio(DARK_TEXT, hex)
        const useLight = light >= dark
        const ratio = useLight ? light : dark

        return {
            hex,
            text: useLight ? LIGHT_TEXT : DARK_TEXT,
            ratio,
            label: getWcagLabel(ratio),
            passesAA: getWcagStatus(ratio).aaNormal,
        }
    })

    return {
        rows,
        passing: rows.filter((row) => row.passesAA).length,
        total: rows.length,
    }
}
