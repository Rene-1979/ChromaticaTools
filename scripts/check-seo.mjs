/**
 * Controlla l'HTML generato in dist/ (dopo `npm run build`): meta tag, titoli,
 * un solo H1, JSON-LD valido, link interni, sitemap, robots, llms.txt e 404.
 * Esce con errore se trova un problema.
 *
 * Uso: npm run build && npm run check:seo
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { PAGES, SITE, getPageUrl } from '../src/content/pages.js'

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const read = (file) => readFileSync(resolve(dist, file), 'utf8')

const problems = []
const rows = []
const titles = new Set()
const paths = new Set(PAGES.map((page) => page.path))

for (const page of PAGES) {
    const html = read(page.file)
    const pick = (pattern) => html.match(pattern)?.[1]

    const title = pick(/<title>([^<]*)<\/title>/)
    const description = pick(/<meta name="description" content="([^"]*)"/)
    const canonical = pick(/<link rel="canonical" href="([^"]*)"/)
    const ogUrl = pick(/<meta property="og:url" content="([^"]*)"/)
    const h1 = (html.match(/<h1[ >]/g) ?? []).length
    const jsonLdText = pick(
        /<script type="application\/ld\+json" id="page-jsonld">([\s\S]*?)<\/script>/
    )

    const where = page.path
    const expected = getPageUrl(page)

    if (!html.trimStart().toLowerCase().startsWith('<!doctype html>')) {
        problems.push(`${where}: manca il doctype`)
    }
    if (!/<html lang="it">/.test(html)) problems.push(`${where}: manca lang="it"`)
    if (!title) problems.push(`${where}: manca il titolo`)
    if (titles.has(title)) problems.push(`${where}: titolo duplicato`)
    titles.add(title)
    if (title && title.length > 65) problems.push(`${where}: titolo lungo (${title.length})`)
    if (!description || description.length < 70 || description.length > 165) {
        problems.push(`${where}: descrizione di ${description?.length ?? 0} caratteri`)
    }
    if (canonical !== expected) problems.push(`${where}: canonical ${canonical}`)
    if (ogUrl !== expected) problems.push(`${where}: og:url ${ogUrl}`)
    if (h1 !== 1) problems.push(`${where}: ${h1} titoli h1 (ne serve uno)`)

    let types = '-'
    try {
        types = JSON.parse(jsonLdText)['@graph'].map((node) => node['@type']).join(', ')
    } catch (error) {
        problems.push(`${where}: JSON-LD non valido (${error.message})`)
    }

    const links = new Set(
        [...html.matchAll(/<a href="(\/[^"#?]*)"/g)].map((match) => match[1])
    )
    for (const link of links) {
        if (!paths.has(link)) problems.push(`${where}: link interno non valido ${link}`)
    }

    rows.push({
        pagina: where,
        titolo: title?.length,
        descrizione: description?.length,
        h1,
        link: links.size,
        jsonld: types,
    })
}

console.table(rows)

const sitemap = read('sitemap.xml')
const locs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) => match[1])
if (locs.length !== PAGES.length) problems.push(`sitemap: ${locs.length} indirizzi su ${PAGES.length}`)
for (const page of PAGES) {
    if (!locs.includes(getPageUrl(page))) problems.push(`sitemap: manca ${getPageUrl(page)}`)
}

const robots = read('robots.txt')
if (!robots.includes(`Sitemap: ${SITE.url}/sitemap.xml`)) problems.push('robots.txt: manca la riga Sitemap')
if (/Disallow:\s*\//.test(robots)) problems.push('robots.txt: blocca il sito')

if (!read('llms.txt').startsWith(`# ${SITE.name}`)) problems.push('llms.txt: intestazione errata')
if (!/noindex/.test(read('404.html'))) problems.push('404.html: manca noindex')

// IndexNow: il file con la chiave deve esistere e contenere la chiave
const keyFile = resolve(dist, `${SITE.indexNowKey}.txt`)
if (!existsSync(keyFile) || readFileSync(keyFile, 'utf8').trim() !== SITE.indexNowKey) {
    problems.push('IndexNow: file chiave mancante o diverso in dist/')
}

if (!existsSync(resolve(dist, 'google2732f4e511c9cb11.html'))) {
    problems.push('manca il file di verifica di Google Search Console')
}

if (problems.length > 0) {
    console.error(`\nPROBLEMI (${problems.length}):\n- ${problems.join('\n- ')}`)
    process.exit(1)
}

console.log('\nSEO: nessun problema trovato.')
