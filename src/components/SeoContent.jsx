import { getPage } from '../content/pages.js'
import { isPlainLeftClick } from '../utils/links'

/**
 * Testo di approfondimento sotto ogni strumento: risposta breve, istruzioni
 * d'uso, domande frequenti e link agli altri strumenti. Gli stessi contenuti
 * sono nell'HTML prerenderizzato, così motori di ricerca e assistenti AI li
 * leggono anche senza eseguire JavaScript.
 */
function SeoContent({ page, isDark, onNavigate }) {
    const muted = isDark ? 'text-slate-300' : 'text-slate-700'
    const card = isDark
        ? 'border-slate-800 bg-slate-900'
        : 'border-slate-200 bg-white'

    const related = page.related.map((id) => getPage(id)).filter(Boolean)

    function handleClick(event, id) {
        if (!isPlainLeftClick(event)) return

        event.preventDefault()
        onNavigate(id)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <section
            aria-labelledby="seo-content-title"
            className={`mx-auto mt-16 max-w-5xl space-y-10 border-t pt-10 ${
                isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
        >
            <div>
                <h2 id="seo-content-title" className="text-2xl font-bold sm:text-3xl">
                    {page.navLabel}: cos'è e come si usa
                </h2>

                <p className={`mt-4 max-w-3xl text-lg leading-relaxed ${muted}`}>
                    {page.lead}
                </p>
            </div>

            <div>
                <h2 className="text-2xl font-bold">Come si usa</h2>

                <ol className={`mt-4 list-decimal space-y-2 pl-6 text-base leading-relaxed ${muted}`}>
                    {page.steps.map((step) => (
                        <li key={step}>{step}</li>
                    ))}
                </ol>
            </div>

            <div>
                <h2 className="text-2xl font-bold">Domande frequenti</h2>

                <div className="mt-4 space-y-6">
                    {page.faq.map((item) => (
                        <div key={item.q}>
                            <h3 className="text-lg font-semibold">{item.q}</h3>
                            <p className={`mt-2 max-w-3xl text-base leading-relaxed ${muted}`}>
                                {item.a}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <nav aria-labelledby="seo-related-title">
                <h2 id="seo-related-title" className="text-2xl font-bold">
                    Altri strumenti di Chromatica Tools
                </h2>

                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {related.map((item) => (
                        <li key={item.id}>
                            <a
                                href={item.path}
                                onClick={(event) => handleClick(event, item.id)}
                                className={`block h-full rounded-xl border p-4 transition-colors hover:border-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${card}`}
                            >
                                <span className="text-base font-semibold">
                                    {item.navLabel}
                                </span>
                                <span className={`mt-1 block text-sm leading-relaxed ${muted}`}>
                                    {item.appName}
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </section>
    )
}

export default SeoContent
