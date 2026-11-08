import { getPage } from '../content/pages.js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { extractColors } from '../utils/colorExtraction'
import { buildImagePalettes } from '../utils/harmonyFromImage'
import {
    ACCEPTED_TYPES,
    ImageLoadError,
    MAX_FILE_SIZE_LABEL,
    loadImage,
    sampleImagePixels,
    validateImageFile,
} from '../utils/imageSampling'
import ExportPanel from './ExportPanel'
import ImagePaletteCard from './ImagePaletteCard'

const GENERIC_ERROR =
    'Qualcosa è andato storto durante l\'analisi. Prova con un\'altra immagine.'

function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function ImagePalette({ isDark, onApplyPalette }) {
    const [analysis, setAnalysis] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [dragging, setDragging] = useState(false)
    const [selectedId, setSelectedId] = useState('')

    const runRef = useRef(0)
    const exportRef = useRef(null)

    const surface = isDark
        ? 'border-slate-800 bg-slate-900'
        : 'border-slate-200 bg-white'
    const muted = isDark ? 'text-slate-300' : 'text-slate-700'

    const processFile = useCallback(async (file) => {
        const runId = ++runRef.current
        setError('')

        try {
            validateImageFile(file)
        } catch (err) {
            setError(err.message)
            return
        }

        setLoading(true)
        const url = URL.createObjectURL(file)

        try {
            const image = await loadImage(url)

            // Lascia al browser il tempo di mostrare lo stato di caricamento.
            await wait(30)

            const colors = extractColors(sampleImagePixels(image))
            const built = buildImagePalettes(colors)

            if (runId !== runRef.current) {
                URL.revokeObjectURL(url)
                return
            }

            setAnalysis({
                url,
                fileName: file.name || 'Immagine incollata',
                width: image.naturalWidth,
                height: image.naturalHeight,
                colors,
                built,
            })
            setSelectedId('')
        } catch (err) {
            URL.revokeObjectURL(url)

            if (runId === runRef.current) {
                setError(err instanceof ImageLoadError ? err.message : GENERIC_ERROR)
            }
        } finally {
            if (runId === runRef.current) setLoading(false)
        }
    }, [])

    // Libera l'anteprima quando l'immagine cambia o la scheda si chiude.
    useEffect(() => {
        const url = analysis?.url

        return () => {
            if (url) URL.revokeObjectURL(url)
        }
    }, [analysis?.url])

    // Incolla da appunti (Ctrl+V / Cmd+V).
    useEffect(() => {
        function handlePaste(event) {
            const file = Array.from(event.clipboardData?.files ?? []).find(
                (item) => item.type.startsWith('image/')
            )

            if (!file) return

            event.preventDefault()
            processFile(file)
        }

        document.addEventListener('paste', handlePaste)
        return () => document.removeEventListener('paste', handlePaste)
    }, [processFile])

    // Porta l'utente al pannello di esportazione quando sceglie "Esporta".
    useEffect(() => {
        if (!selectedId || !exportRef.current) return

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        exportRef.current.focus({ preventScroll: true })
        exportRef.current.scrollIntoView({
            behavior: reduceMotion ? 'auto' : 'smooth',
            block: 'start',
        })
    }, [selectedId])

    function handleInputChange(event) {
        const file = event.target.files?.[0]
        event.target.value = ''

        if (file) processFile(file)
    }

    function handleDrop(event) {
        event.preventDefault()
        setDragging(false)

        const file = event.dataTransfer.files?.[0]
        if (file) processFile(file)
    }

    function handleDragLeave(event) {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setDragging(false)
        }
    }

    function removeImage() {
        runRef.current++
        setAnalysis(null)
        setSelectedId('')
        setError('')
        setLoading(false)
    }

    const groups = analysis?.built.groups ?? []
    const allPalettes = groups.flatMap((group) => group.palettes)
    const selectedPalette = allPalettes.find((palette) => palette.id === selectedId)

    let statusMessage = ''
    if (loading) {
        statusMessage = 'Analizzo i colori dell\'immagine…'
    } else if (analysis) {
        if (analysis.built.status === 'empty') {
            statusMessage = 'L\'immagine è completamente trasparente: non ci sono colori da analizzare.'
        } else if (analysis.built.status === 'grayscale') {
            statusMessage = 'L\'immagine è in scala di grigi: non ci sono tonalità su cui costruire un\'armonia. Prova con un\'immagine a colori.'
        } else {
            statusMessage = `Analisi completata: ${allPalettes.length} palette proposte.`
        }
    }

    return (
        <section className="mx-auto max-w-6xl space-y-8 py-4">
            <header className="max-w-5xl">
                <p className="text-base font-semibold uppercase tracking-widest text-indigo-500">
                    Chromatica Tools / Palette da immagine
                </p>

                <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{getPage('image-palette').h1}</h1>

                <p className={`mt-4 max-w-3xl text-lg leading-relaxed ${muted}`}>
                    Carica una foto o un logo: partendo dai suoi colori reali
                    ti proponiamo tre palette per ogni armonia cromatica.
                    Puoi controllarne il contrasto, esportarle o usarle nel
                    generatore di palette.
                </p>
            </header>

            {/* Caricamento */}
            <div
                onDragOver={(event) => event.preventDefault()}
                onDragEnter={(event) => {
                    event.preventDefault()
                    setDragging(true)
                }}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`rounded-2xl border p-5 sm:p-6 ${surface} ${
                    dragging ? 'border-indigo-500 ring-2 ring-indigo-500/40' : ''
                }`}
            >
                {analysis ? (
                    <div className="grid gap-6 md:grid-cols-[minmax(0,18rem)_1fr]">
                        <img
                            src={analysis.url}
                            alt={`Anteprima dell'immagine caricata: ${analysis.fileName}`}
                            className="max-h-64 w-full rounded-xl border border-slate-500/40 object-contain"
                        />

                        <div className="min-w-0">
                            <h3 className="text-xl font-bold">Colori trovati</h3>

                            <p className={`mt-1 break-all text-sm ${muted}`}>
                                {analysis.fileName} · {analysis.width}×{analysis.height} px
                            </p>

                            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Colori principali dell'immagine">
                                {analysis.colors.map((color) => (
                                    <li
                                        key={color.hex}
                                        className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm ${
                                            isDark
                                                ? 'border-slate-700 text-slate-200'
                                                : 'border-slate-200 text-slate-700'
                                        }`}
                                    >
                                        <span
                                            className="h-4 w-4 shrink-0 rounded-full border border-slate-400/50"
                                            style={{ backgroundColor: color.hex }}
                                            aria-hidden="true"
                                        />
                                        <span className="font-mono">{color.hex}</span>
                                        <span className={muted}>
                                            {Math.round(color.share * 100)}%
                                            {color.neutral ? ' · neutro' : ''}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-5 flex flex-wrap gap-3">
                                <label
                                    className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-within:ring-2 focus-within:ring-indigo-300"
                                >
                                    Sostituisci immagine
                                    <input
                                        type="file"
                                        accept={ACCEPTED_TYPES.join(',')}
                                        onChange={handleInputChange}
                                        className="sr-only"
                                    />
                                </label>

                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                        isDark
                                            ? 'border-slate-600 text-slate-100 hover:bg-slate-800'
                                            : 'border-slate-300 text-slate-800 hover:bg-slate-100'
                                    }`}
                                >
                                    Rimuovi
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <label
                        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-12 text-center transition-colors focus-within:ring-2 focus-within:ring-indigo-500 ${
                            dragging
                                ? 'border-indigo-500 bg-indigo-500/10'
                                : isDark
                                    ? 'border-slate-600 hover:bg-slate-800/60'
                                    : 'border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-10 w-10 text-indigo-500" aria-hidden="true">
                            <rect x="3" y="4" width="18" height="16" rx="3" />
                            <circle cx="9" cy="10" r="1.8" />
                            <path d="m4 18 5-5 4 4 3-3 4 4" />
                        </svg>

                        <span className="text-lg font-semibold">
                            Trascina qui un'immagine, clicca per sceglierla o incollala (Ctrl+V)
                        </span>

                        <span className={`text-sm ${muted}`}>
                            PNG, JPG, WebP, GIF, AVIF o BMP, fino a {MAX_FILE_SIZE_LABEL}.
                        </span>

                        <input
                            type="file"
                            accept={ACCEPTED_TYPES.join(',')}
                            onChange={handleInputChange}
                            className="sr-only"
                        />
                    </label>
                )}

                <p className={`mt-4 flex items-start gap-2 text-sm leading-relaxed ${muted}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
                        <rect x="5" y="11" width="14" height="9" rx="2" />
                        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                    </svg>
                    L'immagine non lascia il tuo dispositivo: viene analizzata
                    direttamente nel browser, senza alcun caricamento su server.
                </p>

                <div role="status" aria-live="polite" className="mt-3 text-base">
                    {loading && (
                        <p className={`flex items-center gap-3 ${muted}`}>
                            <span
                                className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent motion-reduce:animate-none"
                                aria-hidden="true"
                            />
                            {statusMessage}
                        </p>
                    )}

                    {!loading && analysis && analysis.built.status !== 'ok' && (
                        <p className={isDark ? 'text-amber-200' : 'text-amber-900'}>
                            {statusMessage}
                        </p>
                    )}

                    {!loading && analysis && analysis.built.status === 'ok' && (
                        <p className="sr-only">{statusMessage}</p>
                    )}
                </div>

                {error && (
                    <p role="alert" className={`mt-2 text-base ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                        {error}
                    </p>
                )}
            </div>

            {/* Palette proposte */}
            {analysis?.built.status === 'ok' && (
                <>
                    <p className={`max-w-4xl text-sm leading-relaxed ${muted}`}>
                        <strong>Come leggere i colori:</strong> «dall'immagine» è
                        un colore realmente presente nella foto; «calcolato» è il
                        colore teorico dell'armonia, usato quando nell'immagine
                        non ce n'è uno adatto. Clicca su un colore per copiare
                        il suo HEX.
                    </p>

                    {groups.map((group) => (
                        <section
                            key={group.id}
                            aria-labelledby={`image-harmony-${group.id}`}
                            className="space-y-4"
                        >
                            <h3
                                id={`image-harmony-${group.id}`}
                                className="text-2xl font-bold"
                            >
                                {group.label}
                            </h3>

                            {group.note && (
                                <p className={`text-sm ${muted}`}>{group.note}</p>
                            )}

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {group.palettes.map((palette) => (
                                    <ImagePaletteCard
                                        key={palette.id}
                                        palette={palette}
                                        isDark={isDark}
                                        isSelected={palette.id === selectedId}
                                        onApply={(item) =>
                                            onApplyPalette({
                                                colors: item.colors.map((color) => color.hex),
                                                harmony: item.harmonyId,
                                                base: item.baseHex,
                                            })
                                        }
                                        onExport={(item) => setSelectedId(item.id)}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}

                    {/* Esportazione della palette scelta */}
                    {selectedPalette && (
                        <div
                            ref={exportRef}
                            tabIndex={-1}
                            className="scroll-mt-6 space-y-3 outline-none"
                        >
                            <p className="text-base font-semibold" role="status">
                                Stai esportando: {groups.find((group) => group.id === selectedPalette.harmonyId)?.label}
                                {' · '}
                                {selectedPalette.baseLabel}
                            </p>

                            <ExportPanel
                                id="image-palette-export"
                                page="palette-da-immagine"
                                colors={selectedPalette.colors.map((color, index) => ({
                                    label: `Colore ${index + 1}`,
                                    hex: color.hex,
                                }))}
                                isDark={isDark}
                            />
                        </div>
                    )}
                </>
            )}
        </section>
    )
}

export default ImagePalette
