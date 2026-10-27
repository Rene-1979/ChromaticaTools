
import { useState, useRef } from 'react'
import { hslToHex } from '../utils/colorConversions'
import ExportPanel from './ExportPanel'

const MODES = {
    analogous: {
        label: 'Analogo',
        offsets: [-30, 0, 30],
    },
    complementary: {
        label: 'Complementare',
        offsets: [0, 180],
    },
    'split-complementary': {
        label: 'Complementare diviso',
        offsets: [0, 150, 210],
    },
    triad: {
        label: 'Triade',
        offsets: [0, 120, 240],
    },
}

const normalizeHue = (hue) => ((hue % 360) + 360) % 360

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

function hexToHue(hex) {
    const normalized = normalizeHex(hex)

    if (!normalized) return null

    const red = parseInt(normalized.slice(1, 3), 16) / 255
    const green = parseInt(normalized.slice(3, 5), 16) / 255
    const blue = parseInt(normalized.slice(5, 7), 16) / 255

    const max = Math.max(red, green, blue)
    const min = Math.min(red, green, blue)
    const delta = max - min

    // I colori neutri non hanno una tonalità definita.
    if (delta === 0) return null

    let hue

    if (max === red) {
        hue = 60 * (((green - blue) / delta) % 6)
    } else if (max === green) {
        hue = 60 * ((blue - red) / delta + 2)
    } else {
        hue = 60 * ((red - green) / delta + 4)
    }

    return normalizeHue(Math.round(hue))
}

function ColorWheel({ onColorSelect, isDark }) {
    const [mode, setMode] = useState('triad')
    const [hues, setHues] = useState([200, 320, 80])
    const [locked, setLocked] = useState([false, false, false])
    const [activePoint, setActivePoint] = useState(0)
    const [hexInputs, setHexInputs] = useState({})

    const svgRef = useRef(null)
    const dragIndex = useRef(null)

    const visibleCount = mode === 'complementary' ? 2 : 3

    const colors = hues.map((hue) => hslToHex(hue, 75, 50))

    const muted = isDark ? 'text-slate-300' : 'text-slate-700'

    const applyHarmony = (nextMode, currentHues, currentLocks) => {
        const offsets = MODES[nextMode].offsets
        const nextHues = [...currentHues]

        const anchorIndex = currentLocks.findIndex(
            (isLocked, index) => isLocked && index < offsets.length
        )

        const anchorHue = anchorIndex >= 0
            ? currentHues[anchorIndex]
            : currentHues[0]

        const anchorOffset = anchorIndex >= 0
            ? offsets[anchorIndex]
            : offsets[0]

        offsets.forEach((offset, index) => {
            if (currentLocks[index]) return

            nextHues[index] = normalizeHue(
                anchorHue + offset - anchorOffset
            )
        })

        return nextHues
    }

    const changeMode = (nextMode) => {
        setHues((currentHues) =>
            applyHarmony(nextMode, currentHues, locked)
        )
        setMode(nextMode)
        setActivePoint(0)
        setHexInputs({})
    }

    const toggleLock = (index) => {
        setLocked((current) =>
            current.map((value, i) => i === index ? !value : value)
        )
    }

    const updateHexInput = (index, value) => {
        const input = value.startsWith('#')
            ? value.toUpperCase()
            : `#${value.toUpperCase()}`

        setHexInputs((current) => ({
            ...current,
            [index]: input,
        }))

        const normalized = normalizeHex(input)

        if (!normalized) return

        const newHue = hexToHue(normalized)

        // I colori neutri non hanno una tonalità HSL.
        // In quel caso manteniamo la tonalità precedente.
        if (newHue === null) return

        setHues((currentHues) => {
            const nextHues = [...currentHues]
            nextHues[index] = newHue

            const offsets = MODES[mode].offsets

            offsets.forEach((offset, i) => {
                if (i === index || locked[i]) return

                nextHues[i] = normalizeHue(
                    newHue + offset - offsets[index]
                )
            })

            return nextHues
        })

        setActivePoint(index)
        onColorSelect?.(normalized)
    }

    const finishHexInput = (index) => {
        setHexInputs((current) => {
            const next = { ...current }
            delete next[index]
            return next
        })
    }

    const updateHueFromPointer = (event, index) => {
        if (!svgRef.current) return

        const matrix = svgRef.current.getScreenCTM()
        if (!matrix) return

        const point = svgRef.current.createSVGPoint()
        point.x = event.clientX
        point.y = event.clientY

        const cursor = point.matrixTransform(matrix.inverse())
        const dx = cursor.x - 150
        const dy = cursor.y - 150
        const distance = Math.hypot(dx, dy)

        if (distance < 70 || distance > 140) return

        const angle = Math.atan2(dy, dx) * 180 / Math.PI
        const hue = normalizeHue(Math.round(angle + 90))

        setHues((current) => {
            const updated = [...current]
            updated[index] = hue

            const offsets = MODES[mode].offsets
            const next = [...updated]

            offsets.forEach((offset, i) => {
                if (i === index || locked[i]) return

                next[i] = normalizeHue(
                    hue + offset - offsets[index]
                )
            })

            return next
        })

        setHexInputs({})
        setActivePoint(index)
        onColorSelect?.(hslToHex(hue, 75, 50))
    }

    const startDrag = (event, index) => {
        if (locked[index]) return

        dragIndex.current = index
        setActivePoint(index)
        event.currentTarget.setPointerCapture(event.pointerId)
        updateHueFromPointer(event, index)
    }

    const moveDrag = (event) => {
        if (dragIndex.current === null) return
        updateHueFromPointer(event, dragIndex.current)
    }

    const stopDrag = () => {
        dragIndex.current = null
    }

    const sectors = Array.from({ length: 120 }, (_, index) => {
        const start = (index * 3 - 90) * Math.PI / 180
        const end = ((index + 1) * 3 - 90) * Math.PI / 180

        const point = (radius, angle) => ({
            x: 150 + radius * Math.cos(angle),
            y: 150 + radius * Math.sin(angle),
        })

        const a = point(128, start)
        const b = point(128, end)
        const c = point(94, end)
        const d = point(94, start)

        return {
            hue: index * 3,
            color: `hsl(${index * 3}, 100%, 50%)`,
            path: [
                `M ${a.x} ${a.y}`,
                `A 128 128 0 0 1 ${b.x} ${b.y}`,
                `L ${c.x} ${c.y}`,
                `A 94 94 0 0 0 ${d.x} ${d.y}`,
                'Z',
            ].join(' '),
        }
    })

    return (
        <section className={`mx-auto mt-8 max-w-5xl space-y-8 px-4 pb-12 ${
            isDark ? 'text-slate-100' : 'text-slate-900'
        }`}>
            <div>
                <h2 className="text-3xl font-bold sm:text-4xl">
                    Ruota cromatica
                </h2>

                <p className={`mt-3 max-w-3xl text-lg leading-relaxed ${muted}`}>
                    Trascina i punti sulla ruota, modifica i codici HEX
                    e blocca i colori da conservare.
                </p>
            </div>

            <label className="block max-w-sm">
                <span className="mb-2 block text-base font-semibold">
                    Armonia cromatica
                </span>

                <select
                    value={mode}
                    onChange={(event) => changeMode(event.target.value)}
                    className={`w-full rounded-lg border p-3 text-base ${
                        isDark
                            ? 'border-slate-700 bg-slate-900 text-white'
                            : 'border-slate-300 bg-white text-slate-900'
                    }`}
                >
                    {Object.entries(MODES).map(([value, item]) => (
                        <option key={value} value={value}>
                            {item.label}
                        </option>
                    ))}
                </select>
            </label>

            <div className="grid items-center gap-8 md:grid-cols-2">
                {/* Ruota cromatica */}
                <div className="mx-auto w-full max-w-sm">
                    <svg
                        ref={svgRef}
                        viewBox="0 0 300 300"
                        aria-label="Ruota cromatica con punti trascinabili"
                        className="h-auto w-full touch-none"
                        onPointerMove={moveDrag}
                        onPointerUp={stopDrag}
                        onPointerCancel={stopDrag}
                    >
                        {sectors.map((sector) => (
                            <path
                                key={sector.hue}
                                d={sector.path}
                                fill={sector.color}
                            />
                        ))}

                        <circle
                            cx="150"
                            cy="150"
                            r="88"
                            fill={isDark ? '#111827' : '#FFFFFF'}
                            stroke={isDark ? '#374151' : '#D1D5DB'}
                            strokeWidth="2"
                        />

                        {hues.slice(0, visibleCount).map((hue, index) => {
                            const angle = (hue - 90) * Math.PI / 180
                            const x = 150 + 110 * Math.cos(angle)
                            const y = 150 + 110 * Math.sin(angle)

                            return (
                                <g key={index}>
                                    <line
                                        x1="150"
                                        y1="150"
                                        x2={x}
                                        y2={y}
                                        stroke={colors[index]}
                                        strokeWidth="2"
                                        opacity="0.8"
                                        pointerEvents="none"
                                    />

                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={activePoint === index ? 12 : 10}
                                        fill={colors[index]}
                                        stroke={locked[index] ? '#FFFFFF' : '#111827'}
                                        strokeWidth={locked[index] ? 4 : 2}
                                        className={locked[index] ? 'cursor-not-allowed' : 'cursor-grab'}
                                        onPointerDown={(event) => startDrag(event, index)}
                                    />
                                </g>
                            )
                        })}
                    </svg>

                    <p className={`mt-3 text-center text-base ${muted}`}>
                        Trascina un punto colorato lungo la ruota per modificare
                        la tonalità.
                    </p>
                </div>

                {/* Controlli dei colori */}
                <div className="space-y-4">
                    {hues.slice(0, visibleCount).map((hue, index) => (
                        <div
                            key={index}
                            className={`rounded-xl border p-4 sm:p-5 ${
                                isDark
                                    ? 'border-slate-700 bg-slate-900'
                                    : 'border-slate-200 bg-white'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActivePoint(index)
                                        onColorSelect?.(colors[index])
                                    }}
                                    className="h-12 w-12 shrink-0 rounded-lg border border-slate-400/40"
                                    style={{ backgroundColor: colors[index] }}
                                    aria-label={`Usa il colore ${colors[index]} come testo`}
                                    title="Usa come colore del testo"
                                />

                                <div className="min-w-0 flex-1">
                                    <p className={`text-base font-semibold ${muted}`}>
                                        Punto {index + 1}
                                    </p>

                                    <label className="mt-2 block">
                                        <span className="sr-only">
                                            Codice HEX del punto {index + 1}
                                        </span>

                                        <input
                                            type="text"
                                            value={hexInputs[index] ?? colors[index]}
                                            onChange={(event) =>
                                                updateHexInput(index, event.target.value)
                                            }
                                            onBlur={() => finishHexInput(index)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') {
                                                    event.currentTarget.blur()
                                                }
                                            }}
                                            maxLength={7}
                                            spellCheck={false}
                                            aria-label={`Codice HEX punto ${index + 1}`}
                                            className={`w-full rounded-md border px-3 py-2 font-mono text-base ${
                                                isDark
                                                    ? 'border-slate-700 bg-slate-950 text-white'
                                                    : 'border-slate-300 bg-white text-slate-900'
                                            }`}
                                        />
                                    </label>

                                    <p className={`mt-2 text-base ${muted}`}>
                                        Tonalità {hue}°
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => toggleLock(index)}
                                    aria-pressed={locked[index]}
                                    className={`shrink-0 rounded-lg px-3 py-2.5 text-base font-semibold ${
                                        locked[index]
                                            ? 'bg-amber-500 text-gray-950'
                                            : isDark
                                                ? 'bg-slate-800 text-slate-200'
                                                : 'bg-slate-100 text-slate-700'
                                    }`}
                                >
                                    {locked[index] ? '🔒 Bloccato' : '🔓 Blocca'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ExportPanel
                id="wheel-export"
                page="ruota"
                colors={colors.slice(0, visibleCount).map((hex, index) => ({
                    label: `Punto ${index + 1}`,
                    hex,
                }))}
                isDark={isDark}
            />
        </section>
    )
}

export default ColorWheel
