import { getContrastRatio } from './contrast'
import { VISION_MATRICES, rgbToHex, simulateHex } from './colorVision'
import { STRUCTURE_FIXES, suggestTextColor } from './siteFixes'

const PROXY_URL = import.meta.env.VITE_PROXY_URL || '/api/fetch'
const MAX_STYLESHEETS = 10
const MAX_ELEMENTS = 4000

async function fetchRemote(url) {
    const response = await fetch(`${PROXY_URL}?url=${encodeURIComponent(url)}`)
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
        throw new Error(data.error || `Errore del proxy (${response.status})`)
    }

    return data
}

export function normalizeUrl(input) {
    const trimmed = input.trim()
    if (!trimmed) throw new Error('Inserisci l\'indirizzo di un sito.')

    const withProtocol = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`

    try {
        return new URL(withProtocol).href
    } catch {
        throw new Error('Indirizzo non valido.')
    }
}

/* ---------- colori ---------- */

function parseColor(value) {
    if (!value) return null

    const legacy = value.match(
        /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/
    )
    const modern = value.match(
        /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\)$/
    )

    const m = legacy || modern
    if (!m) return null

    const scale = modern ? 255 : 1
    let a = 1
    if (m[4] !== undefined) {
        a = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4])
    }

    return {
        r: parseFloat(m[1]) * scale,
        g: parseFloat(m[2]) * scale,
        b: parseFloat(m[3]) * scale,
        a,
    }
}

function blend(top, bottom) {
    const a = top.a
    return {
        r: top.r * a + bottom.r * (1 - a),
        g: top.g * a + bottom.g * (1 - a),
        b: top.b * a + bottom.b * (1 - a),
        a: 1,
    }
}

/** Sfondo effettivo: compone gli sfondi degli antenati. null se c'è un'immagine. */
function resolveBackground(el, win) {
    const layers = []
    let node = el

    while (node && node.nodeType === 1) {
        const style = win.getComputedStyle(node)

        if (style.backgroundImage && style.backgroundImage !== 'none') {
            return null
        }

        const color = parseColor(style.backgroundColor)
        if (color && color.a > 0) {
            layers.push(color)
            if (color.a >= 1) break
        }

        node = node.parentElement
    }

    let result = { r: 255, g: 255, b: 255, a: 1 }
    for (let i = layers.length - 1; i >= 0; i--) {
        result = blend(layers[i], result)
    }

    return result
}

/* ---------- utilità ---------- */

function describe(el) {
    const tag = el.tagName.toLowerCase()
    const id = el.id ? `#${el.id}` : ''
    const cls =
        typeof el.className === 'string' && el.className.trim()
            ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
            : ''
    return `${tag}${id}${cls}`
}

function ownText(el) {
    return Array.from(el.childNodes)
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
}

function absolutizeCssUrls(css, base) {
    return css.replace(/url\(\s*(['"]?)(?!data:|#|https?:|\/\/)([^'")]+)\1\s*\)/gi,
        (_, quote, path) => {
            try {
                return `url("${new URL(path, base).href}")`
            } catch {
                return _
            }
        })
}

function waitForLoad(iframe) {
    return new Promise((resolve) => {
        iframe.addEventListener('load', resolve, { once: true })
        setTimeout(resolve, 8000)
    })
}

/* ---------- controlli ---------- */

function checkContrast(body, win) {
    const groups = new Map()
    let skippedImages = 0
    let checked = 0

    const elements = body.querySelectorAll('*')
    const limit = Math.min(elements.length, MAX_ELEMENTS)

    for (let i = 0; i < limit; i++) {
        const el = elements[i]
        const text = ownText(el)
        if (!text) continue

        const style = win.getComputedStyle(el)
        if (
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)
        ) {
            continue
        }

        const fgRaw = parseColor(style.color)
        const bg = resolveBackground(el, win)

        if (!fgRaw) continue
        if (!bg) {
            skippedImages++
            continue
        }

        const fg = blend(fgRaw, bg)
        const fgHex = rgbToHex(fg)
        const bgHex = rgbToHex(bg)

        const size = parseFloat(style.fontSize)
        const weight = parseInt(style.fontWeight, 10) || 400
        const large = size >= 24 || (size >= 18.66 && weight >= 700)

        const key = `${fgHex}|${bgHex}|${large}`
        checked++

        if (!groups.has(key)) {
            groups.set(key, {
                fg: fgHex,
                bg: bgHex,
                large,
                ratio: getContrastRatio(fgHex, bgHex),
                count: 0,
                sample: text.slice(0, 70),
                selector: describe(el),
            })
        }

        groups.get(key).count++
    }

    const pairs = [...groups.values()]

    return { pairs, skippedImages, checked }
}

function checkColorOnlyLinks(body, win) {
    const issues = []

    body.querySelectorAll('p a[href], li a[href]').forEach((a) => {
        const text = a.textContent.trim()
        if (!text) return

        const parent = a.parentElement
        const parentText = ownText(parent)
        if (!parentText) return

        const linkStyle = win.getComputedStyle(a)
        const parentStyle = win.getComputedStyle(parent)

        if (linkStyle.textDecorationLine.includes('underline')) return
        if (parseInt(linkStyle.fontWeight, 10) > parseInt(parentStyle.fontWeight, 10)) return

        const bg = resolveBackground(a, win)
        const l = parseColor(linkStyle.color)
        const p = parseColor(parentStyle.color)
        if (!bg || !l || !p) return

        const linkHex = rgbToHex(blend(l, bg))
        const textHex = rgbToHex(blend(p, bg))
        const ratio = getContrastRatio(linkHex, textHex)

        if (ratio < 3) {
            issues.push({
                selector: describe(a),
                text: text.slice(0, 60),
                linkHex,
                textHex,
                ratio,
            })
        }
    })

    return issues
}

function checkStructure(doc) {
    const issues = []
    const add = (severity, rule, message, items = [], fix = null) =>
        issues.push({ severity, rule, message, items: items.slice(0, 8), count: items.length, fix })

    const root = doc.documentElement
    if (!root.getAttribute('lang')) {
        add('error', 'WCAG 3.1.1', 'Manca l\'attributo lang su <html>.', [], STRUCTURE_FIXES.lang)
    }

    if (!doc.title.trim()) {
        add('error', 'WCAG 2.4.2', 'La pagina non ha un <title>.', [], STRUCTURE_FIXES.title)
    }

    const viewport = doc.querySelector('meta[name="viewport"]')?.getAttribute('content') || ''
    if (/user-scalable\s*=\s*(no|0)/i.test(viewport) || /maximum-scale\s*=\s*1(\.0)?\b/i.test(viewport)) {
        add('error', 'WCAG 1.4.4', 'Lo zoom è disabilitato dal meta viewport.', [], STRUCTURE_FIXES.zoom)
    }

    const headings = [...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    const h1 = headings.filter((h) => h.tagName === 'H1').length
    if (h1 === 0) add('warning', 'WCAG 1.3.1', 'Nessun titolo <h1> trovato.', [], STRUCTURE_FIXES.h1)
    if (h1 > 1) add('warning', 'WCAG 1.3.1', `Sono presenti ${h1} titoli <h1>.`, [], STRUCTURE_FIXES.h1)

    const skips = []
    let prev = 0
    headings.forEach((h) => {
        const level = Number(h.tagName[1])
        if (prev && level > prev + 1) {
            skips.push(`h${prev} → h${level}: ${h.textContent.trim().slice(0, 50)}`)
        }
        prev = level
    })
    if (skips.length) add('warning', 'WCAG 1.3.1', 'Salti nella gerarchia dei titoli.', skips, STRUCTURE_FIXES.headings)

    const noAlt = [...doc.querySelectorAll('img:not([alt])')]
        .filter((img) => img.getAttribute('role') !== 'presentation')
        .map((img) => img.getAttribute('src') || '(senza src)')
    if (noAlt.length) add('error', 'WCAG 1.1.1', 'Immagini senza attributo alt.', noAlt, STRUCTURE_FIXES.alt)

    const unlabeled = [...doc.querySelectorAll('input, select, textarea')]
        .filter((f) => {
            const type = (f.getAttribute('type') || '').toLowerCase()
            if (['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) return false
            if (f.getAttribute('aria-label') || f.getAttribute('aria-labelledby') || f.getAttribute('title')) return false
            if (f.closest('label')) return false
            if (f.id && doc.querySelector(`label[for="${CSS.escape(f.id)}"]`)) return false
            return true
        })
        .map((f) => describe(f))
    if (unlabeled.length) add('error', 'WCAG 1.3.1 / 4.1.2', 'Campi del modulo senza etichetta.', unlabeled, STRUCTURE_FIXES.label)

    const hasName = (el) =>
        el.textContent.trim() ||
        el.getAttribute('aria-label') ||
        el.getAttribute('aria-labelledby') ||
        el.getAttribute('title') ||
        el.querySelector('img[alt]:not([alt=""])')

    const emptyLinks = [...doc.querySelectorAll('a[href]')]
        .filter((a) => !hasName(a))
        .map((a) => a.getAttribute('href'))
    if (emptyLinks.length) add('error', 'WCAG 2.4.4', 'Link senza nome accessibile.', emptyLinks, STRUCTURE_FIXES.link)

    const emptyButtons = [...doc.querySelectorAll('button, [role="button"]')]
        .filter((b) => !hasName(b))
        .map((b) => describe(b))
    if (emptyButtons.length) add('error', 'WCAG 4.1.2', 'Pulsanti senza nome accessibile.', emptyButtons, STRUCTURE_FIXES.button)

    return issues
}

function checkVision(pairs) {
    const sorted = [...pairs].sort((a, b) => b.count - a.count).slice(0, 80)
    const result = {}

    Object.keys(VISION_MATRICES).forEach((type) => {
        result[type] = sorted
            .map((p) => {
                const sf = simulateHex(p.fg, type)
                const sb = simulateHex(p.bg, type)
                const ratio = getContrastRatio(sf, sb)
                const threshold = p.large ? 3 : 4.5

                return {
                    ...p,
                    simFg: sf,
                    simBg: sb,
                    simRatio: ratio,
                    // peggiora in modo significativo e scende sotto soglia
                    newlyFailing: p.ratio >= threshold && ratio < threshold,
                    drop: p.ratio - ratio,
                }
            })
            .filter((p) => p.newlyFailing)
    })

    return result
}

/* ---------- entry point ---------- */

export async function analyzeSite(rawUrl, onProgress = () => {}) {
    const url = normalizeUrl(rawUrl)

    onProgress('Scarico la pagina…')
    const page = await fetchRemote(url)
    const finalUrl = page.finalUrl || url

    if (!/html/i.test(page.contentType || '')) {
        throw new Error('L\'indirizzo non restituisce una pagina HTML.')
    }

    const doc = new DOMParser().parseFromString(page.body, 'text/html')

    const blocked =
        page.status >= 400 ||
        /^(attention required|just a moment|access denied|forbidden|are you a robot|verifying you are human)/i.test(
            doc.title.trim()
        )
    if (blocked) {
        throw new Error(
            'Il sito ha rifiutato la richiesta (protezione anti-bot o accesso negato), quindi non posso analizzarlo.'
        )
    }

    // Controlli strutturali sul documento originale
    const structure = checkStructure(doc)

    onProgress('Scarico i fogli di stile…')
    const links = [...doc.querySelectorAll('link[rel~="stylesheet"][href]')].slice(0, MAX_STYLESHEETS)

    const styles = await Promise.all(
        links.map(async (link) => {
            try {
                const href = new URL(link.getAttribute('href'), finalUrl).href
                const css = await fetchRemote(href)
                return absolutizeCssUrls(css.body, href)
            } catch {
                return ''
            }
        })
    )

    // Prepara il documento per il rendering statico (niente script, niente risorse attive)
    const render = doc.cloneNode(true)
    render.querySelectorAll('script, noscript, iframe, object, embed, link, meta[http-equiv="refresh"], base').forEach((n) => n.remove())
    render.querySelectorAll('img, video, audio, source, picture').forEach((n) => {
        n.removeAttribute('src')
        n.removeAttribute('srcset')
    })
    render.querySelectorAll('style').forEach((s) => {
        s.textContent = absolutizeCssUrls(s.textContent, finalUrl)
    })
    render.querySelectorAll('[style]').forEach((n) => {
        n.setAttribute('style', absolutizeCssUrls(n.getAttribute('style'), finalUrl))
    })

    const injected = render.createElement('style')
    injected.textContent = styles.join('\n')
    render.head.prepend(injected)

    onProgress('Calcolo i colori…')
    const iframe = document.createElement('iframe')
    iframe.setAttribute('sandbox', 'allow-same-origin')
    iframe.setAttribute('aria-hidden', 'true')
    iframe.tabIndex = -1
    iframe.style.cssText = 'position:fixed;left:-99999px;top:0;width:1280px;height:800px;border:0;visibility:hidden'
    iframe.srcdoc = '<!doctype html>' + render.documentElement.outerHTML
    document.body.appendChild(iframe)

    try {
        await waitForLoad(iframe)

        const win = iframe.contentWindow
        const body = iframe.contentDocument.body

        const contrast = checkContrast(body, win)
        const colorOnlyLinks = checkColorOnlyLinks(body, win)
        const vision = checkVision(contrast.pairs)

        const failing = contrast.pairs
            .filter((p) => p.ratio < (p.large ? 3 : 4.5))
            .sort((a, b) => b.count - a.count)

        const withFix = (p) => ({ ...p, fix: suggestTextColor(p.fg, p.bg, p.large) })
        const failingWithFix = failing.slice(0, 25).map(withFix)
        Object.keys(vision).forEach((type) => {
            vision[type] = vision[type].slice(0, 25).map(withFix)
        })

        const palette = [...contrast.pairs]
            .sort((a, b) => b.count - a.count)
            .slice(0, 8)

        return {
            url,
            finalUrl,
            title: doc.title.trim(),
            stylesheets: { found: links.length, loaded: styles.filter(Boolean).length },
            contrast: {
                checked: contrast.checked,
                skippedImages: contrast.skippedImages,
                failing: failingWithFix,
                failingCount: failing.length,
                total: contrast.pairs.length,
            },
            vision,
            colorOnlyLinks,
            structure,
            palette,
        }
    } finally {
        iframe.remove()
    }
}
