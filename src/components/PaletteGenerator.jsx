
import { useState } from 'react'
import { getColorHarmony } from '../utils/colorHarmony'
import { hexToHsl, hslToHex } from '../utils/colorConversions'
import ExportPanel from './ExportPanel'

const INITIAL_COLOR = '#6366F1'
const PALETTE_SIZE = 5

const HARMONIES = [
    { id: 'analogous', label: 'Analoga' },
    { id: 'complementary', label: 'Complementare' },
    { id: 'split-complementary', label: 'Complementare divisa' },
    { id: 'triadic', label: 'Triade' },
]

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

function randomHex() {
    return (
        '#' +
        Math.floor(Math.random() * 16777216)
            .toString(16)
            .padStart(6, '0')
            .toUpperCase()
    )
}

function areColorsTooSimilar(colorA, colorB) {
    if (colorA.toUpperCase() === colorB.toUpperCase()) {
        return true
    }

    const a = hexToHsl(colorA)
    const b = hexToHsl(colorB)

    const hueDifference = Math.abs(a.h - b.h)
    const hueDistance = Math.min(hueDifference, 360 - hueDifference)

    const saturationDifference = Math.abs(a.s - b.s)
    const lightnessDifference = Math.abs(a.l - b.l)

    if (a.s < 12 && b.s < 12) {
        return lightnessDifference < 18
    }

    return (
        hueDistance < 15 &&
        saturationDifference < 20 &&
        lightnessDifference < 20
    )
}

function buildPalette(baseColor, harmony, lockedColors = {}) {
    const base = normalizeHex(baseColor) || INITIAL_COLOR

    const harmonyColors = getColorHarmony(base, harmony)
        .map((item) => normalizeHex(item.color))
        .filter(Boolean)

    const baseHsl = hexToHsl(base)

    const fallbackColors = Array.from({ length: 24 }, (_, index) => {
        const hue = (baseHsl.h + 23 + index * 47) % 360
        const saturation = [55, 70, 85, 65][index % 4]
        const lightness = [38, 52, 65, 45, 75, 32][index % 6]

        return hslToHex(hue, saturation, lightness)
    })

    const candidates = [base, ...harmonyColors, ...fallbackColors]
    const selectedColors = []

    for (const candidate of candidates) {
        const normalized = normalizeHex(candidate)

        if (!normalized) continue

        const tooSimilar = selectedColors.some((selected) =>
            areColorsTooSimilar(selected, normalized)
        )

        if (!tooSimilar) {
            selectedColors.push(normalized)
        }

        if (selectedColors.length === PALETTE_SIZE) {
            break
        }
    }

    let fallbackIndex = 0

    while (selectedColors.length < PALETTE_SIZE) {
        const hue = (baseHsl.h + fallbackIndex * 71 + 11) % 360

        const candidate = hslToHex(
            hue,
            60 + (fallbackIndex % 3) * 10,
            30 + (fallbackIndex % 5) * 14
        )

        if (!selectedColors.includes(candidate)) {
            selectedColors.push(candidate)
        }

        fallbackIndex++
    }

    return selectedColors
        .slice(0, PALETTE_SIZE)
        .map((color, slot) => ({
            id: slot,
            color: lockedColors[slot] || color,
            locked: Boolean(lockedColors[slot]),
        }))
}

function PaletteGenerator({ isDark }) {
    const [baseColor, setBaseColor] = useState(INITIAL_COLOR)
    const [baseColorInput, setBaseColorInput] = useState(INITIAL_COLOR)
    const [harmony, setHarmony] = useState('analogous')
    const [palette, setPalette] = useState(() =>
        buildPalette(INITIAL_COLOR, 'analogous')
    )
    const [hexInputs, setHexInputs] = useState({})
    const [copied, setCopied] = useState('')
    const [copyError, setCopyError] = useState(false)

    const textColor = isDark ? 'text-white' : 'text-gray-900'
    const mutedColor = isDark ? 'text-gray-400' : 'text-gray-600'
    const cardColor = isDark
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    const inputColor = isDark
        ? 'bg-gray-900 border-gray-600 text-white'
        : 'bg-white border-gray-300 text-gray-900'

    function generatePalette(newBase = baseColor, newHarmony = harmony) {
        const normalizedBase = normalizeHex(newBase)

        if (!normalizedBase) return

        const lockedColors = Object.fromEntries(
            palette
                .filter((item) => item.locked)
                .map((item) => [item.id, item.color])
        )

        const generated = buildPalette(
            normalizedBase,
            newHarmony,
            lockedColors
        )

        setPalette(generated)
        setBaseColor(normalizedBase)
        setBaseColorInput(normalizedBase)
        setHarmony(newHarmony)
        setHexInputs({})
        setCopied('')
        setCopyError(false)
    }

    function handleBaseColorInput(value) {
        const normalizedInput = value.startsWith('#')
            ? value.toUpperCase()
            : `#${value.toUpperCase()}`

        setBaseColorInput(normalizedInput)

        const normalized = normalizeHex(normalizedInput)

        if (normalized) {
            const lockedColors = Object.fromEntries(
                palette
                    .filter((item) => item.locked)
                    .map((item) => [item.id, item.color])
            )

            setBaseColor(normalized)
            setPalette(buildPalette(normalized, harmony, lockedColors))
            setHexInputs({})
            setCopied('')
            setCopyError(false)
        }
    }

    function handlePaletteColorInput(id, value) {
        const normalizedInput = value.startsWith('#')
            ? value.toUpperCase()
            : `#${value.toUpperCase()}`

        setHexInputs((current) => ({
            ...current,
            [id]: normalizedInput,
        }))

        const normalized = normalizeHex(normalizedInput)

        if (normalized) {
            setPalette((current) =>
                current.map((item) =>
                    item.id === id
                        ? { ...item, color: normalized }
                        : item
                )
            )

            setCopied('')
            setCopyError(false)
        }
    }

    function finishPaletteColorInput(id) {
        const item = palette.find((color) => color.id === id)

        setHexInputs((current) => {
            const next = { ...current }
            delete next[id]
            return next
        })

        if (!item) return
    }

    function toggleLock(id) {
        setPalette((current) =>
            current.map((item) =>
                item.id === id
                    ? { ...item, locked: !item.locked }
                    : item
            )
        )
    }

    function updatePaletteColor(id, value) {
        const normalized = normalizeHex(value)

        if (!normalized) return

        setPalette((current) =>
            current.map((item) =>
                item.id === id
                    ? { ...item, color: normalized }
                    : item
            )
        )

        setHexInputs((current) => ({
            ...current,
            [id]: normalized,
        }))

        setCopied('')
        setCopyError(false)
    }

    async function copyValue(value, label) {
        try {
            await navigator.clipboard.writeText(value)
            setCopied(label)
            setCopyError(false)
        } catch {
            setCopied('')
            setCopyError(true)
        }
    }

    return (
        <section className={`space-y-6 ${textColor}`}>
            <div>
                <h2 className="text-3xl font-bold">
                    Generatore di palette
                </h2>
                <p className={`mt-3 text-base leading-relaxed ${mutedColor}`}>
                    Crea combinazioni cromatiche, blocca i colori
                    preferiti e copia la palette nei tuoi progetti.
                </p>
            </div>

            {/* Impostazioni */}
            <div className={`rounded-2xl border p-5 sm:p-6 ${cardColor}`}>
                <h3 className="mb-5 text-xl font-semibold">
                    Personalizza la palette
                </h3>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="palette-base-color"
                            className="mb-3 block text-base font-medium"
                        >
                            Colore di partenza
                        </label>

                        <div className="flex flex-wrap items-center gap-3">
                            <input
                                type="color"
                                value={baseColor}
                                onChange={(event) =>
                                    generatePalette(
                                        event.target.value.toUpperCase(),
                                        harmony
                                    )
                                }
                                aria-label="Scegli il colore di partenza"
                                className="h-14 w-16 cursor-pointer rounded-lg border-0 bg-transparent"
                            />

                            <input
                                id="palette-base-color"
                                type="text"
                                value={baseColorInput}
                                onChange={(event) =>
                                    handleBaseColorInput(event.target.value)
                                }
                                onBlur={() => setBaseColorInput(baseColor)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.currentTarget.blur()
                                    }
                                }}
                                aria-label="Codice HEX del colore di partenza"
                                maxLength={7}
                                spellCheck={false}
                                className={`w-36 rounded-lg border px-4 py-3 text-base font-mono ${inputColor}`}
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="palette-harmony"
                            className="mb-3 block text-base font-medium"
                        >
                            Armonia cromatica
                        </label>

                        <select
                            id="palette-harmony"
                            value={harmony}
                            onChange={(event) =>
                                generatePalette(baseColor, event.target.value)
                            }
                            className={`w-full rounded-lg border px-4 py-3 text-base ${inputColor}`}
                        >
                            {HARMONIES.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => generatePalette(randomHex(), harmony)}
                    className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-indigo-500"
                >
                    Genera nuova palette
                </button>
            </div>

            {/* Palette */}
            <div className={`overflow-hidden rounded-2xl border ${cardColor}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                    {palette.map((item, index) => (
                        <div key={item.id} className="min-w-0">
                            <button
                                type="button"
                                onClick={() =>
                                    copyValue(item.color, `color-${item.id}`)
                                }
                                className="relative block h-40 w-full transition hover:brightness-110 sm:h-48 lg:h-64"
                                style={{ backgroundColor: item.color }}
                                aria-label={`Copia il colore ${item.color}`}
                                title={`Copia ${item.color}`}
                            >
                                <span className="absolute left-3 top-3 rounded-md bg-black/40 px-3 py-1.5 text-sm font-semibold text-white">
                                    {index + 1}
                                </span>
                            </button>

                            <div className="space-y-4 p-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={item.color}
                                        onChange={(event) =>
                                            updatePaletteColor(
                                                item.id,
                                                event.target.value
                                            )
                                        }
                                        aria-label={`Modifica colore ${index + 1}`}
                                        className="h-11 w-11 shrink-0 cursor-pointer rounded border-0 bg-transparent"
                                    />

                                    <input
                                        type="text"
                                        value={hexInputs[item.id] ?? item.color}
                                        onChange={(event) =>
                                            handlePaletteColorInput(
                                                item.id,
                                                event.target.value
                                            )
                                        }
                                        onBlur={() =>
                                            finishPaletteColorInput(item.id)
                                        }
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                event.currentTarget.blur()
                                            }
                                        }}
                                        aria-label={`Codice HEX colore ${index + 1}`}
                                        maxLength={7}
                                        spellCheck={false}
                                        className={`min-w-0 w-full rounded-md border px-2 py-2.5 text-base font-mono ${inputColor}`}
                                    />
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        onClick={() => toggleLock(item.id)}
                                        aria-pressed={item.locked}
                                        className={`rounded-lg border px-3 py-2.5 text-sm font-medium ${
                                            item.locked
                                                ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400'
                                                : isDark
                                                    ? 'border-gray-600 hover:bg-gray-700'
                                                    : 'border-gray-300 hover:bg-gray-100'
                                        }`}
                                    >
                                        {item.locked ? '🔒 Bloccato' : '🔓 Blocca'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            copyValue(item.color, `color-${item.id}`)
                                        }
                                        className="text-base font-medium hover:underline"
                                    >
                                        {copied === `color-${item.id}`
                                            ? 'Copiato!'
                                            : 'Copia'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {copyError && (
                <p className="text-base text-red-500">
                    Impossibile copiare. Verifica i permessi degli appunti
                    del browser.
                </p>
            )}

            {/* Esportazione */}
            <ExportPanel
                id="palette-export"
                page="palette"
                colors={palette.map((item, index) => ({
                    label: `Colore ${index + 1}`,
                    hex: item.color,
                }))}
                isDark={isDark}
            />
        </section>
    )
}

export default PaletteGenerator
