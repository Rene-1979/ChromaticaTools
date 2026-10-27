import { useState } from 'react'
import ExportPanel from './ExportPanel'

const initialStops = [
    { id: 1, color: '#6366F1', position: 0 },
    { id: 2, color: '#EC4899', position: 100 },
]

function GradientGenerator({ isDark }) {
    const [type, setType] = useState('linear')
    const [angle, setAngle] = useState(135)
    const [stops, setStops] = useState(initialStops)
    const [nextId, setNextId] = useState(3)
    const [copied, setCopied] = useState(false)
    const [hexInputs, setHexInputs] = useState({})

    const textColor = isDark ? 'text-white' : 'text-gray-900'
    const mutedColor = isDark ? 'text-gray-400' : 'text-gray-600'
    const cardColor = isDark
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    const inputColor = isDark
        ? 'bg-gray-900 border-gray-600 text-white'
        : 'bg-white border-gray-300 text-gray-900'

    // Ordinati per posizione: servono SOLO per costruire il CSS.
    // La lista dei controlli usa invece `stops` (ordine di creazione),
    // così le schede non si riordinano mentre trascini uno slider.
    const sortedStops = [...stops].sort(
        (a, b) => a.position - b.position
    )

    const stopString = sortedStops
        .map((stop) => `${stop.color} ${stop.position}%`)
        .join(', ')

    let backgroundImage

    if (type === 'linear') {
        backgroundImage = `linear-gradient(${angle}deg, ${stopString})`
    } else if (type === 'radial') {
        backgroundImage = `radial-gradient(circle, ${stopString})`
    } else {
        // Costruisce una sfumatura circolare continua.
        // Ogni colore raggiunge il successivo e l'ultimo
        // ritorna gradualmente al primo colore.
        const firstColor = sortedStops[0].color

        const middleStops = sortedStops
            .slice(1)
            .map((stop) => ({
                color: stop.color,
                position: stop.position * 1.8,
            }))

        const conicStops = [
            `${firstColor} 0deg`,
            ...middleStops.map(
                (stop) => `${stop.color} ${stop.position}deg`
            ),
            `${firstColor} 360deg`,
        ]

        backgroundImage = `conic-gradient(from ${angle}deg, ${conicStops.join(', ')})`
    }

    const cssCode = `background: ${backgroundImage};`

    function updateStop(id, changes) {
        setStops((currentStops) =>
            currentStops.map((stop) =>
                stop.id === id ? { ...stop, ...changes } : stop
            )
        )
        setCopied(false)
    }

    function updateHexInput(id, value) {
        const normalized = value.startsWith('#')
            ? value.toUpperCase()
            : `#${value.toUpperCase()}`

        setHexInputs((current) => ({
            ...current,
            [id]: normalized,
        }))

        if (/^#[0-9A-F]{6}$/.test(normalized)) {
            updateStop(id, { color: normalized })
        }
    }

    function commitHexInput(id) {
        const stop = stops.find((item) => item.id === id)

        setHexInputs((current) => {
            const next = { ...current }
            delete next[id]
            return next
        })

        if (stop) {
            setHexInputs((current) => ({
                ...current,
                [id]: stop.color,
            }))
        }
    }

    function addStop() {
        if (stops.length >= 8) return

        const position = Math.round(
            stops.reduce((sum, stop) => sum + stop.position, 0) /
                stops.length
        )

        const newStop = {
            id: nextId,
            color: '#22C55E',
            position,
        }

        setStops((currentStops) => [...currentStops, newStop])
        setNextId((id) => id + 1)
        setCopied(false)
    }

    function removeStop(id) {
        if (stops.length <= 2) return

        setStops((currentStops) =>
            currentStops.filter((stop) => stop.id !== id)
        )

        setHexInputs((current) => {
            const next = { ...current }
            delete next[id]
            return next
        })

        setCopied(false)
    }

    async function copyCss() {
        try {
            await navigator.clipboard.writeText(cssCode)
            setCopied(true)
        } catch {
            setCopied(false)
        }
    }

    function resetGradient() {
        setType('linear')
        setAngle(135)
        setStops(initialStops.map((stop) => ({ ...stop })))
        setNextId(3)
        setHexInputs({})
        setCopied(false)
    }

    return (
        <section className={`space-y-6 ${textColor}`}>
            <div>
                <h2 className="text-3xl font-bold">
                    Generatore di gradienti
                </h2>
                <p className={`mt-3 text-base leading-relaxed ${mutedColor}`}>
                    Crea sfumature personalizzate, regola i colori e copia
                    il CSS da utilizzare nei tuoi progetti.
                </p>
            </div>

            {/* Anteprima */}
            <div className={`overflow-hidden rounded-2xl border ${cardColor}`}>
                <div
                    className="min-h-64 w-full sm:min-h-80"
                    style={{ backgroundImage }}
                    role="img"
                    aria-label="Anteprima del gradiente personalizzato"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                    <div>
                        <p className="text-lg font-semibold">
                            Anteprima live
                        </p>
                        <p className={`mt-1 text-base ${mutedColor}`}>
                            {stops.length} colori · {type === 'linear'
                                ? `Lineare · ${angle}°`
                                : type === 'radial'
                                    ? 'Radiale'
                                    : `Conico · ${angle}°`}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={resetGradient}
                        className="rounded-lg border border-gray-500 px-5 py-3 text-base font-medium hover:opacity-80"
                    >
                        Ripristina
                    </button>
                </div>
            </div>

            {/* Tipo di gradiente */}
            <div className={`rounded-2xl border p-5 sm:p-6 ${cardColor}`}>
                <h3 className="mb-5 text-xl font-semibold">
                    Tipo di gradiente
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                        {
                            id: 'linear',
                            label: 'Lineare',
                            description: 'Sfumatura in una direzione',
                        },
                        {
                            id: 'radial',
                            label: 'Radiale',
                            description: 'Sfumatura dal centro',
                        },
                        {
                            id: 'conic',
                            label: 'Conico',
                            description: 'Sfumatura circolare',
                        },
                    ].map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                setType(item.id)
                                setCopied(false)
                            }}
                            className={`rounded-xl border p-4 text-left transition ${
                                type === item.id
                                    ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                                    : isDark
                                        ? 'border-gray-600 hover:border-gray-400'
                                        : 'border-gray-300 hover:border-gray-500'
                            }`}
                            aria-pressed={type === item.id}
                        >
                            <span className="block text-base font-semibold">
                                {item.label}
                            </span>
                            <span className={`mt-2 block text-base leading-relaxed ${mutedColor}`}>
                                {item.description}
                            </span>
                        </button>
                    ))}
                </div>

                {type !== 'radial' && (
                    <div className="mt-6">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <label
                                htmlFor="gradient-angle"
                                className="text-base font-medium"
                            >
                                {type === 'linear'
                                    ? 'Angolo'
                                    : 'Rotazione iniziale'}
                            </label>
                            <span className="font-mono text-base font-semibold">
                                {angle}°
                            </span>
                        </div>

                        <input
                            id="gradient-angle"
                            type="range"
                            min="0"
                            max="360"
                            value={angle}
                            onChange={(event) => {
                                setAngle(Number(event.target.value))
                                setCopied(false)
                            }}
                            className="w-full accent-indigo-500"
                        />

                        <div className={`flex justify-between text-sm ${mutedColor}`}>
                            <span>0°</span>
                            <span>180°</span>
                            <span>360°</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Gestione dei colori */}
            <div className={`rounded-2xl border p-5 sm:p-6 ${cardColor}`}>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="text-xl font-semibold">
                            Colori del gradiente
                        </h3>
                        <p className={`mt-2 text-base ${mutedColor}`}>
                            Puoi utilizzare da 2 a 8 colori.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={addStop}
                        disabled={stops.length >= 8}
                        className="rounded-lg bg-indigo-600 px-5 py-3 text-base font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        + Aggiungi colore
                    </button>
                </div>

                <div className="space-y-4">
                    {stops.map((stop, index) => (
                        <div
                            key={stop.id}
                            className={`rounded-xl border p-4 sm:p-5 ${
                                isDark ? 'border-gray-700' : 'border-gray-200'
                            }`}
                        >
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h4 className="text-base font-semibold">
                                    Colore {index + 1}
                                </h4>

                                <button
                                    type="button"
                                    onClick={() => removeStop(stop.id)}
                                    disabled={stops.length <= 2}
                                    className="text-base font-medium text-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
                                    aria-label={`Rimuovi colore ${index + 1}`}
                                >
                                    Rimuovi
                                </button>
                            </div>

                            <div className="grid grid-cols-1 items-center gap-5 sm:grid-cols-[auto_1fr]">
                                <div className="flex flex-wrap items-center gap-3">
                                    <input
                                        type="color"
                                        value={stop.color}
                                        onChange={(event) => {
                                            updateStop(stop.id, {
                                                color: event.target.value.toUpperCase(),
                                            })
                                            setHexInputs((current) => ({
                                                ...current,
                                                [stop.id]: event.target.value.toUpperCase(),
                                            }))
                                        }}
                                        aria-label={`Selettore colore ${index + 1}`}
                                        className="h-14 w-16 cursor-pointer rounded-lg border-0 bg-transparent"
                                    />

                                    <input
                                        type="text"
                                        value={hexInputs[stop.id] ?? stop.color}
                                        onChange={(event) =>
                                            updateHexInput(stop.id, event.target.value)
                                        }
                                        onBlur={() => commitHexInput(stop.id)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                event.currentTarget.blur()
                                            }
                                        }}
                                        aria-label={`Codice HEX colore ${index + 1}`}
                                        maxLength={7}
                                        spellCheck={false}
                                        className={`w-36 rounded-lg border px-4 py-3 text-base font-mono ${inputColor}`}
                                    />
                                </div>

                                <div>
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <label
                                            htmlFor={`gradient-position-${stop.id}`}
                                            className={`text-base ${mutedColor}`}
                                        >
                                            Posizione
                                        </label>
                                        <span className="font-mono text-base font-semibold">
                                            {stop.position}%
                                        </span>
                                    </div>

                                    <input
                                        id={`gradient-position-${stop.id}`}
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={stop.position}
                                        onChange={(event) =>
                                            updateStop(stop.id, {
                                                position: Number(event.target.value),
                                            })
                                        }
                                        className="w-full accent-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Codice CSS */}
            <div className={`rounded-2xl border p-5 sm:p-6 ${cardColor}`}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold">
                        Codice CSS
                    </h3>

                    <button
                        type="button"
                        onClick={copyCss}
                        className="rounded-lg bg-indigo-600 px-5 py-3 text-base font-medium text-white hover:bg-indigo-500"
                    >
                        {copied ? 'Copiato!' : 'Copia CSS'}
                    </button>
                </div>

                <pre
                    className={`overflow-x-auto whitespace-pre-wrap break-all rounded-xl p-4 text-base leading-relaxed ${
                        isDark
                            ? 'bg-gray-950 text-green-300'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                >
                    <code>{cssCode}</code>
                </pre>

                <p className={`mt-4 text-base leading-relaxed ${mutedColor}`}>
                    Il codice si aggiorna automaticamente quando modifichi
                    tipo, colori, posizioni o angolo.
                </p>
            </div>

            <ExportPanel
                id="gradient-export"
                page="gradienti"
                colors={stops.map((stop, index) => ({
                    label: `Colore ${index + 1}`,
                    hex: stop.color,
                }))}
                isDark={isDark}
            />
        </section>
    )
}

export default GradientGenerator
