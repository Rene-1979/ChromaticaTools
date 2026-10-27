import { useState } from 'react'
import { buildExportOptions } from '../utils/exportFormats'

const buttonClass = `
    rounded-lg px-4 py-2.5 text-sm font-semibold
    transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500
`

/**
 * Pannello "Esporta" unico, usato in tutte le pagine.
 *
 * Riceve solo il nome della pagina e i colori scelti:
 *   <ExportPanel page="palette" colors={[{ label: 'Colore 1', hex: '#FF0000' }]} />
 * I formati (CSS, JSON, HTML) li costruisce exportFormats.js,
 * quindi sono identici ovunque.
 */
function ExportPanel({ id, page, colors, isDark }) {
    const title = 'Copia o scarica i colori'
    const intro = 'Scegli il formato, poi copia il codice negli appunti oppure scarica il file.'
    const options = buildExportOptions({ page, colors })

    const formats = Object.keys(options)

    const [format, setFormat] = useState(formats[0])
    const [status, setStatus] = useState('')

    const current = options[format] ?? options[formats[0]]
    const titleId = `${id}-title`

    async function copyCode() {
        try {
            await navigator.clipboard.writeText(current.code)
            setStatus(`${current.label} copiato negli appunti.`)
        } catch {
            setStatus(
                'Copia non riuscita. Verifica i permessi del browser e che il sito utilizzi HTTPS.'
            )
        }
    }

    function downloadCode() {
        const blob = new Blob([current.code], { type: current.mimeType })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = url
        link.download = current.filename
        document.body.appendChild(link)
        link.click()
        link.remove()

        setTimeout(() => URL.revokeObjectURL(url), 1000)

        setStatus(`${current.filename} scaricato.`)
    }

    return (
        <section
            aria-labelledby={titleId}
            className={`overflow-hidden rounded-2xl border ${
                isDark
                    ? 'border-slate-700 bg-gray-900'
                    : 'border-gray-200 bg-white shadow-sm'
            }`}
        >
            <div className="p-5 sm:p-6">
                <h3 id={titleId} className="text-2xl font-bold">
                    {title}
                </h3>

                {intro && (
                    <p className={`mt-2 text-base leading-relaxed ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                        {intro}
                    </p>
                )}

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {formats.map((key) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => {
                                setFormat(key)
                                setStatus('')
                            }}
                            aria-pressed={format === key}
                            className={`${buttonClass} ${
                                format === key
                                    ? 'bg-indigo-600 text-white'
                                    : isDark
                                        ? 'border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'
                                        : 'border border-gray-300 bg-gray-50 text-gray-800 hover:bg-gray-100'
                            }`}
                        >
                            {options[key].label}
                        </button>
                    ))}
                </div>

                <p className={`mt-4 text-sm ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                    {current.description}
                </p>
            </div>

            <div className={`border-t ${
                isDark ? 'border-slate-700' : 'border-gray-200'
            }`}>
                <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5 ${
                    isDark ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                    <div className="flex items-center gap-2">
                        <span className="flex gap-1.5" aria-hidden="true">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        </span>

                        <span className={`font-mono text-sm ${
                            isDark ? 'text-slate-300' : 'text-gray-600'
                        }`}>
                            {current.filename}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={copyCode}
                            className={`${buttonClass} bg-indigo-600 text-white hover:bg-indigo-500`}
                        >
                            Copia codice
                        </button>

                        <button
                            type="button"
                            onClick={downloadCode}
                            className={`${buttonClass} ${
                                isDark
                                    ? 'border border-slate-600 text-slate-100 hover:bg-slate-700'
                                    : 'border border-gray-300 text-gray-800 hover:bg-gray-100'
                            }`}
                        >
                            Scarica file
                        </button>
                    </div>
                </div>

                <pre
                    aria-label={`Anteprima del codice ${current.label}`}
                    tabIndex={0}
                    className={`max-h-[480px] min-h-48 overflow-auto p-5 text-sm leading-6 sm:p-6 ${
                        isDark
                            ? 'bg-gray-950 text-green-300'
                            : 'bg-gray-50 text-gray-800'
                    }`}
                >
                    <code>{current.code}</code>
                </pre>
            </div>

            <div
                className={`flex flex-wrap gap-2 border-t px-5 py-4 ${
                    isDark ? 'border-slate-700' : 'border-gray-200'
                }`}
                aria-label="Colori inclusi nell'esportazione"
            >
                {colors.map((color) => (
                    <span
                        key={color.label}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${
                            isDark
                                ? 'border-slate-700 text-slate-200'
                                : 'border-gray-200 text-gray-700'
                        }`}
                    >
                        <span
                            className="h-4 w-4 shrink-0 rounded-full border border-slate-400/50"
                            style={{ backgroundColor: color.hex }}
                            aria-hidden="true"
                        />
                        <span className="font-mono">{color.hex.toUpperCase()}</span>
                    </span>
                ))}
            </div>

            {status && (
                <div
                    role="status"
                    aria-live="polite"
                    className={`flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 text-sm ${
                        isDark
                            ? 'border-slate-700 bg-gray-800 text-slate-200'
                            : 'border-gray-200 bg-gray-50 text-gray-800'
                    }`}
                >
                    <span>{status}</span>

                    <button
                        type="button"
                        onClick={() => setStatus('')}
                        className="shrink-0 font-semibold text-indigo-500 hover:underline"
                    >
                        Chiudi
                    </button>
                </div>
            )}
        </section>
    )
}

export default ExportPanel
