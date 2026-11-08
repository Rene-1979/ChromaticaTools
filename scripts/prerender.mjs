/**
 * Dopo `vite build`: genera l'HTML statico di ogni scheda, la sitemap, llms.txt
 * e la pagina 404.
 *
 * Perché serve: il sito è una app React, ma motori di ricerca e assistenti AI
 * (molti non eseguono JavaScript) devono trovare in ogni indirizzo titolo,
 * descrizione, testo, link e dati strutturati già scritti nell'HTML. Quando la
 * app parte, React sostituisce questo contenuto con l'interfaccia.
 *
 * Tutti i testi vengono da src/content/pages.js: modificare solo lì.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { PAGES, SITE, getPageUrl } from '../src/content/pages.js'
import { jsonLdString } from '../src/content/schema.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')

const template = readFileSync(resolve(dist, 'index.html'), 'utf8')

const HEAD_START = '<!-- seo:head:start -->'
const HEAD_END = '<!-- seo:head:end -->'
const BODY_MARKER = '<!-- seo:body -->'

for (const marker of [HEAD_START, HEAD_END, BODY_MARKER]) {
    if (!template.includes(marker)) {
        throw new Error(`Marcatore mancante in dist/index.html: ${marker}`)
    }
}

const escapeHtml = (text) =>
    text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

const ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1'

function buildHead(page) {
    const url = getPageUrl(page)
    const title = escapeHtml(page.title)
    const description = escapeHtml(page.description)

    return `${HEAD_START}
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="robots" content="${ROBOTS}" />
  <link rel="canonical" href="${url}" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${SITE.name}" />
  <meta property="og:locale" content="${SITE.locale}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${SITE.logo}" />
  <meta property="og:image:alt" content="${escapeHtml(SITE.logoAlt)}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />

  <style>[data-prerender]{max-width:48rem;margin:0 auto;padding:2rem 1rem;font-family:system-ui,sans-serif;line-height:1.6}[data-prerender] a{color:#a5b4fc}[data-prerender] h1{font-size:2rem;line-height:1.2}</style>
  <script type="application/ld+json" id="page-jsonld">${jsonLdString(page)}</script>
  ${HEAD_END}`
}

function buildBody(page) {
    const links = PAGES.map(
        (item) =>
            `<li><a href="${item.path}">${escapeHtml(item.navLabel)}</a></li>`
    ).join('')

    const steps = page.steps
        .map((step) => `<li>${escapeHtml(step)}</li>`)
        .join('')

    const faq = page.faq
        .map(
            (item) =>
                `<h3>${escapeHtml(item.q)}</h3><p>${escapeHtml(item.a)}</p>`
        )
        .join('')

    const related = page.related
        .map((id) => PAGES.find((item) => item.id === id))
        .filter(Boolean)
        .map(
            (item) =>
                `<li><a href="${item.path}">${escapeHtml(item.navLabel)}</a>: ${escapeHtml(item.appName)}</li>`
        )
        .join('')

    return `<div data-prerender>
<header><p><a href="/">${SITE.name}</a> &middot; ${escapeHtml(SITE.tagline)}</p></header>
<nav aria-label="Strumenti colore"><ul>${links}</ul></nav>
<main>
<h1>${escapeHtml(page.h1)}</h1>
<p>${escapeHtml(page.lead)}</p>
<h2>Come si usa</h2>
<ol>${steps}</ol>
<h2>Domande frequenti</h2>
${faq}
<h2>Altri strumenti di ${SITE.name}</h2>
<ul>${related}</ul>
</main>
<footer><p>&copy; ${SITE.name}. Progetto gratuito, codice sorgente su <a href="${SITE.github}">GitHub</a> (${escapeHtml(SITE.license)}).</p></footer>
</div>`
}

function buildPage(page) {
    const start = template.indexOf(HEAD_START)
    const end = template.indexOf(HEAD_END) + HEAD_END.length

    return (
        template.slice(0, start) +
        buildHead(page) +
        template.slice(end)
    ).replace(BODY_MARKER, buildBody(page))
}

function write(relativePath, content) {
    const target = resolve(dist, relativePath)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, content, 'utf8')
}

// --- Controlli: meglio far fallire la build che pubblicare meta duplicati ---
const seen = { title: new Set(), description: new Set(), h1: new Set() }

for (const page of PAGES) {
    for (const field of ['title', 'description', 'h1']) {
        if (seen[field].has(page[field])) {
            throw new Error(`${field} duplicato: ${page[field]}`)
        }
        seen[field].add(page[field])
    }

    if (page.title.length > 65) {
        console.warn(`Titolo lungo (${page.title.length}): ${page.path}`)
    }

    if (page.description.length < 70 || page.description.length > 165) {
        console.warn(
            `Descrizione di ${page.description.length} caratteri: ${page.path}`
        )
    }
}

// --- Pagine ---
for (const page of PAGES) {
    write(page.file, buildPage(page))
}

// --- Sitemap ---
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(
    (page) =>
        `  <url>\n    <loc>${getPageUrl(page)}</loc>\n    <lastmod>${SITE.updated}</lastmod>\n  </url>`
).join('\n')}
</urlset>
`
write('sitemap.xml', sitemap)

// --- llms.txt: riassunto per assistenti AI (https://llmstxt.org) ---
const llms = `# ${SITE.name}

> ${SITE.summary}

## Strumenti

${PAGES.map(
    (page) =>
        `- [${page.appName}](${getPageUrl(page)}): ${page.description}`
).join('\n')}

## Informazioni

- Lingua: italiano
- Costo: gratuito, senza registrazione
- Privacy: i colori e le immagini vengono elaborati nel browser; solo per analizzare un sito l'indirizzo passa da un proxy che scarica la pagina
- Codice sorgente: ${SITE.github} (licenza ${SITE.license}: uso non commerciale libero)
`
write('llms.txt', llms)

// --- 404 ---
const notFound = `<!doctype html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pagina non trovata | ${SITE.name}</title>
  <meta name="robots" content="noindex" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <style>body{margin:0;background:#030612;color:#fff;font-family:system-ui,sans-serif;line-height:1.6}main{max-width:40rem;margin:0 auto;padding:3rem 1rem}a{color:#a5b4fc}</style>
</head>
<body>
  <main>
    <h1>Pagina non trovata</h1>
    <p>L'indirizzo che hai aperto non esiste. Questi sono gli strumenti di ${SITE.name}:</p>
    <ul>${PAGES.map(
        (page) =>
            `<li><a href="${page.path}">${escapeHtml(page.navLabel)}</a></li>`
    ).join('')}</ul>
  </main>
</body>
</html>
`
write('404.html', notFound)

console.log(
    `Prerender completato: ${PAGES.length} pagine, sitemap.xml, llms.txt, 404.html`
)
