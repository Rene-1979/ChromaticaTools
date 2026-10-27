// Proxy gratuito per Cloudflare Workers (piano Free: 100.000 richieste/giorno).
// Deploy: vedi proxy/README.md. Imposta ALLOWED_ORIGIN con il dominio dell'app.
import { validateTarget, MAX_BYTES } from './guard.js'

const json = (data, status, origin) =>
    new Response(JSON.stringify(data), {
        status,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'access-control-allow-origin': origin,
        },
    })

export default {
    async fetch(request, env) {
        const origin = env.ALLOWED_ORIGIN || '*'

        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'access-control-allow-origin': origin,
                    'access-control-allow-methods': 'GET',
                },
            })
        }

        const target = validateTarget(new URL(request.url).searchParams.get('url'))
        if (target.error) return json({ error: target.error }, 400, origin)

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
                return json({ error: 'Tipo di contenuto non supportato.' }, 415, origin)
            }

            const buffer = await upstream.arrayBuffer()
            if (buffer.byteLength > MAX_BYTES) {
                return json({ error: 'Risorsa troppo grande.' }, 413, origin)
            }

            return json(
                {
                    status: upstream.status,
                    finalUrl: upstream.url,
                    contentType,
                    body: new TextDecoder().decode(buffer),
                },
                200,
                origin
            )
        } catch {
            return json({ error: 'Impossibile raggiungere il sito richiesto.' }, 502, origin)
        }
    },
}
