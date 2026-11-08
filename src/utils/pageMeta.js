import { getPageUrl } from '../content/pages.js'
import { jsonLdString } from '../content/schema.js'

function setAttribute(selector, attribute, value) {
    document.querySelector(selector)?.setAttribute(attribute, value)
}

/**
 * Aggiorna titolo, descrizione, indirizzo canonico, anteprime social e dati
 * strutturati quando si cambia scheda senza ricaricare la pagina.
 * Gli stessi valori sono già scritti nell'HTML prerenderizzato di ogni scheda.
 */
export function applyPageMeta(page) {
    const url = getPageUrl(page)

    document.title = page.title

    setAttribute('meta[name="description"]', 'content', page.description)
    setAttribute('link[rel="canonical"]', 'href', url)

    setAttribute('meta[property="og:title"]', 'content', page.title)
    setAttribute('meta[property="og:description"]', 'content', page.description)
    setAttribute('meta[property="og:url"]', 'content', url)

    setAttribute('meta[name="twitter:title"]', 'content', page.title)
    setAttribute('meta[name="twitter:description"]', 'content', page.description)

    const jsonLd = document.getElementById('page-jsonld')
    if (jsonLd) jsonLd.textContent = jsonLdString(page)
}
