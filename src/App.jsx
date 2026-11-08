
import { useEffect, useState } from 'react'

import Header from './components/Header'
import MainNav from './components/MainNav'
import Footer from './components/Footer'
import Contrast from './components/Contrast'
import ColorWheel from './components/ColorWheel'
import ColorExplorer from './components/ColorExplorer'
import GradientGenerator from './components/GradientGenerator'
import PaletteGenerator from './components/PaletteGenerator'
import ImagePalette from './components/ImagePalette'
import Accessibility from './components/Accessibility'
import SiteAnalyzer from './components/SiteAnalyzer'
import SeoContent from './components/SeoContent'

import { getContrastRatio } from './utils/contrast'
import { applyPageMeta } from './utils/pageMeta'
import { getPage, getPageByPath } from './content/pages.js'

function App() {
    const [foreground, setForeground] = useState('#FFFFFF')
    const [background, setBackground] = useState('#000000')
    const [isDark, setIsDark] = useState(true)

    // Ogni scheda ha un indirizzo proprio (content/pages.js): si parte da quello.
    const [activeTab, setActiveTab] = useState(
        () => getPageByPath(window.location.pathname)?.id ?? 'contrast'
    )

    // Palette scelta in "Palette da immagine", da caricare nel generatore.
    const [importedPalette, setImportedPalette] = useState(null)

    function showTab(id) {
        const page = getPage(id)

        if (window.location.pathname !== page.path) {
            window.history.pushState(null, '', page.path)
        }

        setActiveTab(id)
    }

    // Cambiando scheda la palette importata è già stata consumata: la dimentichiamo.
    function changeTab(id) {
        showTab(id)
        setImportedPalette(null)
    }

    function applyImagePalette(palette) {
        setImportedPalette(palette)
        showTab('palettes')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Pulsanti avanti e indietro del browser.
    useEffect(() => {
        function handlePopState() {
            setActiveTab(getPageByPath(window.location.pathname)?.id ?? 'contrast')
            setImportedPalette(null)
        }

        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [])

    // Titolo, descrizione, canonical e dati strutturati seguono la scheda.
    useEffect(() => {
        applyPageMeta(getPage(activeTab))
    }, [activeTab])

    const ratio = getContrastRatio(foreground, background)

    // Voce di menu di una scheda: etichetta e indirizzo vengono da content/pages.js.
    const entry = (id) => {
        const page = getPage(id)

        return { id, label: page.navLabel, href: page.path }
    }

    // Menu principale: voci singole e gruppi con sottomenu.
    const menu = [
        {
            id: 'group-color-accessibility',
            label: 'Accessibilità colore',
            icon: 'contrast',
            children: [entry('contrast'), entry('accessibility')],
        },
        {
            id: 'group-analysis',
            label: 'Strumenti d\'analisi',
            icon: 'site',
            children: [entry('site'), entry('image-palette')],
        },
        entry('wheel'),
        entry('palettes'),
        entry('explorer'),
        entry('gradients'),
    ]

    // Elenco piatto di tutte le schede (titolo mobile, footer).
    const tabs = menu.flatMap((item) => item.children ?? [item])

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
        'image-palette': (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                <rect x="3" y="4" width="18" height="16" rx="3" />
                <circle cx="9" cy="10" r="1.6" />
                <path d="m4 18 5-5 4 4 3-3 4 4" />
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
            <div
                className={`flex min-h-screen flex-col transition-colors ${
                    isDark
                        ? 'bg-gray-950 text-white'
                        : 'bg-gray-100 text-gray-900'
                }`}
            >
                <Header
                    isDark={isDark}
                    onToggleDarkMode={() => setIsDark(!isDark)}
                    onGoHome={() => changeTab('contrast')}
                />

                <MainNav
                    isDark={isDark}
                    menu={menu}
                    tabs={tabs}
                    icons={icons}
                    activeTab={activeTab}
                    onSelect={changeTab}
                />

                <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-12 pt-8 sm:px-6 lg:px-8">
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
                        <PaletteGenerator
                            isDark={isDark}
                            imported={importedPalette}
                            onOpenImagePalette={() => changeTab('image-palette')}
                        />
                    )}

                    {activeTab === 'image-palette' && (
                        <ImagePalette
                            isDark={isDark}
                            onApplyPalette={applyImagePalette}
                        />
                    )}

                    {activeTab === 'explorer' && (
                        <ColorExplorer isDark={isDark} />
                    )}

                    {activeTab === 'gradients' && (
                        <GradientGenerator isDark={isDark} />
                    )}

                    <SeoContent
                        page={getPage(activeTab)}
                        isDark={isDark}
                        onNavigate={changeTab}
                    />
                </main>

                <Footer
                    isDark={isDark}
                    tabs={tabs}
                    onNavigate={(id) => {
                        changeTab(id)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                />
            </div>
        </div>
    )
}

export default App
