/**
 * Contenuti SEO di ogni scheda: unica fonte per il sito (SeoContent, meta tag
 * aggiornati alla navigazione) e per lo script di prerender (HTML statico,
 * sitemap, llms.txt).
 *
 * Solo dati e funzioni pure, senza import: lo legge anche Node.
 * Regola: niente numeri, recensioni o funzioni che il sito non ha davvero.
 */

export const SITE = {
    name: 'Chromatica Tools',
    url: 'https://chromaticatools.web.app',
    locale: 'it_IT',
    language: 'it-IT',
    github: 'https://github.com/Rene-1979/ChromaticaTools',
    license: 'PolyForm Noncommercial 1.0.0',
    logo: 'https://chromaticatools.web.app/logo.webp',
    logoAlt: 'Logo di Chromatica Tools',
    tagline: 'Colori · Contrasti · Accessibilità',
    summary:
        "Strumenti gratuiti, in italiano, per lavorare con i colori in modo accessibile: contrasto WCAG, simulazione del daltonismo, analisi di un sito web, palette (anche da un'immagine), ruota cromatica, gradienti ed esplorazione dei colori. Funziona nel browser: i colori e le immagini restano sul tuo dispositivo.",
    updated: '2026-11-08',
}

export const PAGES = [
    {
        id: 'contrast',
        path: '/',
        file: 'index.html',
        navLabel: 'Contrasto',
        group: "Accessibilità colore",
        appName: 'Verifica contrasto colori WCAG',
        title: 'Chromatica Tools: contrasto WCAG, palette e daltonismo',
        description:
            'Strumenti gratuiti per i colori: verifica il contrasto WCAG AA e AAA, simula il daltonismo, analizza un sito e crea palette e gradienti.',
        h1: 'Verifica il contrasto dei colori secondo WCAG',
        lead: "Il rapporto di contrasto misura quanto il colore del testo si distingue dallo sfondo, da 1:1 (nessuna differenza) a 21:1 (nero su bianco). Per le WCAG il testo normale deve raggiungere almeno 4,5:1 (livello AA) e il testo grande almeno 3:1: questo strumento calcola il rapporto, dice se i livelli AA e AAA sono superati e propone colori alternativi.",
        steps: [
            'Scegli il colore del testo e quello dello sfondo con il selettore o scrivendo il codice HEX.',
            'Leggi il rapporto di contrasto e l\'esito per i livelli AA e AAA, per testo normale e testo grande.',
            'Se il contrasto non basta, scegli una delle alternative di colore proposte e riprova.',
            'Copia o scarica i colori in CSS, JSON o HTML.',
        ],
        faq: [
            {
                q: 'Qual è il contrasto minimo richiesto dalle WCAG?',
                a: 'Il livello AA richiede almeno 4,5:1 per il testo normale e 3:1 per il testo grande. Il livello AAA richiede 7:1 per il testo normale e 4,5:1 per il testo grande. Per i componenti dell\'interfaccia e gli elementi grafici necessari a capire il contenuto, le WCAG 2.1 chiedono almeno 3:1 (criterio 1.4.11).',
            },
            {
                q: 'Cosa si intende per testo grande?',
                a: 'Per le WCAG è un testo di almeno 18 punti (circa 24 pixel) oppure di almeno 14 punti in grassetto (circa 18,7 pixel).',
            },
            {
                q: 'Come si calcola il rapporto di contrasto?',
                a: 'Si calcola la luminanza relativa dei due colori e si applica la formula (L1 + 0,05) / (L2 + 0,05), dove L1 è la luminanza del colore più chiaro e L2 quella del più scuro. Chromatica Tools usa la formula indicata dalle WCAG.',
            },
            {
                q: 'I miei colori vengono inviati a un server?',
                a: 'No. Il calcolo avviene nel tuo browser e i colori non vengono salvati.',
            },
        ],
        features: [
            'Rapporto di contrasto tra testo e sfondo',
            'Esito WCAG AA e AAA per testo normale e grande',
            'Alternative di colore con contrasto sufficiente',
            'Esportazione in CSS, JSON e HTML',
        ],
        related: ['accessibility', 'site', 'palettes', 'image-palette', 'wheel', 'explorer', 'gradients'],
    },
    {
        id: 'accessibility',
        path: '/daltonismo',
        file: 'daltonismo/index.html',
        navLabel: 'Daltonismo',
        group: 'Accessibilità colore',
        appName: 'Simulatore di daltonismo',
        title: 'Simulatore di daltonismo online | Chromatica Tools',
        description:
            'Simula come appaiono i tuoi colori con protanopia, deuteranopia e tritanopia e controlla se testo e sfondo restano leggibili. Gratis, nel browser.',
        h1: 'Simulatore di daltonismo per i colori',
        lead: 'Il daltonismo è una ridotta capacità di distinguere alcuni colori. Questo strumento mostra come una combinazione di testo e sfondo appare con protanopia (difficoltà con i rossi), deuteranopia (difficoltà con i verdi) e tritanopia (difficoltà con i blu), così puoi capire se il tuo design resta leggibile.',
        steps: [
            'Scegli il colore del testo e quello dello sfondo.',
            'Seleziona il tipo di visione da simulare: normale, protanopia, deuteranopia o tritanopia.',
            "Confronta l'anteprima e i codici HEX simulati con quelli originali.",
            'Per controllare il rapporto di contrasto passa alla scheda Contrasto.',
        ],
        faq: [
            {
                q: 'Quanto è diffuso il daltonismo?',
                a: 'Secondo le stime più citate riguarda circa l\'8% degli uomini e lo 0,5% delle donne di origine europea. La forma più comune è quella rosso-verde.',
            },
            {
                q: 'Che differenza c\'è tra protanopia, deuteranopia e tritanopia?',
                a: 'Nella protanopia manca la sensibilità ai rossi, nella deuteranopia ai verdi e nella tritanopia ai blu. Le prime due fanno confondere rossi, verdi e marroni; la tritanopia fa confondere blu e verde, giallo e viola.',
            },
            {
                q: 'La simulazione è precisa?',
                a: 'È indicativa: usa matrici standard di trasformazione del colore e non sostituisce una valutazione clinica né i test con persone reali.',
            },
            {
                q: 'Come rendere un design accessibile a chi ha il daltonismo?',
                a: 'Non usare il solo colore per comunicare un\'informazione: aggiungi etichette, icone, forme o sottolineature e mantieni una buona differenza di luminosità tra i colori.',
            },
        ],
        features: [
            'Simulazione di protanopia, deuteranopia e tritanopia',
            'Anteprima di testo e sfondo con i colori simulati',
            'Codici HEX dei colori simulati',
            'Esportazione in CSS, JSON e HTML',
        ],
        related: ['contrast', 'site', 'image-palette', 'palettes'],
    },
    {
        id: 'site',
        path: '/analizza-sito',
        file: 'analizza-sito/index.html',
        navLabel: 'Analizza sito',
        group: "Strumenti d'analisi",
        appName: "Analisi dell'accessibilità di un sito web",
        title: 'Analisi accessibilità sito web gratis | Chromatica Tools',
        description:
            "Inserisci l'indirizzo di un sito: controlla contrasto, daltonismo e problemi di accessibilità WCAG, con soluzioni suggerite e il punto esatto dell'errore.",
        h1: "Analizza l'accessibilità di un sito web",
        lead: "Inserisci l'indirizzo di una pagina: Chromatica Tools controlla il contrasto dei testi, come cambiano i colori per chi ha un deficit della visione cromatica e i principali problemi di accessibilità. Per ogni problema propone una soluzione e mostra in un'anteprima dove si trova.",
        steps: [
            "Scrivi l'indirizzo della pagina da controllare.",
            "Attendi l'analisi: l'app scarica l'HTML e il CSS della pagina e legge i colori reali.",
            'Leggi i risultati: contrasto, daltonismo, link riconoscibili solo dal colore e problemi strutturali.',
            "Premi «Mostra dove» per vedere l'elemento evidenziato e applica la soluzione suggerita.",
        ],
        faq: [
            {
                q: "Cosa controlla l'analisi?",
                a: "Il contrasto del testo rispetto al livello AA delle WCAG, le coppie di colori che peggiorano con protanopia, deuteranopia o tritanopia, i link distinguibili solo dal colore, e i problemi strutturali: lingua e titolo della pagina mancanti, zoom bloccato, titoli h1 e gerarchia dei titoli, immagini senza testo alternativo, campi senza etichetta, link e pulsanti senza nome accessibile.",
            },
            {
                q: 'Perché alcuni siti non si possono analizzare?',
                a: "L'analisi è statica: non esegue gli script della pagina, quindi i siti costruiti solo con JavaScript risultano quasi vuoti, e alcuni siti con protezione anti-bot rifiutano la richiesta. In questi casi lo strumento lo segnala.",
            },
            {
                q: "L'analisi sostituisce un audit di accessibilità?",
                a: 'No. I controlli automatici coprono solo una parte dei criteri WCAG: servono comunque verifiche manuali, per esempio con la sola tastiera e con uno screen reader.',
            },
            {
                q: "Cosa succede all'indirizzo che inserisco?",
                a: "Per scaricare la pagina l'indirizzo passa da un piccolo proxy che accetta solo indirizzi pubblici http e https. L'analisi dei colori avviene poi nel tuo browser.",
            },
        ],
        features: [
            'Contrasto del testo secondo WCAG AA',
            'Effetto di protanopia, deuteranopia e tritanopia sui colori del sito',
            'Link riconoscibili solo dal colore',
            'Controlli su lingua, titolo, zoom, titoli, immagini, campi e pulsanti',
            'Soluzioni suggerite e anteprima del punto esatto del problema',
        ],
        related: ['contrast', 'accessibility', 'image-palette', 'palettes'],
    },
    {
        id: 'image-palette',
        path: '/palette-da-immagine',
        file: 'palette-da-immagine/index.html',
        navLabel: 'Palette da immagine',
        group: "Strumenti d'analisi",
        appName: 'Palette di colori da immagine',
        title: 'Palette di colori da immagine | Chromatica Tools',
        description:
            'Carica una foto o un logo e ottieni tre palette per ogni armonia cromatica dai suoi colori reali. Elaborazione nel browser, esporta in CSS e JSON.',
        h1: "Palette di colori da un'immagine",
        lead: "Carica una foto o un logo e ottieni tre palette per ciascuna armonia cromatica (analoga, complementare, complementare divisa e triade), costruite sui colori reali dell'immagine. L'immagine non viene caricata su nessun server: resta sul tuo dispositivo.",
        steps: [
            "Carica un'immagine: clic, trascinamento oppure incolla con Ctrl+V.",
            "L'app estrae i colori principali e li usa come punto di partenza.",
            'Scegli tra le tre palette di ogni armonia: ogni colore è indicato come «dall\'immagine» o «calcolato».',
            'Controlla il contrasto, copia i codici HEX, esporta la palette o usala nel generatore di palette.',
        ],
        faq: [
            {
                q: 'Come vengono estratti i colori?',
                a: "L'immagine viene ridotta a 128 pixel sul lato lungo e analizzata con un algoritmo K-means nello spazio colore OKLab, che rispecchia meglio la percezione umana. Lo stesso file produce sempre lo stesso risultato.",
            },
            {
                q: 'Che differenza c\'è tra «dall\'immagine» e «calcolato»?',
                a: "«Dall'immagine» è un colore realmente presente nella foto. «Calcolato» è il colore teorico dell'armonia, usato quando nell'immagine non ce n'è uno adatto, con saturazione e luminosità adattate all'immagine.",
            },
            {
                q: 'Quali formati di immagine sono accettati?',
                a: 'PNG, JPG, WebP, GIF, AVIF e BMP, fino a 15 MB.',
            },
            {
                q: "L'immagine viene caricata su un server?",
                a: "No. L'elaborazione avviene al 100% nel tuo browser e l'immagine non lascia il tuo dispositivo.",
            },
            {
                q: 'Perché da una foto in bianco e nero non ottengo palette?',
                a: "Le immagini in scala di grigi non hanno tonalità su cui costruire un'armonia cromatica: lo strumento lo segnala e ti invita a provare con un'immagine a colori.",
            },
        ],
        features: [
            "Estrazione dei colori principali dell'immagine",
            'Tre palette per ciascuna delle quattro armonie cromatiche',
            'Controllo del contrasto WCAG su ogni colore',
            'Esportazione in CSS, JSON e HTML',
            "Elaborazione nel browser: l'immagine non viene caricata",
        ],
        related: ['palettes', 'wheel', 'contrast', 'site'],
    },
    {
        id: 'wheel',
        path: '/ruota-cromatica',
        file: 'ruota-cromatica/index.html',
        navLabel: 'Ruota cromatica',
        group: '',
        appName: 'Ruota cromatica e armonie di colore',
        title: 'Ruota cromatica e armonie di colore | Chromatica Tools',
        description:
            'Trascina i punti sulla ruota cromatica e crea armonie analoghe, complementari, complementari divise o in triade, con codici HEX da copiare ed esportare.',
        h1: 'Ruota cromatica e armonie di colore',
        lead: 'La ruota cromatica dispone le tonalità in cerchio. Trascinando i punti sulla ruota ottieni colori in armonia analoga, complementare, complementare divisa o triade, con i codici HEX pronti da copiare o esportare.',
        steps: [
            "Scegli l'armonia cromatica dal menu.",
            'Trascina i punti sulla ruota oppure scrivi un codice HEX per cambiare la tonalità.',
            'Blocca i colori che vuoi conservare: gli altri seguiranno l\'armonia.',
            'Copia i codici HEX o esporta i colori in CSS, JSON o HTML.',
        ],
        faq: [
            {
                q: "Cos'è un'armonia cromatica?",
                a: 'È una combinazione di colori scelta in base alla loro posizione sulla ruota cromatica, che tende a risultare equilibrata alla vista.',
            },
            {
                q: 'Che differenza c\'è tra complementare e complementare diviso?',
                a: 'I colori complementari sono opposti sulla ruota (180°). Nel complementare diviso si usa un colore e i due colori accanto al suo complementare, a 150° e 210°: il contrasto resta forte ma è meno netto.',
            },
            {
                q: 'Cosa sono i colori analoghi?',
                a: 'Sono colori vicini sulla ruota. In questo strumento il colore centrale è affiancato da due colori a 30° di distanza, in entrambe le direzioni.',
            },
            {
                q: "Cos'è una triade?",
                a: 'Sono tre colori equidistanti sulla ruota, a 120° l\'uno dall\'altro.',
            },
        ],
        features: [
            'Ruota cromatica con punti trascinabili',
            'Armonie analoga, complementare, complementare divisa e triade',
            'Blocco dei colori da conservare',
            'Esportazione in CSS, JSON e HTML',
        ],
        related: ['palettes', 'image-palette', 'explorer', 'contrast'],
    },
    {
        id: 'palettes',
        path: '/palette',
        file: 'palette/index.html',
        navLabel: 'Palette',
        group: '',
        appName: 'Generatore di palette di colori',
        title: 'Generatore di palette di colori | Chromatica Tools',
        description:
            "Crea palette di cinque colori da un colore base e da un'armonia, blocca quelli che ti piacciono, modifica gli HEX ed esporta in CSS, JSON o HTML.",
        h1: 'Generatore di palette di colori',
        lead: "Scegli un colore di partenza e un'armonia cromatica: il generatore crea una palette di cinque colori. Puoi bloccare i colori che ti piacciono, rigenerare gli altri, modificare ogni codice HEX ed esportare la palette in CSS, JSON o HTML.",
        steps: [
            'Scegli il colore di partenza con il selettore o scrivendo il codice HEX.',
            "Seleziona l'armonia: analoga, complementare, complementare divisa o triade.",
            'Blocca i colori da tenere e premi «Genera nuova palette» per cambiare gli altri.',
            'Modifica i singoli HEX, copia i colori o esporta la palette.',
        ],
        faq: [
            {
                q: 'Quanti colori ha una palette?',
                a: 'Cinque. Se l\'armonia scelta ne produce meno, gli slot rimasti vengono riempiti con colori coerenti e non troppo simili tra loro.',
            },
            {
                q: 'Come funziona il blocco dei colori?',
                a: 'Un colore bloccato resta uguale quando generi una nuova palette o cambi armonia: cambiano solo gli slot non bloccati.',
            },
            {
                q: 'Posso creare una palette partendo da una foto?',
                a: 'Sì: nella scheda «Palette da immagine» carichi un\'immagine, scegli una palette proposta e la porti qui con «Usa questa palette» per modificarla e bloccare i colori.',
            },
            {
                q: 'In che formati posso esportare la palette?',
                a: 'In CSS (variabili personalizzate), JSON e HTML, copiando il codice o scaricando il file.',
            },
        ],
        features: [
            "Palette di cinque colori da colore base e armonia",
            'Blocco dei colori da conservare',
            'Modifica manuale dei codici HEX',
            'Esportazione in CSS, JSON e HTML',
        ],
        related: ['image-palette', 'wheel', 'explorer', 'gradients', 'contrast'],
    },
    {
        id: 'explorer',
        path: '/esplora-colori',
        file: 'esplora-colori/index.html',
        navLabel: 'Esplora colori',
        group: '',
        appName: 'Esplora un colore: HEX, RGB, HSL e varianti',
        title: 'Esplora colori: HEX, RGB, HSL e varianti | Chromatica Tools',
        description:
            'Scegli un colore e scopri i suoi valori HEX, RGB e HSL, con sei varianti più chiare e più scure da copiare. Strumento gratuito, nel browser.',
        h1: 'Esplora un colore: HEX, RGB, HSL e varianti',
        lead: 'Scegli un colore e vedi subito i suoi valori in HEX, RGB e HSL, pronti da copiare. Lo strumento crea anche sei varianti, tre più scure e tre più chiare, ottenute cambiando la luminosità del colore.',
        steps: [
            'Scegli un colore con il selettore o scrivendo il codice HEX.',
            'Leggi i valori in HEX, RGB e HSL e copiali con un clic.',
            'Guarda le sei varianti più scure e più chiare e copia quella che ti serve.',
            "Per verificare che una variante sia leggibile usa la scheda Contrasto.",
        ],
        faq: [
            {
                q: 'Cosa sono HEX, RGB e HSL?',
                a: 'Sono tre modi di scrivere lo stesso colore. HEX è un codice esadecimale a sei cifre (#RRGGBB). RGB indica le quantità di rosso, verde e blu, da 0 a 255. HSL indica tonalità (0-360°), saturazione e luminosità in percentuale.',
            },
            {
                q: 'Come vengono create le varianti?',
                a: 'Cambiando la luminosità HSL del colore di 10, 25 e 40 punti percentuali, in più e in meno, e mantenendo tonalità e saturazione.',
            },
            {
                q: 'Una variante più chiara o più scura è sempre leggibile?',
                a: 'No: la leggibilità dipende dal colore con cui la abbini. Controlla sempre il rapporto di contrasto con lo strumento dedicato.',
            },
        ],
        features: [
            'Valori HEX, RGB e HSL con copia rapida',
            'Sei varianti più chiare e più scure',
            'Selettore di colore e campo HEX',
        ],
        related: ['wheel', 'palettes', 'contrast', 'gradients'],
    },
    {
        id: 'gradients',
        path: '/gradienti',
        file: 'gradienti/index.html',
        navLabel: 'Gradienti',
        group: '',
        appName: 'Generatore di gradienti CSS',
        title: 'Generatore di gradienti CSS | Chromatica Tools',
        description:
            'Crea gradienti lineari, radiali e conici con fino a 8 colori, regola angolo e posizioni e copia il codice CSS. Gratuito, direttamente nel browser.',
        h1: 'Generatore di gradienti CSS',
        lead: 'Crea sfumature lineari, radiali o coniche con da 2 a 8 colori, regola l\'angolo e la posizione di ogni colore e copia il codice CSS pronto da usare nei tuoi progetti.',
        steps: [
            'Scegli il tipo di gradiente: lineare, radiale o conico.',
            "Imposta l'angolo e modifica colore e posizione di ogni punto; puoi aggiungere fino a 8 colori.",
            "Guarda l'anteprima in tempo reale.",
            'Copia il codice CSS oppure esporta i colori in CSS, JSON o HTML.',
        ],
        faq: [
            {
                q: 'Che differenza c\'è tra gradiente lineare, radiale e conico?',
                a: 'Nel gradiente lineare i colori scorrono lungo una direzione. Nel radiale si espandono dal centro verso l\'esterno. Nel conico ruotano attorno al centro, come le fette di una torta.',
            },
            {
                q: 'Quanti colori posso usare?',
                a: 'Da 2 a 8, ciascuno con una propria posizione in percentuale.',
            },
            {
                q: 'Come uso il codice generato?',
                a: 'Incolla la riga `background: ...;` nel CSS dell\'elemento che vuoi colorare: il browser la applica direttamente, senza immagini.',
            },
        ],
        features: [
            'Gradienti lineari, radiali e conici',
            'Da 2 a 8 colori con posizione regolabile',
            'Anteprima in tempo reale',
            'Codice CSS pronto da copiare',
        ],
        related: ['palettes', 'explorer', 'wheel', 'contrast'],
    },
]

/** Scheda (per id) e scheda (per percorso). */
export function getPage(id) {
    return PAGES.find((page) => page.id === id)
}

export function getPageByPath(pathname) {
    const clean =
        pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname

    return PAGES.find((page) => page.path === clean) ?? null
}

export function getPageUrl(page) {
    return page.path === '/' ? `${SITE.url}/` : `${SITE.url}${page.path}`
}
