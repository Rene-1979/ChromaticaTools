import { useEffect, useState } from 'react'
import ExportPanel from './ExportPanel'

const VISION_TYPES = [
    { id: 'normal', label: 'Visione normale' },
    { id: 'protanopia', label: 'Protanopia' },
    { id: 'deuteranopia', label: 'Deuteranopia' },
    { id: 'tritanopia', label: 'Tritanopia' },
]

function hexToRgb(hex) {
    const clean = hex.replace('#', '')

    if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
        return { r: 255, g: 255, b: 255 }
    }

    return {
        r: parseInt(clean.slice(0, 2), 16),
        g: parseInt(clean.slice(2, 4), 16),
        b: parseInt(clean.slice(4, 6), 16),
    }
}

function rgbToHex({ r, g, b }) {
    return (
        '#' +
        [r, g, b]
            .map((value) =>
                Math.round(Math.max(0, Math.min(255, value)))
                    .toString(16)
                    .padStart(2, '0')
            )
            .join('')
    ).toUpperCase()
}

function simulateVision(hex, type) {
    const rgb = hexToRgb(hex)

    const matrices = {
        protanopia: [
            [0.152286, 1.052583, -0.204868],
            [0.114503, 0.786281, 0.099216],
            [-0.003882, -0.048116, 1.051998],
        ],
        deuteranopia: [
            [0.367322, 0.860646, -0.227968],
            [0.280085, 0.672501, 0.047413],
            [-0.011820, 0.042940, 0.968881],
        ],
        tritanopia: [
            [1.255528, -0.076749, -0.178779],
            [-0.078411, 0.930809, 0.147602],
            [0.004733, 0.691367, 0.303900],
        ],
    }

    if (type === 'normal') return hex

    const matrix = matrices[type]
    const values = [rgb.r, rgb.g, rgb.b]

    const result = matrix.map((row) =>
        row.reduce(
            (sum, coefficient, index) =>
                sum + coefficient * values[index],
            0
        )
    )

    return rgbToHex({
        r: result[0],
        g: result[1],
        b: result[2],
    })
}

function ColorField({ label, value, onChange, isDark }) {
    const [hexInput, setHexInput] = useState(value)
    const [error, setError] = useState(false)

    useEffect(() => {
        setHexInput(value)
        setError(false)
    }, [value])

    function handleHexChange(input) {
        setHexInput(input)
        const normalized = input.startsWith('#') ? input : `#${input}`

        if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
            setError(false)
            onChange(normalized.toUpperCase())
        } else {
            setError(true)
        }
    }

    return (
        <div className="min-w-0">
            <label className="mb-2 block text-base font-semibold">
                {label}
            </label>

            <div
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                    isDark
                        ? 'border-slate-700 bg-slate-950'
                        : 'border-slate-200 bg-slate-50'
                }`}
            >
                <input
                    type="color"
                    value={value}
                    onChange={(event) => {
                        onChange(event.target.value.toUpperCase())
                        setHexInput(event.target.value.toUpperCase())
                        setError(false)
                    }}
                    aria-label={`${label}: seleziona colore`}
                    className="h-12 w-12 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent"
                />

                <div className="min-w-0 flex-1">
                    <input
                        type="text"
                        value={hexInput}
                        onChange={(event) => handleHexChange(event.target.value)}
                        onBlur={() => {
                            if (error) {
                                setHexInput(value)
                                setError(false)
                            }
                        }}
                        aria-label={`${label}: codice HEX`}
                        aria-invalid={error}
                        maxLength={7}
                        spellCheck={false}
                        className={`w-full rounded-lg border bg-transparent px-3 py-2.5 font-mono text-base uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            error
                                ? 'border-red-500'
                                : isDark
                                    ? 'border-slate-700'
                                    : 'border-slate-300'
                        }`}
                    />

                    <p
                        className={`mt-2 text-sm ${
                            isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}
                    >
                        {error
                            ? 'Inserisci un HEX valido, es. #336699.'
                            : 'Codice HEX'}
                    </p>
                </div>
            </div>
        </div>
    )
}

function Accessibility({
    foreground,
    setForeground,
    background,
    setBackground,
    isDark,
}) {
    const [vision, setVision] = useState('normal')

    const surface = isDark
        ? 'border-slate-800 bg-slate-900'
        : 'border-slate-200 bg-white'

    const muted = isDark ? 'text-slate-300' : 'text-slate-700'

    const colors = [
        { name: 'Rosso', hex: '#E63946' },
        { name: 'Verde', hex: '#2A9D8F' },
        { name: 'Blu', hex: '#4361EE' },
        { name: 'Giallo', hex: '#FFBE0B' },
        { name: 'Viola', hex: '#8338EC' },
        { name: 'Arancione', hex: '#FB5607' },
    ]

    const transformedForeground = simulateVision(foreground, vision)
    const transformedBackground = simulateVision(background, vision)

    const selectedVisionLabel =
        VISION_TYPES.find((item) => item.id === vision)?.label ??
        'Visione normale'

    return (
        <section className="mx-auto max-w-5xl space-y-8 py-4">
            <header>
                <p className="text-base font-semibold uppercase tracking-widest text-indigo-500">
                    Chromatica Tools / Accessibilità
                </p>

                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                    Accessibilità cromatica
                </h2>

                <p className={`mt-4 max-w-3xl text-lg leading-relaxed ${muted}`}>
                    Scopri come i colori selezionati potrebbero apparire in
                    presenza di diverse forme di deficit della visione cromatica.
                    Per scegliere o modificare i colori e controllare il rapporto
                    di contrasto, usa la scheda Contrasto.
                </p>
            </header>

            {/* Selettori rapidi dei colori */}
            <div className={`rounded-2xl border p-5 sm:p-6 ${surface}`}>
                <div>
                    <h3 className="text-xl font-bold">
                        Colori da analizzare
                    </h3>

                    <p className={`mt-2 text-base leading-relaxed ${muted}`}>
                        Cambia qui testo e sfondo senza lasciare questa scheda.
                        I colori sono condivisi con Contrasto.
                    </p>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <ColorField
                        label="Colore del testo"
                        value={foreground}
                        onChange={setForeground}
                        isDark={isDark}
                    />

                    <ColorField
                        label="Colore dello sfondo"
                        value={background}
                        onChange={setBackground}
                        isDark={isDark}
                    />
                </div>
            </div>

            {/* Simulazione della visione cromatica */}
            <div className={`rounded-2xl border p-5 sm:p-7 ${surface}`}>
                <h3 className="text-xl font-bold sm:text-2xl">
                    Simulazione della visione dei colori
                </h3>

                <p className={`mt-3 text-base leading-relaxed ${muted}`}>
                    Seleziona una modalità per confrontare la combinazione di
                    testo e sfondo. La simulazione è indicativa e non è una
                    valutazione clinica.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                    {VISION_TYPES.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setVision(item.id)}
                            aria-pressed={vision === item.id}
                            className={`rounded-xl px-4 py-3 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                vision === item.id
                                    ? 'bg-indigo-600 text-white'
                                    : isDark
                                        ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div
                    className="mt-5 overflow-hidden rounded-xl border"
                    style={{
                        color: transformedForeground,
                        backgroundColor: transformedBackground,
                    }}
                >
                    <div className="p-8 text-center sm:p-12">
                        <p className="text-4xl font-bold sm:text-5xl">
                            Aa Bb Cc
                        </p>

                        <p className="mt-4 text-lg">
                            Esempio di testo e leggibilità
                        </p>

                        <p className="mt-3 text-base">
                            {selectedVisionLabel}
                        </p>
                    </div>
                </div>

                <div
                    className={`mt-4 rounded-xl border p-5 ${
                        isDark
                            ? 'border-slate-700 bg-slate-950'
                            : 'border-slate-200 bg-slate-50'
                    }`}
                >
                    <p className="text-base font-semibold">
                        Colori simulati
                    </p>

                    <p className={`mt-3 text-base ${muted}`}>
                        Testo:{' '}
                        <span className="font-mono font-semibold">
                            {transformedForeground}
                        </span>
                    </p>

                    <p className={`mt-2 text-base ${muted}`}>
                        Sfondo:{' '}
                        <span className="font-mono font-semibold">
                            {transformedBackground}
                        </span>
                    </p>
                </div>

                <p className={`mt-4 text-base leading-relaxed ${muted}`}>
                    Le simulazioni aiutano a individuare possibili differenze
                    nella percezione dei colori, ma non garantiscono da sole
                    l'accessibilità della combinazione.
                </p>
            </div>

            {/* Palette dimostrativa */}
            <div className={`rounded-2xl border p-5 sm:p-7 ${surface}`}>
                <h3 className="text-xl font-bold sm:text-2xl">
                    Come cambiano i colori
                </h3>

                <p className={`mt-3 text-base leading-relaxed ${muted}`}>
                    Confronta una palette di esempio nella modalità selezionata.
                    Puoi passare da una simulazione all'altra usando i pulsanti
                    qui sopra.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {colors.map((color) => {
                        const simulated = simulateVision(color.hex, vision)

                        return (
                            <div
                                key={color.hex}
                                className={`overflow-hidden rounded-xl border ${
                                    isDark
                                        ? 'border-slate-700'
                                        : 'border-slate-200'
                                }`}
                            >
                                <div
                                    className="h-24"
                                    style={{ backgroundColor: simulated }}
                                    aria-label={`Colore simulato ${color.name}`}
                                />

                                <div className="p-4">
                                    <p className="text-base font-semibold">
                                        {color.name}
                                    </p>

                                    <p className={`mt-2 font-mono text-base ${muted}`}>
                                        {simulated}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Esportazione */}
            <ExportPanel
                id="accessibility-export"
                page="accessibilita"
                colors={[
                    { label: 'Testo', hex: foreground },
                    { label: 'Sfondo', hex: background },
                ]}
                isDark={isDark}
            />

            {/* Buone pratiche */}
            <div className={`rounded-2xl border p-5 sm:p-7 ${surface}`}>
                <h3 className="text-xl font-bold sm:text-2xl">
                    Buone pratiche di accessibilità
                </h3>

                <ul className={`mt-5 space-y-5 text-base leading-relaxed ${muted}`}>
                    <li>
                        <strong className={isDark ? 'text-white' : 'text-slate-950'}>
                            Non affidarti soltanto al colore.
                        </strong>{' '}
                        Affianca etichette, icone o forme agli indicatori di
                        stato.
                    </li>

                    <li>
                        <strong className={isDark ? 'text-white' : 'text-slate-950'}>
                            Controlla il contrasto del testo.
                        </strong>{' '}
                        Come riferimento WCAG, punta ad almeno 4,5:1 per il
                        testo normale e 3:1 per il testo grande. Usa la scheda
                        Contrasto per verificare i valori della combinazione
                        scelta.
                    </li>

                    <li>
                        <strong className={isDark ? 'text-white' : 'text-slate-950'}>
                            Verifica tutti gli stati dell'interfaccia.
                        </strong>{' '}
                        Controlla anche pulsanti, bordi, campi, indicatori di
                        focus e messaggi, non soltanto il testo principale.
                    </li>

                    <li>
                        <strong className={isDark ? 'text-white' : 'text-slate-950'}>
                            Prova le combinazioni nel contesto reale.
                        </strong>{' '}
                        Una simulazione può aiutare a individuare criticità,
                        ma non sostituisce test di accessibilità più completi.
                    </li>
                </ul>
            </div>
        </section>
    )
}

export default Accessibility
