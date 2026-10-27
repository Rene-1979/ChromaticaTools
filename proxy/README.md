# Proxy gratuito per l'analisi dei siti

Il browser non può leggere siti di terzi (CORS), quindi l'analizzatore passa da questo proxy.

- **Sviluppo (`npm run dev`)**: il plugin in `vite.config.js` espone `/api/fetch`, nessuna configurazione.
- **Produzione**: Cloudflare Workers, piano Free (nessuna carta richiesta).

## Deploy del Worker

```bash
npm create cloudflare@latest -- chromatica-proxy   # oppure usa wrangler direttamente
npx wrangler deploy proxy/worker.js --name chromatica-proxy --compatibility-date 2025-01-01 --var ALLOWED_ORIGIN:https://chromaticatools.web.app
```

Poi crea `.env.production` nel progetto:

```
VITE_PROXY_URL=https://chromatica-proxy.<tuo-account>.workers.dev
```

e rifai `npm run build` + deploy su Firebase Hosting.

## Limiti

- Analisi statica: gli script della pagina non vengono eseguiti, quindi i siti che costruiscono la pagina solo via JavaScript (SPA) risultano quasi vuoti.
- Le aree con immagini di sfondo non sono verificabili e vengono segnalate come tali.
