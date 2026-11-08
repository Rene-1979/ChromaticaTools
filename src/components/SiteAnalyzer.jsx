import { getPage } from '../content/pages.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import { analyzeSite } from '../utils/siteAnalyzer'
import { VISION_LABELS } from '../utils/colorVision'
import { STRUCTURE_FIXES } from '../utils/siteFixes'

function Swatch({ fg, bg, label = 'Aa' }) {
    return (
        <span
            className="inline-flex h-10 w-14 shrink-0 items-center justify-center rounded-lg border border-slate-500/40 text-base font-bold"
            style={{ color: fg, backgroundColor: bg }}
            aria-hidden="true"
        >
            {label}
        </span>
    )
}

function CodeBlock({ code, isDark }) {
    return (
        <pre
            className={`mt-2 overflow-x-auto rounded-lg border p-3 font-mono text-sm ${
                isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-slate-50'
            }`}
        >
            <code>{code}</code>
        </pre>
    )
}

function FixBox({ title = 'Come risolvere', text, code, isDark, children }) {
    return (
        <div
            className={`mt-3 rounded-xl border p-4 ${
                isDark ? 'border-emerald-900 bg-emerald-950/40' : 'border-emerald-200 bg-emerald-50'
            }`}
        >
            <p className="text-sm font-bold">{title}</p>
            {text && <p className="mt-1 text-sm leading-relaxed">{text}</p>}
            {children}
            {code && <CodeBlock code={code} isDark={isDark} />}
        </div>
    )
}

const PAGE_WIDTH = 1280
const VIEW_HEIGHT = 460

function ShowButton({ targets, title, onShow, isDark }) {
    if (!targets?.length) return null

    return (
        <button
            type="button"
            onClick={() => onShow({ targets, title })}
            className={`mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isDark
                    ? 'border-slate-600 text-slate-100 hover:bg-slate-800'
                    : 'border-slate-300 text-slate-800 hover:bg-slate-100'
            }`}
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
            Mostra dove
        </button>
    )
}

function PreviewDialog({ snapshot, finalUrl, preview, onClose, isDark }) {
    const boxRef = useRef(null)
    const closeRef = useRef(null)
    const [scale, setScale] = useState(null)

    useEffect(() => {
        closeRef.current?.focus()

        function onKey(event) {
            if (event.key === 'Escape') onClose()
        }

        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [onClose])

    useEffect(() => {
        const box = boxRef.current
        if (!box) return

        const update = () =>
            setScale(Math.min(1, box.clientWidth / PAGE_WIDTH))

        update()
        const observer = new ResizeObserver(update)
        observer.observe(box)
        return () => observer.disconnect()
    }, [])

    const srcDoc = useMemo(() => {
        const selectors = preview.targets
            .map((id) => `[data-cc-id="${id}"]`)
            .join(',')
        const base = finalUrl.replace(/"/g, '&quot;')
        const injected =
            `<base href="${base}"><style>` +
            `html{pointer-events:none}` +
            `${selectors}{outline:4px solid #ef4444!important;outline-offset:3px!important;` +
            `box-shadow:0 0 0 8px rgba(239,68,68,.3)!important}` +
            `</style>`

        return snapshot.replace(/<head[^>]*>/i, (match) => match + injected)
    }, [snapshot, finalUrl, preview.targets])

    function handleLoad(event) {
        const frame = event.currentTarget
        const el = frame.contentDocument?.querySelector(
            `[data-cc-id="${preview.targets[0]}"]`
        )
        if (!el) return

        const rect = el.getBoundingClientRect()
        const visible = VIEW_HEIGHT / (scale || 1)
        frame.contentWindow.scrollTo(
            0,
            Math.max(0, rect.top + frame.contentWindow.scrollY - visible / 2 + rect.height / 2)
        )
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Anteprima del problema"
                onClick={(event) => event.stopPropagation()}
                className={`w-full max-w-5xl rounded-2xl border p-5 shadow-2xl ${
                    isDark
                        ? 'border-slate-700 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-900'
                }`}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h3 className="text-xl font-bold">Dove si trova il problema</h3>
                        <p className="mt-1 text-sm">
                            {preview.title}. Il riquadro rosso indica
                            {preview.targets.length > 1 ? ' gli elementi interessati' : " l'elemento interessato"}.
                        </p>
                    </div>
                    <button
                        ref={closeRef}
                        type="button"
                        onClick={onClose}
                        className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                    >
                        Chiudi
                    </button>
                </div>

                <div
                    ref={boxRef}
                    className="mt-4 overflow-hidden rounded-xl border border-slate-500/40 bg-white"
                    style={{ height: VIEW_HEIGHT }}
                >
                    {scale && (
                        <iframe
                            title="Anteprima della pagina con il problema evidenziato"
                            sandbox="allow-same-origin"
                            srcDoc={srcDoc}
                            onLoad={handleLoad}
                            style={{
                                width: PAGE_WIDTH,
                                height: VIEW_HEIGHT / scale,
                                border: 0,
                                background: '#fff',
                                transform: `scale(${scale})`,
                                transformOrigin: 'top left',
                            }}
                        />
                    )}
                </div>

                <p className="mt-3 text-sm">
                    Anteprima statica: gli script non vengono eseguiti, quindi
                    la pagina reale può avere un aspetto leggermente diverso.
                </p>
            </div>
        </div>
    )
}

function PairRow({ pair, simulated, muted, isDark, onShow }) {
    const fg = simulated ? pair.simFg : pair.fg
    const bg = simulated ? pair.simBg : pair.bg
    const ratio = simulated ? pair.simRatio : pair.ratio
    const threshold = pair.large ? 3 : 4.5

    return (
        <li className="flex items-start gap-4 py-4">
            <Swatch fg={fg} bg={bg} />
            <div className="min-w-0 flex-1">
                <p className="text-base font-semibold">
                    {ratio.toFixed(2)}:1{' '}
                    <span className={`font-normal ${muted}`}>
                        (richiesto {threshold}:1, {pair.large ? 'testo grande' : 'testo normale'})
                    </span>
                </p>
                <p className={`mt-1 font-mono text-sm ${muted}`}>
                    {fg} su {bg}
                    {simulated && ` · originale ${pair.fg} su ${pair.bg} = ${pair.ratio.toFixed(2)}:1`}
                </p>
                <p className={`mt-1 truncate text-sm ${muted}`}>
                    {pair.selector} · {pair.count} {pair.count === 1 ? 'elemento' : 'elementi'} · “{pair.sample}”
                </p>

                <ShowButton
                    targets={pair.targets}
                    title={`Testo “${pair.sample.slice(0, 40)}” con contrasto ${ratio.toFixed(2)}:1`}
                    onShow={onShow}
                    isDark={isDark}
                />

                {pair.fix && (
                    <FixBox
                        isDark={isDark}
                        text={`Cambia il colore del testo in ${pair.fix.color}: resta simile all'originale e raggiunge ${pair.fix.ratio.toFixed(2)}:1, anche con protanopia, deuteranopia e tritanopia.`}
                        code={`color: ${pair.fix.color}; /* era ${pair.fg} */`}
                    >
                        <p className="mt-2 flex items-center gap-3 text-sm">
                            <Swatch fg={pair.fix.color} bg={pair.bg} />
                            <span className="font-mono">{pair.fix.color} su {pair.bg}</span>
                        </p>
                    </FixBox>
                )}
            </div>
        </li>
    )
}

function SiteAnalyzer({ isDark }) {
    const [input, setInput] = useState('')
    const [status, setStatus] = useState('idle')
    const [progress, setProgress] = useState('')
    const [error, setError] = useState('')
    const [report, setReport] = useState(null)
    const [vision, setVision] = useState('protanopia')
    const [preview, setPreview] = useState(null)

    const surface = isDark
        ? 'border-slate-800 bg-slate-900'
        : 'border-slate-200 bg-white'
    const muted = isDark ? 'text-slate-300' : 'text-slate-700'
    const divider = isDark ? 'divide-slate-800' : 'divide-slate-200'

    async function handleSubmit(event) {
        event.preventDefault()
        setStatus('loading')
        setError('')
        setReport(null)
        setPreview(null)

        try {
            const result = await analyzeSite(input, setProgress)
            setReport(result)
            setStatus('done')
        } catch (err) {
            setError(err.message || 'Analisi non riuscita.')
            setStatus('error')
        }
    }

    const errors = report?.structure.filter((i) => i.severity === 'error').length ?? 0
    const warnings = report?.structure.filter((i) => i.severity === 'warning').length ?? 0

    return (
        <section className="mx-auto max-w-5xl space-y-8 py-4">
            <header>
                <p className="text-base font-semibold uppercase tracking-widest text-indigo-500">
                    Chromatica Tools / Analisi sito
                </p>
                <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{getPage('site').h1}</h1>
                <p className={`mt-4 max-w-3xl text-lg leading-relaxed ${muted}`}>
                    Inserisci l'indirizzo di una pagina: controlliamo il
                    contrasto dei testi, come cambiano i colori per chi ha un
                    deficit della visione cromatica e i principali problemi di
                    accessibilità.
                </p>
            </header>

            <form onSubmit={handleSubmit} className={`rounded-2xl border p-5 sm:p-6 ${surface}`}>
                <label htmlFor="site-url" className="mb-2 block text-base font-semibold">
                    Indirizzo della pagina
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                        id="site-url"
                        type="text"
                        inputMode="url"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="esempio.it"
                        spellCheck={false}
                        aria-describedby="site-url-help"
                        className={`min-w-0 flex-1 rounded-xl border bg-transparent px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            isDark ? 'border-slate-700' : 'border-slate-300'
                        }`}
                    />
                    <button
                        type="submit"
                        disabled={status === 'loading' || !input.trim()}
                        className="rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {status === 'loading' ? 'Analisi in corso…' : 'Analizza'}
                    </button>
                </div>
                <p id="site-url-help" className={`mt-3 text-sm ${muted}`}>
                    Analisi statica di HTML e CSS: gli script della pagina non
                    vengono eseguiti.
                </p>

                <div role="status" aria-live="polite" className="mt-3 text-base">
                    {status === 'loading' && <p className={muted}>{progress}</p>}
                    {status === 'error' && (
                        <p className={isDark ? 'text-red-300' : 'text-red-700'} role="alert">
                            {error}
                        </p>
                    )}
                </div>
            </form>

            {report && (
                <>
                    {/* Riepilogo */}
                    <div className={`rounded-2xl border p-5 sm:p-7 ${surface}`}>
                        <h3 className="text-xl font-bold sm:text-2xl">Riepilogo</h3>
                        <p className={`mt-2 break-all text-base ${muted}`}>
                            {report.title || '(senza titolo)'} · {report.finalUrl}
                        </p>

                        <dl className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {[
                                ['Coppie sotto soglia', report.contrast.failingCount],
                                ['Peggiorano col daltonismo', Object.values(report.vision).reduce((n, l) => n + l.length, 0)],
                                ['Errori strutturali', errors],
                                ['Avvisi', warnings + report.colorOnlyLinks.length],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className={`rounded-xl border p-4 ${
                                        isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-slate-50'
                                    }`}
                                >
                                    <dt className={`text-sm ${muted}`}>{label}</dt>
                                    <dd className="mt-1 text-3xl font-bold">{value}</dd>
                                </div>
                            ))}
                        </dl>

                        <p className={`mt-4 text-sm leading-relaxed ${muted}`}>
                            Controllate {report.contrast.checked} porzioni di testo
                            ({report.contrast.total} combinazioni di colore distinte).
                            {report.contrast.skippedImages > 0 &&
                                ` ${report.contrast.skippedImages} elementi su immagini di sfondo non sono verificabili automaticamente.`}{' '}
                            Fogli di stile caricati: {report.stylesheets.loaded}/{report.stylesheets.found}.
                            {report.contrast.checked < 5 &&
                                ' Pochi testi trovati: la pagina potrebbe essere generata via JavaScript.'}
                        </p>
                    </div>

                    {/* Contrasto */}
                    <div className={`rounded-2xl border p-5 sm:p-7 ${surface}`}>
                        <h3 className="text-xl font-bold sm:text-2xl">Contrasto del testo (WCAG AA)</h3>
                        {report.contrast.failing.length === 0 ? (
                            <p className={`mt-3 text-base ${muted}`}>
                                Nessuna combinazione sotto soglia tra quelle verificabili.
                            </p>
                        ) : (
                            <ul className={`mt-3 divide-y ${divider}`}>
                                {report.contrast.failing.slice(0, 25).map((pair) => (
                                    <PairRow key={`${pair.fg}${pair.bg}${pair.large}`} pair={pair} muted={muted} isDark={isDark} onShow={setPreview} />
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Daltonismo */}
                    <div className={`rounded-2xl border p-5 sm:p-7 ${surface}`}>
                        <h3 className="text-xl font-bold sm:text-2xl">Daltonismo</h3>
                        <p className={`mt-3 text-base leading-relaxed ${muted}`}>
                            Combinazioni che superano la soglia con visione normale
                            ma la perdono con il deficit selezionato. La
                            simulazione è indicativa.
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3">
                            {Object.entries(VISION_LABELS).map(([id, label]) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setVision(id)}
                                    aria-pressed={vision === id}
                                    className={`rounded-xl px-4 py-3 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                        vision === id
                                            ? 'bg-indigo-600 text-white'
                                            : isDark
                                                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                                    }`}
                                >
                                    {label} ({report.vision[id].length})
                                </button>
                            ))}
                        </div>

                        {report.vision[vision].length === 0 ? (
                            <p className={`mt-5 text-base ${muted}`}>
                                Nessuna combinazione peggiora sotto soglia con {VISION_LABELS[vision]}.
                            </p>
                        ) : (
                            <ul className={`mt-3 divide-y ${divider}`}>
                                {report.vision[vision].slice(0, 25).map((pair) => (
                                    <PairRow key={`${pair.fg}${pair.bg}${pair.large}`} pair={pair} simulated muted={muted} isDark={isDark} onShow={setPreview} />
                                ))}
                            </ul>
                        )}

                        <h4 className="mt-8 text-lg font-bold">Link distinguibili solo dal colore</h4>
                        {report.colorOnlyLinks.length === 0 ? (
                            <p className={`mt-2 text-base ${muted}`}>Nessun caso rilevato.</p>
                        ) : (
                            <ul className={`mt-2 divide-y ${divider}`}>
                                {report.colorOnlyLinks.slice(0, 15).map((l, i) => (
                                    <li key={i} className="flex items-start gap-4 py-4">
                                        <Swatch fg={l.linkHex} bg={l.textHex} />
                                        <div className="min-w-0">
                                            <p className="text-base font-semibold">“{l.text}”</p>
                                            <p className={`mt-1 text-sm ${muted}`}>
                                                Contrasto link/testo circostante {l.ratio.toFixed(2)}:1 (minimo 3:1)
                                                e nessuna sottolineatura (WCAG 1.4.1).
                                            </p>
                                            <ShowButton
                                                targets={l.targets}
                                                title={`Link “${l.text.slice(0, 40)}” distinguibile solo dal colore`}
                                                onShow={setPreview}
                                                isDark={isDark}
                                            />
                                            <FixBox
                                                isDark={isDark}
                                                text={STRUCTURE_FIXES.colorOnlyLink.text}
                                                code={STRUCTURE_FIXES.colorOnlyLink.code}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Struttura */}
                    <div className={`rounded-2xl border p-5 sm:p-7 ${surface}`}>
                        <h3 className="text-xl font-bold sm:text-2xl">Altri problemi di accessibilità</h3>
                        {report.structure.length === 0 ? (
                            <p className={`mt-3 text-base ${muted}`}>Nessun problema rilevato dai controlli automatici.</p>
                        ) : (
                            <ul className={`mt-3 divide-y ${divider}`}>
                                {report.structure.map((issue, i) => (
                                    <li key={i} className="py-4">
                                        <p className="text-base font-semibold">
                                            <span
                                                className={`mr-2 rounded-md px-2 py-0.5 text-sm ${
                                                    issue.severity === 'error'
                                                        ? isDark ? 'bg-red-950 text-red-200' : 'bg-red-100 text-red-900'
                                                        : isDark ? 'bg-amber-950 text-amber-200' : 'bg-amber-100 text-amber-900'
                                                }`}
                                            >
                                                {issue.severity === 'error' ? 'Errore' : 'Avviso'}
                                            </span>
                                            {issue.message}
                                            {issue.count > 0 && ` (${issue.count})`}
                                        </p>
                                        <p className={`mt-1 text-sm ${muted}`}>{issue.rule}</p>
                                        <ShowButton
                                            targets={issue.targets}
                                            title={issue.message.replace(/\.$/, '')}
                                            onShow={setPreview}
                                            isDark={isDark}
                                        />
                                        {issue.fix && (
                                            <FixBox isDark={isDark} text={issue.fix.text} code={issue.fix.code} />
                                        )}
                                        {issue.items.length > 0 && (
                                            <ul className={`mt-2 list-disc space-y-1 pl-5 font-mono text-sm ${muted}`}>
                                                {issue.items.map((item, j) => (
                                                    <li key={j} className="break-all">{item}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <p className={`mt-4 text-sm leading-relaxed ${muted}`}>
                            I controlli automatici coprono solo una parte dei
                            criteri WCAG e non sostituiscono una verifica manuale.
                        </p>
                    </div>
                </>
            )}

            {report && preview && (
                <PreviewDialog
                    snapshot={report.snapshot}
                    finalUrl={report.finalUrl}
                    preview={preview}
                    onClose={() => setPreview(null)}
                    isDark={isDark}
                />
            )}
        </section>
    )
}

export default SiteAnalyzer
