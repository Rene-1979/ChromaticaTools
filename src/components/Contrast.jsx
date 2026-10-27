import { useState } from 'react'
import { getContrastSuggestions } from '../utils/colorSuggestions'
import ExportPanel from './ExportPanel'

function Contrast({
    foreground,
    setForeground,
    background,
    setBackground,
    ratio,
    isDark,
}) {
    const [foregroundInput, setForegroundInput] = useState(foreground)
    const [backgroundInput, setBackgroundInput] = useState(background)
    const [lastForeground, setLastForeground] = useState(foreground)
    const [lastBackground, setLastBackground] = useState(background)

    if (foreground !== lastForeground) {
        setLastForeground(foreground)
        setForegroundInput(foreground)
    }

    if (background !== lastBackground) {
        setLastBackground(background)
        setBackgroundInput(background)
    }

    const inputClass = `
        min-w-0 w-36 rounded-lg border px-3 py-2.5
        font-mono text-base uppercase
        focus:outline-none focus:ring-2 focus:ring-teal-500
        ${isDark
            ? 'border-slate-600 bg-slate-900 text-white'
            : 'border-slate-300 bg-white text-slate-900'
        }
    `

    function updateHex(value, setInput, setColor) {
        const normalized = value.startsWith('#') ? value : `#${value}`
        setInput(normalized.toUpperCase())

        if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
            setColor(normalized.toUpperCase())
        }
    }

    function getStatus(value) {
        const numericValue = Number(value)

        return {
            aaNormal: numericValue >= 4.5,
            aaLarge: numericValue >= 3,
            aaaNormal: numericValue >= 7,
            aaaLarge: numericValue >= 4.5,
        }
    }

    const status = getStatus(ratio)

    const resultColor = status.aaNormal
        ? 'text-green-600'
        : status.aaLarge
            ? 'text-amber-600'
            : 'text-red-600'

    function StatusRow({ label, threshold, passed }) {
        return (
            <div className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                    <p className="text-base font-semibold">{label}</p>
                    <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Rapporto richiesto: {threshold}
                    </p>
                </div>

                <span
                    className={`rounded-md px-3 py-1.5 text-sm font-bold ${
                        passed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                >
                    {passed ? 'Superato' : 'Non superato'}
                </span>
            </div>
        )
    }

    let result = ''
    let description = ''

    if (status.aaaNormal) {
        result = 'Ottimo contrasto'
        description =
            'I colori rispettano i requisiti WCAG AAA sia per il testo normale sia per quello grande.'
    } else if (status.aaNormal) {
        result = 'Buon contrasto'
        description =
            'I colori rispettano i requisiti WCAG AA per il testo normale. Per raggiungere il livello AAA serve un contrasto maggiore.'
    } else if (status.aaLarge) {
        result = 'Adatto solo ai testi grandi'
        description =
            'Il contrasto è sufficiente per i testi grandi, ma non per quelli normali. Il livello AA per il testo normale non è raggiunto.'
    } else {
        result = 'Contrasto insufficiente'
        description =
            'Il contrasto non raggiunge il livello AA, nemmeno per i testi grandi. Prova a modificare uno dei colori oppure scegli un’alternativa qui sotto.'
    }

    const contrastRatio = Number(Number(ratio).toFixed(2))

    // Le sei alternative vengono rigenerate ogni volta che cambia il colore
    // del testo: scegliendone una, cambiano tutte.
    const displaySuggestions = getContrastSuggestions(foreground, background)

    return (
        <section
            className={`
                mx-auto mt-8 max-w-5xl space-y-8 px-4 pb-12
                ${isDark ? 'text-slate-100' : 'text-slate-900'}
            `}
        >
            <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                    <span className="text-base font-semibold">
                        Colore del testo
                    </span>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <input
                            type="color"
                            value={foreground}
                            onChange={(e) => setForeground(e.target.value.toUpperCase())}
                            aria-label="Scegli il colore del testo"
                            className="h-12 w-16 cursor-pointer rounded-lg border-0"
                        />

                        <input
                            type="text"
                            value={foregroundInput}
                            onChange={(e) =>
                                updateHex(e.target.value, setForegroundInput, setForeground)
                            }
                            onBlur={() => setForegroundInput(foreground.toUpperCase())}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') e.currentTarget.blur()
                            }}
                            aria-label="Codice HEX del colore del testo"
                            maxLength={7}
                            spellCheck={false}
                            className={inputClass}
                        />
                    </div>
                </label>

                <label className="block">
                    <span className="text-base font-semibold">
                        Colore dello sfondo
                    </span>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <input
                            type="color"
                            value={background}
                            onChange={(e) => setBackground(e.target.value.toUpperCase())}
                            aria-label="Scegli il colore dello sfondo"
                            className="h-12 w-16 cursor-pointer rounded-lg border-0"
                        />

                        <input
                            type="text"
                            value={backgroundInput}
                            onChange={(e) =>
                                updateHex(e.target.value, setBackgroundInput, setBackground)
                            }
                            onBlur={() => setBackgroundInput(background.toUpperCase())}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') e.currentTarget.blur()
                            }}
                            aria-label="Codice HEX del colore dello sfondo"
                            maxLength={7}
                            spellCheck={false}
                            className={inputClass}
                        />
                    </div>
                </label>
            </div>

            <div
                className="rounded-2xl border p-6 sm:p-10"
                style={{ color: foreground, backgroundColor: background }}
            >
                <div className="text-center">
                    <h2 className="text-3xl font-bold sm:text-4xl">
                        Anteprima del contrasto
                    </h2>

                    <p className="mt-4 text-lg leading-relaxed">
                        Ecco come si legge il testo con i colori scelti.
                        Modifica il testo o lo sfondo per verificare se il contrasto è sufficiente.
                    </p>
                </div>
            </div>

            <div
                aria-live="polite"
                className={`rounded-2xl border p-5 sm:p-6 ${
                    isDark
                        ? 'border-slate-700 bg-slate-900'
                        : 'border-slate-200 bg-white'
                }`}
            >
                <h3 className={`text-2xl font-bold ${resultColor}`}>
                    {result}
                </h3>

                <p className={`mt-3 text-base leading-relaxed ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                }`}>
                    {description}
                </p>

                <p className={`mt-4 text-lg font-semibold ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                }`}>
                    Rapporto di contrasto: {contrastRatio.toFixed(2)}:1
                </p>

                <div className={`mt-4 divide-y ${
                    isDark ? 'divide-slate-700' : 'divide-slate-200'
                }`}>
                    <StatusRow
                        label="WCAG AA, testo normale"
                        threshold="4,5:1"
                        passed={status.aaNormal}
                    />
                    <StatusRow
                        label="WCAG AA, testo grande"
                        threshold="3:1"
                        passed={status.aaLarge}
                    />
                    <StatusRow
                        label="WCAG AAA, testo normale"
                        threshold="7:1"
                        passed={status.aaaNormal}
                    />
                    <StatusRow
                        label="WCAG AAA, testo grande"
                        threshold="4,5:1"
                        passed={status.aaaLarge}
                    />
                </div>

                <p className={`mt-5 text-base leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                    Un testo è considerato grande quando misura almeno 18 pt,
                    oppure almeno 14 pt se è in grassetto.
                    Questi risultati valutano il contrasto tra testo e sfondo.
                </p>
            </div>

            <div>
                <div className="mb-5">
                    <h3 className="text-2xl font-bold">
                        Prova altri colori
                    </h3>

                    <p className={`mt-3 text-base leading-relaxed ${
                        isDark ? 'text-slate-200' : 'text-slate-700'
                    }`}>
                        Sei alternative con tonalità diverse, regolate per avere
                        un buon contrasto con lo sfondo corrente. Quando ne scegli
                        una, diventa il nuovo colore del testo e tutte le proposte
                        si rigenerano a partire da lei.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {displaySuggestions.map((suggestion) => {
                        const suggestionStatus = getStatus(suggestion.ratio)

                        let suggestionResult
                        let suggestionColor

                        if (suggestionStatus.aaaNormal) {
                            suggestionResult = 'Supera anche AAA'
                            suggestionColor = 'text-green-600'
                        } else if (suggestionStatus.aaNormal) {
                            suggestionResult = 'Supera AA'
                            suggestionColor = 'text-green-600'
                        } else if (suggestionStatus.aaLarge) {
                            suggestionResult = 'Adatto ai testi grandi'
                            suggestionColor = 'text-amber-600'
                        } else {
                            suggestionResult = 'Non supera AA'
                            suggestionColor = 'text-red-600'
                        }

                        return (
                            <button
                                key={suggestion.color}
                                type="button"
                                onClick={() => setForeground(suggestion.color)}
                                aria-label={`Prova il colore ${suggestion.color}. ${suggestionResult}`}
                                className={`overflow-hidden rounded-xl border text-left transition-transform duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                    isDark
                                        ? 'border-slate-700 bg-slate-900'
                                        : 'border-slate-200 bg-white'
                                }`}
                            >
                                <div
                                    className="flex min-h-36 flex-col items-center justify-center gap-2 p-4 text-center"
                                    style={{
                                        backgroundColor: background,
                                        color: suggestion.color,
                                    }}
                                >
                                    <span className="text-3xl font-bold">Aa</span>
                                    <span className="text-base font-medium">
                                        Esempio di testo
                                    </span>
                                </div>

                                <div className="space-y-3 p-4">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="h-6 w-6 shrink-0 rounded-full border border-slate-300"
                                            style={{ backgroundColor: suggestion.color }}
                                        />
                                        <span className="font-mono text-base font-semibold">
                                            {suggestion.color}
                                        </span>
                                    </div>

                                    <p className={`text-base font-semibold ${suggestionColor}`}>
                                        {suggestionResult}
                                    </p>

                                    <p className={`text-base ${
                                        isDark ? 'text-slate-300' : 'text-slate-700'
                                    }`}>
                                        Rapporto di contrasto: {suggestion.ratio.toFixed(2)}:1
                                    </p>

                                    <p className={`text-base leading-relaxed ${
                                        isDark ? 'text-slate-300' : 'text-slate-700'
                                    }`}>
                                        Testo normale, livello AA: {suggestionStatus.aaNormal ? 'superato' : 'non superato'}.
                                    </p>

                                    <span className="inline-block pt-1 text-base font-semibold text-teal-600">
                                        Prova questo colore →
                                    </span>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            <ExportPanel
                id="contrast-export"
                page="contrasto"
                colors={[
                    { label: 'Testo', hex: foreground },
                    { label: 'Sfondo', hex: background },
                ]}
                isDark={isDark}
            />
        </section>
    )
}

export default Contrast
