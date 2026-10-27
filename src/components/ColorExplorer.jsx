
import { useState } from 'react'
import { hexToHsl, hslToHex } from '../utils/colorConversions'

function normalizeHex(value) {
    let hex = value.trim().replace(/^#/, '')

    if (/^[0-9a-fA-F]{3}$/.test(hex)) {
        hex = hex
            .split('')
            .map((character) => character + character)
            .join('')
    }

    if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
        return null
    }

    return `#${hex.toUpperCase()}`
}

function ColorExplorer({ isDark }) {
    const [color, setColor] = useState('#6366F1')
    const [hexInput, setHexInput] = useState('#6366F1')
    const [copied, setCopied] = useState('')
    const [copyError, setCopyError] = useState(false)

    const normalizedColor = normalizeHex(color) || '#6366F1'

    const red = parseInt(normalizedColor.slice(1, 3), 16)
    const green = parseInt(normalizedColor.slice(3, 5), 16)
    const blue = parseInt(normalizedColor.slice(5, 7), 16)

    const hsl = hexToHsl(normalizedColor)

    const textColor = isDark ? 'text-white' : 'text-gray-900'
    const mutedColor = isDark ? 'text-gray-300' : 'text-gray-700'

    const cardColor = isDark
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'

    const inputColor = isDark
        ? 'bg-gray-900 border-gray-600 text-white'
        : 'bg-white border-gray-300 text-gray-900'

    function updateColor(value) {
        const normalized = normalizeHex(value)

        if (normalized) {
            setColor(normalized)
            setHexInput(normalized)
        }
    }

    function handleHexChange(value) {
        setHexInput(value)

        const normalized = normalizeHex(value)

        if (normalized) {
            setColor(normalized)
        }
    }

    async function copyColor(value) {
        try {
            await navigator.clipboard.writeText(value)
            setCopied(value)
            setCopyError(false)
        } catch {
            setCopied('')
            setCopyError(true)
        }
    }

    const variants = [-40, -25, -10, 10, 25, 40].map((change) => {
        const lightness = Math.max(
            0,
            Math.min(100, hsl.l + change)
        )

        return {
            change,
            hex: hslToHex(hsl.h, hsl.s, lightness),
            label: change < 0
                ? `Più scuro ${Math.abs(change)}%`
                : `Più chiaro ${change}%`,
        }
    })

    return (
        <section className={`space-y-8 ${textColor}`}>
            <div>
                <h2 className="text-3xl font-bold sm:text-4xl">
                    Esplora colori
                </h2>

                <p className={`mt-3 max-w-3xl text-lg leading-relaxed ${mutedColor}`}>
                    Analizza un colore, scopri i suoi valori e crea
                    varianti più chiare o più scure.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Anteprima e selezione del colore */}
                <div className={`overflow-hidden rounded-2xl border ${cardColor}`}>
                    <div
                        className="h-48 w-full sm:h-56"
                        style={{ backgroundColor: normalizedColor }}
                        aria-label={`Anteprima del colore ${normalizedColor}`}
                        role="img"
                    />

                    <div className="space-y-5 p-5 sm:p-6">
                        <label className="block text-base font-semibold">
                            Scegli un colore
                        </label>

                        <div className="flex flex-wrap items-center gap-3">
                            <input
                                type="color"
                                value={normalizedColor}
                                onChange={(event) =>
                                    updateColor(event.target.value)
                                }
                                aria-label="Selettore colore"
                                className="h-12 w-16 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent"
                            />

                            <input
                                type="text"
                                value={hexInput}
                                onChange={(event) =>
                                    handleHexChange(event.target.value)
                                }
                                onBlur={() => {
                                    const normalized = normalizeHex(hexInput)

                                    if (normalized) {
                                        setHexInput(normalized)
                                        setColor(normalized)
                                    } else {
                                        setHexInput(normalizedColor)
                                    }
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        const normalized = normalizeHex(hexInput)

                                        if (normalized) {
                                            setHexInput(normalized)
                                            setColor(normalized)
                                        } else {
                                            setHexInput(normalizedColor)
                                        }
                                    }
                                }}
                                aria-label="Codice HEX"
                                placeholder="#6366F1"
                                className={`min-w-0 flex-1 rounded-lg border px-3 py-3 font-mono text-base ${inputColor}`}
                            />

                            <button
                                type="button"
                                onClick={() => copyColor(normalizedColor)}
                                className="rounded-lg border border-gray-500 px-4 py-3 text-base font-semibold hover:opacity-80"
                            >
                                Copia
                            </button>
                        </div>

                        {copied === normalizedColor && (
                            <p className="text-base text-green-500">
                                Colore copiato!
                            </p>
                        )}

                        {copyError && (
                            <p className="text-base leading-relaxed text-red-500">
                                Copia non riuscita. Verifica i permessi
                                degli appunti del browser.
                            </p>
                        )}
                    </div>
                </div>

                {/* Valori del colore */}
                <div className={`rounded-2xl border p-5 sm:p-6 ${cardColor}`}>
                    <h3 className="mb-5 text-xl font-bold">
                        Valori del colore
                    </h3>

                    <div className="space-y-4">
                        <div className={`flex items-center justify-between gap-3 rounded-xl p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                            <div className="min-w-0">
                                <p className={`text-sm font-semibold ${mutedColor}`}>
                                    HEX
                                </p>
                                <p className="mt-1 break-all font-mono text-lg font-semibold">
                                    {normalizedColor}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => copyColor(normalizedColor)}
                                className="shrink-0 rounded-lg px-2 py-2 text-base font-semibold hover:underline"
                            >
                                Copia
                            </button>
                        </div>

                        <div className={`flex items-center justify-between gap-3 rounded-xl p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                            <div className="min-w-0">
                                <p className={`text-sm font-semibold ${mutedColor}`}>
                                    RGB
                                </p>
                                <p className="mt-1 break-words font-mono text-base sm:text-lg">
                                    {`rgb(${red}, ${green}, ${blue})`}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    copyColor(`rgb(${red}, ${green}, ${blue})`)
                                }
                                className="shrink-0 rounded-lg px-2 py-2 text-base font-semibold hover:underline"
                            >
                                Copia
                            </button>
                        </div>

                        <div className={`flex items-center justify-between gap-3 rounded-xl p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                            <div className="min-w-0">
                                <p className={`text-sm font-semibold ${mutedColor}`}>
                                    HSL
                                </p>
                                <p className="mt-1 break-words font-mono text-base sm:text-lg">
                                    {`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    copyColor(
                                        `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
                                    )
                                }
                                className="shrink-0 rounded-lg px-2 py-2 text-base font-semibold hover:underline"
                            >
                                Copia
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Varianti del colore */}
            <div>
                <h3 className="mb-3 text-2xl font-bold">
                    Varianti del colore
                </h3>

                <p className={`mb-5 text-base leading-relaxed ${mutedColor}`}>
                    Seleziona una variante per usarla come nuovo colore.
                    Puoi anche copiarne il codice HEX.
                </p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {variants.map((variant) => (
                        <div
                            key={variant.change}
                            className={`overflow-hidden rounded-xl border ${cardColor}`}
                        >
                            <button
                                type="button"
                                onClick={() => updateColor(variant.hex)}
                                className="block h-24 w-full sm:h-28"
                                style={{ backgroundColor: variant.hex }}
                                title={`Seleziona ${variant.hex}`}
                                aria-label={`Seleziona ${variant.label}, ${variant.hex}`}
                            />

                            <div className="space-y-3 p-3 sm:p-4">
                                <p className="text-base font-medium leading-snug">
                                    {variant.label}
                                </p>

                                <p className="break-all font-mono text-base font-semibold">
                                    {variant.hex}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => copyColor(variant.hex)}
                                    className="text-base font-semibold hover:underline"
                                >
                                    {copied === variant.hex
                                        ? 'Copiato!'
                                        : 'Copia HEX'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default ColorExplorer
