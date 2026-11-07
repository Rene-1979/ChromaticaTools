import { useState } from 'react'
import { checkPaletteContrast } from '../utils/paletteContrast'

const ROLE_LABELS = {
    base: 'Base',
    harmony: 'Armonia',
    neutral: 'Neutro',
}

const SOURCE_BADGES = {
    image: {
        label: "dall'immagine",
        title: "Questo colore è presente nell'immagine.",
    },
    computed: {
        label: 'calcolato',
        title:
            "Nell'immagine non c'è un colore adatto: è il colore teorico dell'armonia, con saturazione e luminosità adattate all'immagine.",
    },
}

function formatRatio(ratio) {
    return ratio.toFixed(1).replace('.', ',')
}

/**
 * Una palette proposta: barra dei colori, elenco con copia HEX,
 * mini-check WCAG (testo bianco o nero su ogni colore) e azioni.
 */
function ImagePaletteCard({ palette, isDark, isSelected, onApply, onExport }) {
    const [copied, setCopied] = useState('')
    const [copyError, setCopyError] = useState(false)

    const hexes = palette.colors.map((color) => color.hex)
    const contrast = checkPaletteContrast(hexes)

    const muted = isDark ? 'text-slate-300' : 'text-slate-700'

    async function copyHex(hex) {
        try {
            await navigator.clipboard.writeText(hex)
            setCopied(hex)
            setCopyError(false)
        } catch {
            setCopied('')
            setCopyError(true)
        }
    }

    function badgeClass(source) {
        if (source === 'computed') {
            return isDark
                ? 'bg-amber-950 text-amber-200'
                : 'bg-amber-100 text-amber-900'
        }

        return isDark
            ? 'bg-emerald-950 text-emerald-200'
            : 'bg-emerald-100 text-emerald-900'
    }

    return (
        <article
            aria-label={`Palette ${palette.baseLabel.toLowerCase()}`}
            className={`flex min-w-0 flex-col rounded-2xl border p-4 sm:p-5 ${
                isDark ? 'bg-slate-900' : 'bg-white'
            } ${
                isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/40'
                    : isDark
                        ? 'border-slate-800'
                        : 'border-slate-200'
            }`}
        >
            <p className="text-base font-semibold">{palette.baseLabel}</p>

            <div
                className="mt-3 flex h-14 overflow-hidden rounded-xl border border-slate-500/40"
                aria-hidden="true"
            >
                {palette.colors.map((color) => (
                    <span
                        key={`${color.role}-${color.hex}`}
                        className="min-w-0 flex-1"
                        style={{ backgroundColor: color.hex }}
                    />
                ))}
            </div>

            <ul className="mt-3 space-y-1">
                {palette.colors.map((color, index) => {
                    const row = contrast.rows[index]
                    const badge = SOURCE_BADGES[color.source]

                    return (
                        <li key={`${color.role}-${color.hex}`} className="flex items-center gap-3 py-1">
                            <button
                                type="button"
                                onClick={() => copyHex(color.hex)}
                                aria-label={`Copia il colore ${color.hex}`}
                                title={`Copia ${color.hex}`}
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-500/40 text-base font-bold transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                style={{ backgroundColor: color.hex, color: row.text }}
                            >
                                Aa
                            </button>

                            <div className="min-w-0 flex-1">
                                <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <span className="font-mono text-base font-semibold">
                                        {color.hex}
                                    </span>

                                    <span
                                        title={badge.title}
                                        className={`rounded-md px-2 py-0.5 text-xs font-semibold ${badgeClass(color.source)}`}
                                    >
                                        {badge.label}
                                    </span>

                                    <span className={`text-xs ${muted}`}>
                                        {ROLE_LABELS[color.role]}
                                    </span>
                                </p>

                                <p className={`mt-0.5 text-sm ${muted}`}>
                                    Testo {row.text === '#FFFFFF' ? 'bianco' : 'nero'}:{' '}
                                    {formatRatio(row.ratio)}:1 · {row.label}
                                </p>
                            </div>

                            {copied === color.hex && (
                                <span className="shrink-0 text-sm font-semibold text-indigo-500">
                                    Copiato!
                                </span>
                            )}
                        </li>
                    )
                })}
            </ul>

            <p className={`mt-3 text-sm leading-relaxed ${muted}`}>
                Leggibilità del testo (WCAG AA, 4,5:1): superata su{' '}
                {contrast.passing} di {contrast.total} colori.
            </p>

            {copyError && (
                <p role="alert" className="mt-2 text-sm text-red-500">
                    Impossibile copiare. Verifica i permessi degli appunti del browser.
                </p>
            )}

            <div className="mt-auto flex flex-wrap gap-2 pt-4">
                <button
                    type="button"
                    onClick={() => onApply(palette)}
                    className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                    Usa questa palette
                </button>

                <button
                    type="button"
                    onClick={() => onExport(palette)}
                    aria-pressed={isSelected}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        isSelected
                            ? 'border-indigo-500 bg-indigo-500/15 text-indigo-500'
                            : isDark
                                ? 'border-slate-600 text-slate-100 hover:bg-slate-800'
                                : 'border-slate-300 text-slate-800 hover:bg-slate-100'
                    }`}
                >
                    Esporta
                </button>
            </div>
        </article>
    )
}

export default ImagePaletteCard
