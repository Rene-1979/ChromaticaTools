import { hexToHsl, hslToHex } from './colorConversions'
import { getContrastRatio } from './contrast'
import { simulateHex, VISION_MATRICES } from './colorVision'

// Piccolo margine oltre la soglia, per non restare al limite.
const MARGIN = 0.2

function passesEverywhere(fg, bg, threshold) {
    if (getContrastRatio(fg, bg) < threshold) return false

    return Object.keys(VISION_MATRICES).every(
        (type) =>
            getContrastRatio(simulateHex(fg, type), simulateHex(bg, type)) >=
            threshold
    )
}

/**
 * Cerca il colore del testo più vicino all'originale (stessa tonalità e
 * saturazione, cambia solo la luminosità) che raggiunge la soglia con
 * visione normale e con protanopia, deuteranopia e tritanopia.
 * Se non esiste, ripiega su nero o bianco.
 */
export function suggestTextColor(fg, bg, large) {
    const threshold = (large ? 3 : 4.5) + MARGIN
    const { h, s, l } = hexToHsl(fg)

    for (let delta = 0; delta <= 100; delta++) {
        for (const lightness of [l - delta, l + delta]) {
            if (lightness < 0 || lightness > 100) continue

            const color = hslToHex(h, s, lightness)
            if (passesEverywhere(color, bg, threshold)) {
                return { color, ratio: getContrastRatio(color, bg) }
            }
        }
    }

    const fallback = getContrastRatio('#000000', bg) >= getContrastRatio('#FFFFFF', bg)
        ? '#000000'
        : '#FFFFFF'

    return { color: fallback, ratio: getContrastRatio(fallback, bg) }
}

export const STRUCTURE_FIXES = {
    lang: {
        text: 'Indica la lingua principale della pagina: gli screen reader la usano per scegliere la pronuncia.',
        code: '<html lang="it"> <!-- oppure "en", "fr"… secondo la lingua del sito -->',
    },
    title: {
        text: 'Aggiungi un titolo descrittivo e unico per la pagina.',
        code: '<title>Nome della pagina – Nome del sito</title>',
    },
    zoom: {
        text: 'Rimuovi user-scalable=no e maximum-scale=1: chi ha bisogno di ingrandire il testo deve poterlo fare.',
        code: '<meta name="viewport" content="width=device-width, initial-scale=1">',
    },
    h1: {
        text: 'Usa un solo <h1> che descriva il contenuto principale della pagina.',
        code: '<h1>Titolo principale</h1>',
    },
    headings: {
        text: 'Non saltare livelli: dopo un h2 usa h3, non h4. Scegli il livello per la struttura, non per la grandezza (per quella usa il CSS).',
        code: '<h2>Sezione</h2>\n<h3>Sottosezione</h3>',
    },
    alt: {
        text: 'Descrivi lo scopo dell\'immagine nell\'alt. Se è solo decorativa, usa alt vuoto.',
        code: '<img src="foto.jpg" alt="Descrizione dell\'immagine">\n<img src="linea.png" alt="">',
    },
    label: {
        text: 'Associa ogni campo a un\'etichetta visibile tramite for/id. Il placeholder da solo non basta.',
        code: '<label for="email">Email</label>\n<input id="email" type="email">',
    },
    link: {
        text: 'Dai al link un testo comprensibile. Se contiene solo un\'icona, aggiungi aria-label.',
        code: '<a href="/contatti" aria-label="Contatti"><svg aria-hidden="true">…</svg></a>',
    },
    button: {
        text: 'Dai al pulsante un nome accessibile: testo visibile oppure aria-label se è solo un\'icona.',
        code: '<button type="button" aria-label="Chiudi menu"><svg aria-hidden="true">…</svg></button>',
    },
    colorOnlyLink: {
        text: 'Sottolinea i link nel testo (o rendili in grassetto): il solo colore non basta a chi non lo distingue.',
        code: 'p a { text-decoration: underline; }',
    },
}
