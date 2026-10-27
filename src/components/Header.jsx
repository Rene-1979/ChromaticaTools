
import foto from '../assets/logo.webp'

function Header({ isDark, onToggleDarkMode, onGoHome }) {
    return (
        <header
            className={`
                border-b transition-colors duration-300
                ${
                    isDark
                        ? 'border-slate-800 bg-gray-950 text-white'
                        : 'border-gray-200 bg-white text-gray-900'
                }
            `}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                {/* Logo cliccabile */}
                <button
                    type="button"
                    onClick={onGoHome}
                    className="flex min-w-0 items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    aria-label="Chromatica Tools: torna alla scheda Contrasto"
                    title="Torna alla scheda Contrasto"
                >
                    <img
                        src={foto}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-xl object-cover sm:h-14 sm:w-14"
                    />

                    <span className="min-w-0">
                        <span className="block text-lg font-bold tracking-tight sm:text-xl">
                            Chromatica Tools
                        </span>

                        <span
                            className={`mt-1 hidden text-xs font-bold tracking-wide sm:block ${
                                isDark
                                    ? 'text-slate-300'
                                    : 'text-slate-600'
                            }`}
                        >
                            COLORI · CONTRASTI · ACCESSIBILITÀ
                        </span>
                    </span>
                </button>

                {/* Pulsante tema */}
                <button
                    type="button"
                    onClick={onToggleDarkMode}
                    aria-label={
                        isDark
                            ? 'Attiva modalità chiara'
                            : 'Attiva modalità scura'
                    }
                    title={
                        isDark
                            ? 'Attiva modalità chiara'
                            : 'Attiva modalità scura'
                    }
                    className={`
                        flex h-11 w-11 shrink-0 items-center justify-center
                        rounded-xl border transition-all duration-200
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                        ${
                            isDark
                                ? 'border-slate-700 bg-slate-900 text-amber-300 hover:border-slate-600 hover:bg-slate-800'
                                : 'border-gray-300 bg-gray-50 text-indigo-700 hover:bg-gray-100'
                        }
                    `}
                >
                    {isDark ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="21"
                            height="21"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 2v2" />
                            <path d="M12 20v2" />
                            <path d="m4.93 4.93 1.42 1.42" />
                            <path d="m17.65 17.65 1.42 1.42" />
                            <path d="M2 12h2" />
                            <path d="M20 12h2" />
                            <path d="m6.35 17.65-1.42 1.42" />
                            <path d="m19.07 4.93-1.42 1.42" />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="21"
                            height="21"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
                        </svg>
                    )}
                </button>
            </div>
        </header>
    )
}

export default Header
