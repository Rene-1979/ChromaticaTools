import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { validateTarget, MAX_BYTES } from './proxy/guard.js'

// Equivalente locale del Worker in proxy/worker.js (solo in sviluppo).
function devSiteProxy() {
  return {
    name: 'dev-site-proxy',
    configureServer(server) {
      server.middlewares.use('/api/fetch', async (req, res) => {
        const send = (status, data) => {
          res.statusCode = status
          res.setHeader('content-type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(data))
        }

        const target = validateTarget(
          new URL(req.url, 'http://localhost').searchParams.get('url')
        )
        if (target.error) return send(400, { error: target.error })

        try {
          const upstream = await fetch(target.url, {
            redirect: 'follow',
            signal: AbortSignal.timeout(10000),
            headers: {
              'user-agent': 'ChromaticaToolsBot/1.0 (+accessibility check)',
              accept: 'text/html,text/css,*/*;q=0.8',
            },
          })

          const contentType = upstream.headers.get('content-type') || ''
          if (!/text\/(html|css)|application\/xhtml/i.test(contentType)) {
            return send(415, { error: 'Tipo di contenuto non supportato.' })
          }

          const buffer = await upstream.arrayBuffer()
          if (buffer.byteLength > MAX_BYTES) {
            return send(413, { error: 'Risorsa troppo grande.' })
          }

          send(200, {
            status: upstream.status,
            finalUrl: upstream.url,
            contentType,
            body: new TextDecoder().decode(buffer),
          })
        } catch {
          send(502, { error: 'Impossibile raggiungere il sito richiesto.' })
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devSiteProxy()],
})
