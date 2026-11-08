# CLAUDE.md - Chromatica Tools

Istruzioni per Claude Code. Leggile all'inizio di ogni sessione.

## Il progetto
- Strumenti gratuiti per lavorare con i colori in modo accessibile: contrasto WCAG, simulazione del daltonismo, ruota cromatica, palette, "Palette da immagine", esplora colori, gradienti e "Analizza sito" (URL in input, problemi di accessibilita' con soluzioni e anteprima del punto esatto).
- Prima si chiamava Contrast Check (`07-Contrast-Check`): e' lo stesso progetto con il nome definitivo. Progetto da mostrare nel portfolio.
- Online: https://chromaticatools.web.app (Firebase Hosting, progetto `chromaticatools`).
- GitHub: https://github.com/Rene-1979/ChromaticaTools, ramo `main`. Licenza PolyForm Noncommercial 1.0.0, README bilingue italiano/inglese.

## Stack
React + Vite + Tailwind (`@tailwindcss/vite`), eslint. "Analizza sito" usa un worker Cloudflare in `proxy/` (`worker.js`, `guard.js`); l'indirizzo pubblico del worker e' in `.env.production` (`VITE_PROXY_URL`).

## Struttura (cosa e' dove)
- `src/App.jsx`: nessun router (libreria), un solo `activeTab` sincronizzato con l'indirizzo (vedi SEO e GEO). Il menu e' l'array `menu` (voci singole e gruppi con `children`): "Accessibilita' colore" (Contrasto, Daltonismo), "Strumenti d'analisi" (Analizza sito, Palette da immagine), poi Ruota cromatica, Palette, Esplora colori, Gradienti. `tabs` e' l'elenco piatto derivato (titolo mobile, footer). Le schede si smontano al cambio: il loro stato locale si perde. Per cambiare scheda usare `changeTab` (non `setActiveTab`): azzera la palette importata.
- `src/components/MainNav.jsx`: il menu (tendine su desktop con clic, Esc, frecce; elenco raggruppato su mobile). Le voci vanno a capo, non scorrono. Per aggiungere una scheda: voce in `menu` di `App.jsx`, icona in `icons`, blocco `activeTab === ...`.
- La scheda `accessibility` (file `Accessibility.jsx`) si chiama "Daltonismo" nell'interfaccia; l'id e i nomi dei file sono rimasti uguali.
- `src/utils/colorHarmony.js`: **unica fonte** delle armonie (`HARMONIES`: id, etichetta, angoli HSL). La usano ruota, generatore di palette e palette da immagine. Non riscrivere angoli o etichette altrove.
- `src/components/ExportPanel.jsx` + `src/utils/exportFormats.js`: esportazione unica (CSS, JSON, HTML) per tutte le schede.
- `src/utils/contrast.js`: `getContrastRatio` e `getWcagStatus` (soglie AA/AAA).
- Tema chiaro/scuro: nessuna variabile CSS, classi Tailwind con il ternario `isDark` passato come prop.

## Palette da immagine
- File: `components/ImagePalette.jsx` (upload, stato, risultati), `components/ImagePaletteCard.jsx` (una palette), `utils/imageSampling.js` (file, canvas, limiti), `utils/colorExtraction.js` (K-means), `utils/oklab.js`, `utils/harmonyFromImage.js` (armonie), `utils/paletteContrast.js` (mini-check WCAG).
- Tutto client-side: l'immagine non lascia il dispositivo. Ridotta a 128 px, nessun Web Worker (circa 50 ms nel caso peggiore).
- K-means pesato in OKLab, K = 10, centri iniziali deterministici (niente `Math.random`): stessa immagine, stesso risultato. Neutri = croma OKLab < 0.03. I colori simili (distanza OKLab < 0.04) si fondono.
- Armonie: per ogni armonia 3 palette con basi diverse (dominante, piu' vivace, luminosita' piu' diversa). Gli angoli si cercano per hue HSL (coerente con ruota e generatore) con tolleranza +-28 gradi; senza match si usa il colore teorico con S/L adattate. Ogni colore ha `source` (`image` o `computed`) e `role` (`base`, `harmony`, `neutral`). Palette duplicate scartate.
- "Usa questa palette" passa `{colors, harmony, base}` ad `App`, che la da' a `PaletteGenerator` (prop `imported`): i colori occupano i primi slot, sbloccati; il resto si riempie con l'armonia.
- Limiti noti: scala di grigi e immagini trasparenti non producono palette (messaggio); immagini quasi monocromatiche producono meno palette.

## SEO e GEO (non romperli)
- **Un indirizzo per scheda**, senza router: `src/content/pages.js` e' l'unica fonte di percorso, titolo (max 65 caratteri), descrizione (70-165), H1, risposta breve (`lead`), `steps`, `faq`, `features`, `related`. `App.jsx` legge il percorso e usa `history.pushState`; `utils/pageMeta.js` aggiorna titolo, canonical, anteprime e JSON-LD alla navigazione.
- **Prerender** (`scripts/prerender.mjs`, eseguito da `npm run build`): scrive per ogni scheda `dist/<percorso>/index.html` con meta, JSON-LD (`content/schema.js`) e il testo in HTML statico dentro `#root` (React lo sostituisce al caricamento); genera anche `sitemap.xml`, `llms.txt` e `404.html`. `index.html` ha i marcatori `<!-- seo:head:start/end -->` e `<!-- seo:body -->`: non toglierli.
- **Controllo:** dopo la build `npm run check:seo` (un solo H1, canonical, JSON-LD valido, link interni, sitemap, robots). Deve dare "nessun problema".
- **IndexNow:** chiave pubblica in `SITE.indexNowKey` (`pages.js`) e nel file `public/<chiave>.txt` (deve restare: Bing lo controlla; `check:seo` lo verifica). Dopo ogni deploy che cambia pagine o indirizzi: `npm run indexnow` (verifica che il file chiave sia online, poi invia gli indirizzi a Bing; 200/202 = ricevuto). Google non lo supporta: per Google serve la Search Console.
- **Nuova scheda:** voce in `PAGES`, voce in `menu` di `App.jsx`, blocco `activeTab`, `getPage('id').h1` nell'H1 del componente, percorso nell'elenco `headers` di `firebase.json`. La scheda compare da sola in sitemap, llms.txt e link interni.
- **Link veri:** menu, footer, logo e "altri strumenti" sono `<a href>` (clic normale resta nell'app, Ctrl/Cmd+clic apre il link): i crawler non seguono i `<button>`.
- **Un solo H1 per pagina** (titolo della scheda dai dati); `<main>` contiene solo il contenuto, non intestazione, menu e footer.
- **Contenuti:** niente numeri, recensioni, valutazioni o funzioni inventati; i dati strutturati devono riflettere il testo visibile. Se si cambia una funzione, aggiornare `pages.js` (e il README).
- **Firebase:** niente `cleanUrls` (reindirizzerebbe il file di verifica Google `google2732f4e511c9cb11.html`); le pagine sono cartelle con `index.html` e `trailingSlash: false`. Nessun rewrite a `index.html`: gli indirizzi sconosciuti danno 404 vero (`404.html`, `noindex`). Se arriva un dominio personalizzato: cambiare `SITE.url` in `pages.js`, `public/robots.txt` e `index.html`.
- **`robots.txt`** ammette tutti i crawler, AI compresi (scelta di visibilita'). Per escludere l'addestramento si puo' mettere `Disallow: /` a GPTBot, ClaudeBot, CCBot, Google-Extended, Applebot-Extended.

## Comandi
- `npm install` (prima volta)
- `npm run dev`
- `npm run build` (build + prerender SEO)
- `npm run check:seo` (dopo la build)
- `npm run indexnow` (dopo il deploy, avvisa Bing degli indirizzi)
- `npm run lint`
- `npm run preview`
- Deploy: `firebase deploy`

## Regole
- Lavorare SOLO in questa cartella (Second Brain). La copia in `E:\2026-Claude-Code-WS\01-inSVILUPPO\07-Contrast-Check` e' solo backup.
- Non fare push senza che Rene' lo chieda.
- In Git alcuni file risultano "modificati" solo per le fine riga CRLF/LF: non sono modifiche vere.
- Nel progetto non ci sono chiavi o password e non vanno aggiunte. Il worker del proxy ha un file `guard.js`: prima di modificarlo capire cosa protegge e non indebolirlo.
- Mantenere README e licenza coerenti (italiano e inglese) se si cambia qualcosa.
- Non ci sono test automatici e non va introdotto un framework solo per questo: le funzioni pure si provano nel browser (dev server, `import('/src/utils/...')`) e a mano con immagini di prova.
- Lint: restano 7 errori che c'erano gia' prima (`Accessibility.jsx` e `Contrast.jsx`, regole React nuove). Non aggiungerne.
- Per aprire il dev server dal pannello Browser serve un `.claude/launch.json` nella cartella del progetto (`Z:\SecondBrain\Progetti\chromatica-tools\.claude\`, con `npm --prefix codice run dev`).
