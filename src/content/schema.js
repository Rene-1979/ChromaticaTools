import { SITE, getPageUrl } from './pages.js'

const LICENSE_URL = 'https://polyformproject.org/licenses/noncommercial/1.0.0'

/**
 * Dati strutturati (schema.org, JSON-LD) di una scheda: sito, applicazione web,
 * briciole di pane e domande frequenti. Solo informazioni che compaiono
 * davvero nella pagina: niente recensioni, valutazioni o dati aziendali.
 */
export function buildJsonLd(page) {
    const url = getPageUrl(page)
    const siteId = `${SITE.url}/#website`

    const graph = [
        {
            '@type': 'WebSite',
            '@id': siteId,
            url: `${SITE.url}/`,
            name: SITE.name,
            description: SITE.summary,
            inLanguage: SITE.language,
            sameAs: [SITE.github],
        },
        {
            '@type': 'WebApplication',
            '@id': `${url}#app`,
            name: page.appName,
            url,
            description: page.description,
            applicationCategory: 'DesignApplication',
            operatingSystem: 'Any',
            browserRequirements: 'Richiede JavaScript e un browser moderno',
            inLanguage: SITE.language,
            isAccessibleForFree: true,
            license: LICENSE_URL,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
            featureList: page.features,
            isPartOf: { '@id': siteId },
        },
        {
            '@type': 'FAQPage',
            '@id': `${url}#faq`,
            mainEntity: page.faq.map((item) => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
        },
    ]

    if (page.path !== '/') {
        graph.push({
            '@type': 'BreadcrumbList',
            '@id': `${url}#breadcrumb`,
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: SITE.name,
                    item: `${SITE.url}/`,
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: page.navLabel,
                    item: url,
                },
            ],
        })
    }

    return { '@context': 'https://schema.org', '@graph': graph }
}

/** JSON-LD come testo, sicuro da inserire dentro un tag <script>. */
export function jsonLdString(page) {
    return JSON.stringify(buildJsonLd(page)).replace(/</g, '\\u003c')
}
