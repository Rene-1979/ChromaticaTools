import { useEffect, useRef, useState } from 'react'
import { isPlainLeftClick } from '../utils/links'

function Chevron({ open }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    )
}

/**
 * Menu principale.
 *
 * `menu` è un elenco di voci singole `{ id, label }` oppure di gruppi
 * `{ id, label, icon, children: [{ id, label }] }`. Su desktop i gruppi si
 * aprono con un clic (Esc o clic fuori li chiude, frecce su/giù per
 * spostarsi); su mobile il menu a pulsante elenca le voci sotto il titolo
 * del loro gruppo.
 */
function MainNav({ isDark, menu, tabs, icons, activeTab, onSelect }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [openGroup, setOpenGroup] = useState(null)

    const navRef = useRef(null)
    const triggerRefs = useRef({})
    const itemRefs = useRef({})
    const pendingFocus = useRef(null)

    // Chiude la tendina con un clic fuori dal menu.
    useEffect(() => {
        if (!openGroup) return

        function handlePointerDown(event) {
            if (!navRef.current?.contains(event.target)) setOpenGroup(null)
        }

        document.addEventListener('pointerdown', handlePointerDown)
        return () => document.removeEventListener('pointerdown', handlePointerDown)
    }, [openGroup])

    // Dopo l'apertura da tastiera porta il focus sulla voce richiesta.
    useEffect(() => {
        if (!openGroup || pendingFocus.current === null) return

        itemRefs.current[`${openGroup}:${pendingFocus.current}`]?.focus()
        pendingFocus.current = null
    }, [openGroup])

    function select(id) {
        onSelect(id)
        setOpenGroup(null)
        setIsMobileOpen(false)
    }

    // Link veri (indirizzo proprio per ogni scheda): il clic normale resta
    // nell'app, Ctrl/Cmd+clic apre il link in una nuova scheda del browser.
    function handleLink(event, id) {
        if (!isPlainLeftClick(event)) return

        event.preventDefault()
        select(id)
    }

    function handleTriggerKeyDown(event, group) {
        if (event.key === 'ArrowDown') {
            event.preventDefault()
            pendingFocus.current = 0

            if (openGroup === group.id) {
                itemRefs.current[`${group.id}:0`]?.focus()
                pendingFocus.current = null
            } else {
                setOpenGroup(group.id)
            }
        }
    }

    function handlePanelKeyDown(event, group, index) {
        const last = group.children.length - 1
        let next = null

        if (event.key === 'ArrowDown') next = index === last ? 0 : index + 1
        if (event.key === 'ArrowUp') next = index === 0 ? last : index - 1
        if (event.key === 'Home') next = 0
        if (event.key === 'End') next = last

        if (next !== null) {
            event.preventDefault()
            itemRefs.current[`${group.id}:${next}`]?.focus()
        }
    }

    function handleGroupKeyDown(event) {
        if (event.key === 'Escape' && openGroup) {
            event.stopPropagation()
            triggerRefs.current[openGroup]?.focus()
            setOpenGroup(null)
        }
    }

    function handleGroupBlur(event) {
        // Il Tab verso un altro punto della pagina chiude la tendina.
        // Se relatedTarget è null (alcuni browser non danno il focus ai
        // pulsanti al clic) ci pensa il clic fuori.
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
            setOpenGroup(null)
        }
    }

    const focusRing =
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'

    const idleClass = isDark
        ? 'text-white hover:bg-slate-800'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'

    const activeClass = 'bg-indigo-600 text-white shadow-md shadow-indigo-950/20'

    const activeLabel = tabs.find((tab) => tab.id === activeTab)?.label

    return (
        <nav
            ref={navRef}
            aria-label="Strumenti colore"
            className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8"
        >
            <div
                className={`rounded-2xl border p-2 transition-colors duration-300 ${
                    isDark
                        ? 'border-slate-800 bg-gray-950'
                        : 'border-gray-200 bg-white shadow-sm'
                }`}
            >
                {/* Mobile: intestazione con pulsante */}
                <div className="flex items-center justify-between gap-3 lg:hidden">
                    <div className="flex min-w-0 items-center gap-3 px-3 py-2">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                            <span className="text-lg font-bold">C</span>
                        </span>

                        <div className="min-w-0">
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                                CHROMATICA TOOLS
                            </p>
                            <p className={`truncate text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {activeLabel}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        aria-expanded={isMobileOpen}
                        aria-controls="mobile-color-menu"
                        aria-label={isMobileOpen ? 'Chiudi menu' : 'Apri menu'}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${focusRing} ${
                            isDark
                                ? 'text-slate-200 hover:bg-slate-800'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {isMobileOpen ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true">
                                <path d="m18 6-12 12M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true">
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile: elenco delle voci, raggruppate */}
                <div
                    id="mobile-color-menu"
                    className={`${
                        isMobileOpen ? 'mt-2 grid gap-1 border-t pt-2' : 'hidden'
                    } lg:hidden ${isDark ? 'border-slate-800' : 'border-gray-100'}`}
                >
                    {menu.map((item) => {
                        const entries = item.children ?? [item]

                        return (
                            <div key={item.id} className="grid gap-1">
                                {item.children && (
                                    <p className="px-4 pb-1 pt-3 text-xs font-bold uppercase tracking-widest text-indigo-500">
                                        {item.label}
                                    </p>
                                )}

                                {entries.map((entry) => {
                                    const isActive = activeTab === entry.id

                                    return (
                                        <a
                                            key={entry.id}
                                            href={entry.href}
                                            onClick={(event) => handleLink(event, entry.id)}
                                            aria-current={isActive ? 'page' : undefined}
                                            className={`flex w-full items-center rounded-xl px-4 py-3 text-left text-base font-semibold transition-colors ${focusRing} ${
                                                isActive ? 'bg-indigo-600 text-white' : idleClass
                                            }`}
                                        >
                                            <span>{entry.label}</span>
                                            {isActive && (
                                                <span className="ml-auto text-sm text-indigo-100">
                                                    Attivo
                                                </span>
                                            )}
                                        </a>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>

                {/* Desktop: voci e tendine, a capo se non entrano (nessuno scorrimento) */}
                <div className="hidden flex-wrap gap-2 lg:flex">
                    {menu.map((item) => {
                        if (!item.children) {
                            const isActive = activeTab === item.id

                            return (
                                <a
                                    key={item.id}
                                    href={item.href}
                                    onClick={(event) => handleLink(event, item.id)}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-base font-semibold transition-all duration-200 ${focusRing} ${
                                        isActive ? activeClass : idleClass
                                    }`}
                                >
                                    <span className={isDark || isActive ? 'text-white' : 'text-gray-600'}>
                                        {icons[item.icon ?? item.id]}
                                    </span>
                                    <span>{item.label}</span>
                                </a>
                            )
                        }

                        const isGroupActive = item.children.some(
                            (child) => child.id === activeTab
                        )
                        const isOpen = openGroup === item.id
                        const panelId = `nav-group-${item.id}`

                        return (
                            <div
                                key={item.id}
                                className="relative"
                                onKeyDown={handleGroupKeyDown}
                                onBlur={handleGroupBlur}
                            >
                                <button
                                    ref={(element) => {
                                        triggerRefs.current[item.id] = element
                                    }}
                                    type="button"
                                    onClick={() => setOpenGroup(isOpen ? null : item.id)}
                                    onKeyDown={(event) => handleTriggerKeyDown(event, item)}
                                    aria-expanded={isOpen}
                                    aria-controls={panelId}
                                    className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-base font-semibold transition-all duration-200 ${focusRing} ${
                                        isGroupActive ? activeClass : idleClass
                                    }`}
                                >
                                    <span className={isDark || isGroupActive ? 'text-white' : 'text-gray-600'}>
                                        {icons[item.icon ?? item.id]}
                                    </span>
                                    <span>{item.label}</span>
                                    <Chevron open={isOpen} />
                                </button>

                                {isOpen && (
                                    <ul
                                        id={panelId}
                                        className={`absolute left-0 top-full z-30 mt-2 min-w-full w-max rounded-xl border p-1.5 shadow-xl ${
                                            isDark
                                                ? 'border-slate-700 bg-gray-900'
                                                : 'border-gray-200 bg-white'
                                        }`}
                                    >
                                        {item.children.map((child, index) => {
                                            const isActive = activeTab === child.id

                                            return (
                                                <li key={child.id}>
                                                    <a
                                                        ref={(element) => {
                                                            itemRefs.current[`${item.id}:${index}`] = element
                                                        }}
                                                        href={child.href}
                                                        onClick={(event) => handleLink(event, child.id)}
                                                        onKeyDown={(event) =>
                                                            handlePanelKeyDown(event, item, index)
                                                        }
                                                        aria-current={isActive ? 'page' : undefined}
                                                        className={`flex w-full items-center rounded-lg px-4 py-2.5 text-left text-base font-semibold transition-colors ${focusRing} ${
                                                            isActive ? 'bg-indigo-600 text-white' : idleClass
                                                        }`}
                                                    >
                                                        {child.label}
                                                    </a>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}

export default MainNav
