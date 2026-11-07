# Chromatica Tools

**🇮🇹 [Italiano](#-italiano) · 🇬🇧 [English](#-english)**

🌐 **Live / Online:** https://chromaticatools.web.app

---

## 🇮🇹 Italiano

Chromatica Tools è un insieme di strumenti gratuiti per lavorare con i colori in modo accessibile: contrasto WCAG, simulazione del daltonismo, palette (anche da un'immagine), gradienti e, soprattutto, l'**analisi di un sito web a partire dal suo indirizzo**.

### Funzionalità

| Scheda | Cosa fa |
| --- | --- |
| **Contrasto** | Calcola il rapporto di contrasto tra testo e sfondo e verifica i livelli WCAG AA/AAA. |
| **Accessibilità** | Simula protanopia, deuteranopia e tritanopia su una combinazione di colori. |
| **Analizza sito** | Inserisci un URL: controlla contrasto, daltonismo e principali problemi di accessibilità, con soluzioni suggerite e anteprima del punto esatto del problema. |
| **Ruota cromatica** | Esplora le armonie di colore. |
| **Palette** | Genera palette coerenti, blocca i colori che ti piacciono ed esportale. |
| **Palette da immagine** | Carica una foto o un logo: ricevi 3 palette per ogni armonia cromatica, costruite sui colori reali dell'immagine, con controllo del contrasto WCAG. |
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

### Palette da immagine

Carica un'immagine (clic, trascinamento o incolla con Ctrl+V; PNG, JPG, WebP, GIF, AVIF o BMP, fino a 15 MB): l'app propone **3 palette per ciascuna armonia** (Analogo, Complementare, Complementare diviso, Triade), partendo dai colori reali dell'immagine.

- **Estrazione dei colori:** l'immagine viene ridotta a 128 px sul lato lungo e analizzata con un K-means scritto per il progetto, in spazio colore **OKLab** (percettivo). Il risultato è deterministico: la stessa immagine dà sempre le stesse palette.
- **Tre basi diverse** per ogni armonia, così le palette non sono varianti quasi identiche: il colore più dominante, il più vivace e quello con la luminosità più diversa dalle altre basi. Se non è possibile averne tre davvero diverse, ne mostra meno e lo spiega.
- **Colori «dall'immagine» o «calcolati»:** per ogni angolo dell'armonia usa il colore dell'immagine più vicino per tonalità (entro ±28°); se non ce n'è uno adatto, usa il colore teorico con saturazione e luminosità adattate all'immagine. Ogni colore ha un badge che ne indica l'origine. Fino a due neutri dell'immagine (il più chiaro e il più scuro) completano la palette.
- **Come le altre palette:** copia HEX con un clic, mini-check di contrasto WCAG (testo bianco o nero su ogni colore), esportazione in CSS, JSON e HTML e pulsante **«Usa questa palette»**, che la carica nel generatore di palette (dove puoi modificarla e bloccare i colori).
- **Privacy:** l'elaborazione è al 100% nel browser, l'immagine non viene caricata su nessun server.

Limiti: le immagini in scala di grigi o completamente trasparenti non hanno tonalità su cui costruire un'armonia (l'app lo segnala); le immagini quasi monocromatiche producono meno palette diverse.

### Come funziona l'analisi dei siti

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
src/components/   schede dell'app (Contrasto, Analizza sito, Palette, Palette da immagine, …)
src/utils/        contrasto, armonie, simulazione daltonismo, estrazione colori da immagine, analizzatore, soluzioni suggerite
proxy/            proxy per Cloudflare Workers e controlli di sicurezza condivisi
```

### Licenza

Il codice è **visibile e liberamente utilizzabile per scopi non commerciali** (uso personale, studio, ricerca, scuole, enti pubblici e organizzazioni non profit) secondo la licenza [PolyForm Noncommercial 1.0.0](LICENSE). **L'uso commerciale non è consentito** senza un accordo scritto con l'autore: per richiederlo, apri una [issue](https://github.com/Rene-1979/ChromaticaTools/issues).

Non è una licenza «open source» in senso stretto (OSI), ma una licenza *source-available*.

---

## 🇬🇧 English

Chromatica Tools is a free set of tools for working with colour accessibly: WCAG contrast checking, colour-blindness simulation, palettes (also from an image), gradients and, above all, **website analysis starting from a URL**.

### Features

| Tab | What it does |
| --- | --- |
| **Contrast** (*Contrasto*) | Computes the text/background contrast ratio and checks WCAG AA/AAA levels. |
| **Accessibility** (*Accessibilità*) | Simulates protanopia, deuteranopia and tritanopia on a colour pair. |
| **Analyse site** (*Analizza sito*) | Enter a URL: it checks contrast, colour blindness and the main accessibility issues, with suggested fixes and a preview of exactly where each problem is. |
| **Colour wheel** (*Ruota cromatica*) | Explore colour harmonies. |
| **Palettes** (*Palette*) | Generate coherent palettes, lock the colours you like and export them. |
| **Palette from image** (*Palette da immagine*) | Upload a photo or a logo: get 3 palettes for each colour harmony, built from the image's real colours, with a WCAG contrast check. |
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

### Palette from image

Upload an image (click, drag and drop, or paste with Ctrl+V; PNG, JPG, WebP, GIF, AVIF or BMP, up to 15 MB): the app suggests **3 palettes for each harmony** (Analogous, Complementary, Split-complementary, Triadic), starting from the image's real colours.

- **Colour extraction:** the image is downscaled to 128 px on its long side and analysed with a K-means written for this project, in the perceptual **OKLab** colour space. The result is deterministic: the same image always gives the same palettes.
- **Three different bases** per harmony, so palettes are not near-identical variants: the most dominant colour, the most vivid one, and the one whose lightness differs most from the other bases. When three truly different palettes are not possible, fewer are shown and the app says why.
- **"From the image" or "calculated" colours:** for each harmony angle it uses the image colour closest in hue (within ±28°); when none fits, it uses the theoretical colour with saturation and lightness adapted to the image. Each colour carries a badge showing its origin. Up to two neutrals from the image (the lightest and the darkest) complete the palette.
- **Like every other palette:** one-click HEX copy, a WCAG contrast mini-check (white or black text on each colour), export to CSS, JSON and HTML, and a **"Use this palette"** button that loads it into the palette generator (where you can edit it and lock colours).
- **Privacy:** processing is 100% in the browser; the image is never uploaded to any server.

Limitations: greyscale or fully transparent images have no hues to build a harmony on (the app says so); near-monochrome images produce fewer different palettes.

### How the site analysis works

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
src/components/   app tabs (Contrast, Analyse site, Palettes, Palette from image, …)
src/utils/        contrast, harmonies, colour-blindness simulation, image colour extraction, analyser, suggested fixes
proxy/            Cloudflare Workers proxy and shared security checks
```

### License

The code is **visible and free to use for noncommercial purposes** (personal use, study, research, schools, public bodies and non-profit organisations) under the [PolyForm Noncommercial 1.0.0](LICENSE) license. **Commercial use is not permitted** without a written agreement with the author: to ask for one, open an [issue](https://github.com/Rene-1979/ChromaticaTools/issues).

This is not an "open source" license in the strict (OSI) sense, but a *source-available* one.
