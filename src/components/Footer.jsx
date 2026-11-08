import foto from '../assets/logo.webp'
import { SITE } from '../content/pages.js'
import { isPlainLeftClick } from '../utils/links'

function Footer({ isDark, tabs, onNavigate }) {
    const muted = isDark ? 'text-slate-300' : 'text-slate-600'

    return (
        <footer
            className={`
                border-t transition-colors duration-300
                ${
                    isDark
                        ? 'border-slate-800 bg-gray-950 text-white'
                        : 'border-gray-200 bg-white text-gray-900'
                }
            `}
        >
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-[1.5fr_1fr]">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3">
                            <img
                                src={foto}
                                alt={SITE.logoAlt}
                                className="h-11 w-11 shrink-0 rounded-xl object-cover"
                            />

                            <p className="text-lg font-bold tracking-tight">
                                Chromatica Tools
                            </p>
                        </div>

                        <p className={`mt-4 max-w-md text-base leading-relaxed ${muted}`}>
                            Strumenti gratuiti per verificare il contrasto WCAG,
                            simulare il daltonismo, analizzare l'accessibilità
                            di un sito, creare palette (anche da un'immagine) e
                            gradienti ed esportare i colori in CSS e JSON.
                        </p>
                    </div>

                    {/* Navigazione rapida */}
                    <nav aria-label="Strumenti nel footer">
                        <p className="text-sm font-bold uppercase tracking-widest text-indigo-500">
                            Strumenti
                        </p>

                        <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1">
                            {tabs.map((tab) => (
                                <li key={tab.id}>
                                    <a
                                        href={tab.href}
                                        onClick={(event) => {
                                            if (!isPlainLeftClick(event)) return

                                            event.preventDefault()
                                            onNavigate(tab.id)
                                        }}
                                        className={`block rounded-md py-2 text-left text-base font-medium transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                            isDark
                                                ? 'text-slate-200 hover:text-white'
                                                : 'text-slate-700 hover:text-slate-950'
                                        }`}
                                    >
                                        {tab.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                <div
                    className={`mt-8 flex flex-col gap-2 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between ${
                        isDark ? 'border-slate-800' : 'border-gray-200'
                    } ${muted}`}
                >
                    <p>
                        © {new Date().getFullYear()} Chromatica Tools. Progetto
                        gratuito, codice sorgente su{' '}
                        <a
                            href={SITE.github}
                            rel="noopener"
                            className="font-medium underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            GitHub
                        </a>{' '}
                        ({SITE.license}).
                    </p>
                    <p>
                        Colori e immagini restano nel tuo browser. Per analizzare
                        un sito l'indirizzo passa da un proxy che scarica la
                        pagina.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
