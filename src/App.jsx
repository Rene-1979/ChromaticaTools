
import { useState } from 'react'

import Header from './components/Header'
import Footer from './components/Footer'
import Contrast from './components/Contrast'
import ColorWheel from './components/ColorWheel'
import ColorExplorer from './components/ColorExplorer'
import GradientGenerator from './components/GradientGenerator'
import PaletteGenerator from './components/PaletteGenerator'
import Accessibility from './components/Accessibility'
import SiteAnalyzer from './components/SiteAnalyzer'

import { getContrastRatio } from './utils/contrast'

function App() {
    const [foreground, setForeground] = useState('#FFFFFF')
    const [background, setBackground] = useState('#000000')
    const [isDark, setIsDark] = useState(true)

    const [activeTab, setActiveTab] = useState('contrast')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const ratio = getContrastRatio(foreground, background)

    const tabs = [
        { id: 'contrast', label: 'Contrasto' },
        { id: 'accessibility', label: 'Accessibilità' },
        { id: 'site', label: 'Analizza sito' },
        { id: 'wheel', label: 'Ruota cromatica' },
        { id: 'palettes', label: 'Palette' },
        { id: 'explorer', label: 'Esplora colori' },
        { id: 'gradients', label: 'Gradienti' },
    ]

    const icons = {
        contrast: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v18a9 9 0 0 0 0-18Z" />
            </svg>
        ),
        wheel: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="3" />
                <path d="m12 3 2 6m7 3-6 2m-3 7-2-6m-7-3 6-2" />
            </svg>
        ),
        explorer: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 4 4M8 11h6m-3-3v6" />
            </svg>
        ),
        gradients: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <path d="M7 5v14m5-14v14m5-14v14" />
            </svg>
        ),
        palettes: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                <path d="M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 1.5-3.3 1.5 1.5 0 0 1 1.1-2.5H18a3 3 0 0 0 3-3c0-5.1-4-9.2-9-9.2Z" />
                <circle cx="7.5" cy="10" r="1" />
                <circle cx="11" cy="6.8" r="1" />
                <circle cx="16" cy="8.5" r="1" />
            </svg>
        ),
        site: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
            </svg>
        ),
        accessibility: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="8" r="1.5" />
                <path d="m8 11 4 2 4-2m-4 2v6m-3-5-2 4m8-4 2 4" />
            </svg>
        ),
    }

    return (
        <div className={isDark ? 'dark' : ''}>
            <main
                className={`flex min-h-screen flex-col transition-colors ${
                    isDark
                        ? 'bg-gray-950 text-white'
                        : 'bg-gray-100 text-gray-900'
                }`}
            >
                <Header
                    isDark={isDark}
                    onToggleDarkMode={() => setIsDark(!isDark)}
                    onGoHome={() => setActiveTab('contrast')}
                />

                <nav
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
                                        {tabs.find((tab) => tab.id === activeTab)?.label}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-expanded={isMobileMenuOpen}
                                aria-controls="mobile-color-menu"
                                aria-label={isMobileMenuOpen ? 'Chiudi menu' : 'Apri menu'}
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                    isDark
                                        ? 'text-slate-200 hover:bg-slate-800'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {isMobileMenuOpen ? (
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

                        <div
                            id="mobile-color-menu"
                            className={`${
                                isMobileMenuOpen
                                    ? 'mt-2 grid gap-1 border-t pt-2'
                                    : 'hidden'
                            } lg:hidden ${
                                isDark ? 'border-slate-800' : 'border-gray-100'
                            }`}
                        >
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.id

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => {
                                            setActiveTab(tab.id)
                                            setIsMobileMenuOpen(false)
                                        }}
                                        aria-current={isActive ? 'page' : undefined}
                                        className={`flex w-full items-center rounded-xl px-4 py-3 text-left text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                            isActive
                                                ? 'bg-indigo-600 text-white'
                                                : isDark
                                                    ? 'text-white hover:bg-slate-800'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
                                        }`}
                                    >
                                        <span>{tab.label}</span>
                                        {isActive && (
                                            <span className="ml-auto text-sm text-indigo-100">
                                                Attivo
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="hidden gap-2 overflow-x-auto pb-1 lg:flex">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.id

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        aria-pressed={isActive}
                                        className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                            isActive
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/20'
                                                : isDark
                                                    ? 'text-white hover:bg-slate-800'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
                                        }`}
                                    >
                                        <span className={isDark || isActive ? 'text-white' : 'text-gray-600'}>
                                            {icons[tab.id]}
                                        </span>
                                        <span>{tab.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </nav>

                <div className="mx-auto w-full max-w-7xl flex-1 px-4 pb-12 pt-8 sm:px-6 lg:px-8">
                    {activeTab === 'contrast' && (
                        <Contrast
                            foreground={foreground}
                            setForeground={setForeground}
                            background={background}
                            setBackground={setBackground}
                            ratio={ratio}
                            isDark={isDark}
                        />
                    )}

                    {activeTab === 'accessibility' && (
                        <Accessibility
                            foreground={foreground}
                            setForeground={setForeground}
                            background={background}
                            setBackground={setBackground}
                            isDark={isDark}
                        />
                    )}

                    {activeTab === 'site' && (
                        <SiteAnalyzer isDark={isDark} />
                    )}

                    {activeTab === 'wheel' && (
                        <ColorWheel
                            onColorSelect={setForeground}
                            isDark={isDark}
                        />
                    )}

                    {activeTab === 'palettes' && (
                        <PaletteGenerator isDark={isDark} />
                    )}

                    {activeTab === 'explorer' && (
                        <ColorExplorer isDark={isDark} />
                    )}

                    {activeTab === 'gradients' && (
                        <GradientGenerator isDark={isDark} />
                    )}
                </div>

                <Footer
                    isDark={isDark}
                    tabs={tabs}
                    onNavigate={(id) => {
                        setActiveTab(id)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                />
            </main>
        </div>
    )
}

export default App
