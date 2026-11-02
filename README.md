# Chromatica Tools

**🇮🇹 [Italiano](#-italiano) · 🇬🇧 [English](#-english)**

🌐 **Live / Online:** https://chromaticatools.web.app

---

## 🇮🇹 Italiano

Chromatica Tools è un insieme di strumenti gratuiti per lavorare con i colori in modo accessibile: contrasto WCAG, simulazione del daltonismo, palette, gradienti e, soprattutto, l'**analisi di un sito web a partire dal suo indirizzo**.

### Funzionalità

| Scheda | Cosa fa |
| --- | --- |
| **Contrasto** | Calcola il rapporto di contrasto tra testo e sfondo e verifica i livelli WCAG AA/AAA. |
| **Accessibilità** | Simula protanopia, deuteranopia e tritanopia su una combinazione di colori. |
| **Analizza sito** | Inserisci un URL: controlla contrasto, daltonismo e principali problemi di accessibilità, con soluzioni suggerite e anteprima del punto esatto del problema. |
| **Ruota cromatica** | Esplora le armonie di colore. |
| **Palette** | Genera palette coerenti. |
| **Esplora colori** | Sfoglia e confronta i colori. |
| **Gradienti** | Crea gradienti ed esportali. |

Le palette e i colori si possono esportare in diversi formati.

### Analizza sito

Dato l'indirizzo di una pagina, lo strumento segnala:

- **Contrasto del testo** sotto le soglie WCAG AA (4,5:1 per il testo normale, 3:1 per il testo grande).
- **Daltonismo:** le combinazioni che superano la soglia con visione normale ma la perdono con protanopia, deuteranopia o tritanopia.
- **Link riconoscibili solo dal colore** (WCAG 1.4.1).
- **Problemi strutturali:** `lang` e `title` mancanti, zoom bloccato, `h1` e gerarchia dei titoli, immagini senza `alt`, campi senza etichetta, link e pulsanti senza nome accessibile.

Per ogni problema trovato:

- una **soluzione suggerita**: per i colori, un'alternativa vicina all'originale che passa la soglia anche con i tre tipi di daltonismo; per il resto, una spiegazione con esempio di codice;
- il pulsante **«Mostra dove»**, che apre un'anteprima della pagina con l'elemento coinvolto cerchiato in rosso.

### Come funziona

Il browser non può leggere i siti di terzi (CORS), quindi la pagina viene scaricata tramite un piccolo **proxy gratuito**:

- in produzione, un [Cloudflare Worker](proxy/worker.js) (piano Free, nessuna carta richiesta);
- in sviluppo, un middleware di Vite definito in [`vite.config.js`](vite.config.js).

L'analisi vera e propria avviene **nel browser**: HTML e CSS vengono caricati in un iframe isolato, senza esecuzione di script, e i colori reali sono letti con `getComputedStyle`. Il proxy accetta solo indirizzi `http`/`https` pubblici e blocca gli indirizzi locali o privati.

### Limiti

- L'analisi è **statica**: gli script della pagina non vengono eseguiti, quindi i siti costruiti interamente via JavaScript risultano quasi vuoti.
- Il testo su **immagini di sfondo** non è verificabile automaticamente e viene conteggiato a parte.
- Alcuni siti con protezione anti-bot rifiutano la richiesta del proxy: l'app lo segnala.
- L'anteprima è una ricostruzione da HTML e CSS, non uno screenshot del sito reale.
- Le simulazioni del daltonismo sono indicative. I controlli automatici coprono solo una parte dei criteri WCAG e non sostituiscono una verifica manuale.

### Sviluppo locale

Requisiti: Node.js 20 o superiore.

```bash
npm install
npm run dev      # avvia l'app su http://localhost:5173 (con il proxy locale)
npm run build    # build di produzione in dist/
npm run lint     # controllo ESLint
```

### Pubblicazione

**1. Proxy (Cloudflare Workers, gratuito).** Istruzioni complete in [`proxy/README.md`](proxy/README.md). In breve:

```bash
npx wrangler login
npx wrangler deploy proxy/worker.js --name chromatica-proxy --compatibility-date 2025-01-01 --var ALLOWED_ORIGIN:https://tuo-dominio
```

Poi crea `.env.production` con l'indirizzo del Worker:

```
VITE_PROXY_URL=https://chromatica-proxy.<tuo-account>.workers.dev
```

**2. Sito (Firebase Hosting).**

```bash
npm run build
npx firebase deploy --only hosting
```

### Tecnologie

React 19 · Vite · Tailwind CSS 4 · Cloudflare Workers · Firebase Hosting

### Struttura del progetto

```
src/components/   schede dell'app (Contrasto, Analizza sito, Palette, …)
src/utils/        contrasto, simulazione daltonismo, analizzatore, soluzioni suggerite
proxy/            proxy per Cloudflare Workers e controlli di sicurezza condivisi
```

---

## 🇬🇧 English

Chromatica Tools is a free set of tools for working with colour accessibly: WCAG contrast checking, colour-blindness simulation, palettes, gradients and, above all, **website analysis starting from a URL**.

### Features

| Tab | What it does |
| --- | --- |
| **Contrast** (*Contrasto*) | Computes the text/background contrast ratio and checks WCAG AA/AAA levels. |
| **Accessibility** (*Accessibilità*) | Simulates protanopia, deuteranopia and tritanopia on a colour pair. |
| **Analyse site** (*Analizza sito*) | Enter a URL: it checks contrast, colour blindness and the main accessibility issues, with suggested fixes and a preview of exactly where each problem is. |
| **Colour wheel** (*Ruota cromatica*) | Explore colour harmonies. |
| **Palettes** (*Palette*) | Generate coherent palettes. |
| **Colour explorer** (*Esplora colori*) | Browse and compare colours. |
| **Gradients** (*Gradienti*) | Build and export gradients. |

Colours and palettes can be exported in several formats. The interface is currently in Italian.

### Analyse site

Given a page address, the tool reports:

- **Text contrast** below WCAG AA thresholds (4.5:1 for normal text, 3:1 for large text).
- **Colour blindness:** colour pairs that pass with normal vision but fail with protanopia, deuteranopia or tritanopia.
- **Links distinguishable by colour alone** (WCAG 1.4.1).
- **Structural issues:** missing `lang` and `title`, disabled zoom, `h1` and heading order, images without `alt`, unlabelled form fields, links and buttons without an accessible name.

For every issue it finds:

- a **suggested fix**: for colours, an alternative close to the original that passes the threshold under all three colour-blindness types; for everything else, an explanation with a code example;
- a **"Show where"** button (*«Mostra dove»*) that opens a preview of the page with the affected element outlined in red.

### How it works

Browsers cannot read third-party sites (CORS), so the page is fetched through a small **free proxy**:

- in production, a [Cloudflare Worker](proxy/worker.js) (Free plan, no credit card needed);
- in development, a Vite middleware defined in [`vite.config.js`](vite.config.js).

The analysis itself runs **in the browser**: the HTML and CSS are loaded into an isolated iframe with scripts disabled, and the real colours are read with `getComputedStyle`. The proxy only accepts public `http`/`https` addresses and blocks local and private ones.

### Limitations

- The analysis is **static**: page scripts are not executed, so sites built entirely with JavaScript appear almost empty.
- Text over **background images** cannot be checked automatically and is counted separately.
- Some sites with bot protection refuse the proxy's request; the app reports this.
- The preview is a reconstruction from HTML and CSS, not a screenshot of the live site.
- Colour-blindness simulations are indicative. Automated checks cover only part of the WCAG criteria and do not replace manual testing.

### Local development

Requirements: Node.js 20 or later.

```bash
npm install
npm run dev      # starts the app at http://localhost:5173 (with the local proxy)
npm run build    # production build into dist/
npm run lint     # ESLint
```

### Deployment

**1. Proxy (Cloudflare Workers, free).** Full instructions in [`proxy/README.md`](proxy/README.md) (in Italian). In short:

```bash
npx wrangler login
npx wrangler deploy proxy/worker.js --name chromatica-proxy --compatibility-date 2025-01-01 --var ALLOWED_ORIGIN:https://your-domain
```

Then create `.env.production` with the Worker address:

```
VITE_PROXY_URL=https://chromatica-proxy.<your-account>.workers.dev
```

**2. Site (Firebase Hosting).**

```bash
npm run build
npx firebase deploy --only hosting
```

### Tech stack

React 19 · Vite · Tailwind CSS 4 · Cloudflare Workers · Firebase Hosting

### Project structure

```
src/components/   app tabs (Contrast, Analyse site, Palettes, …)
src/utils/        contrast, colour-blindness simulation, analyser, suggested fixes
proxy/            Cloudflare Workers proxy and shared security checks
```
