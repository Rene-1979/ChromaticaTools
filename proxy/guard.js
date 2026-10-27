// Controllo condiviso (dev + Worker): accetta solo http(s) verso host pubblici.
export function validateTarget(raw) {
    let url
    try {
        url = new URL(raw)
    } catch {
        return { error: 'Indirizzo non valido.' }
    }

    if (!['http:', 'https:'].includes(url.protocol)) {
        return { error: 'Sono ammessi solo indirizzi http e https.' }
    }

    const host = url.hostname.toLowerCase()
    const privateHost =
        host === 'localhost' ||
        host.endsWith('.localhost') ||
        host.endsWith('.local') ||
        host.endsWith('.internal') ||
        host === '[::1]' ||
        /^(127|10|0)\./.test(host) ||
        /^192\.168\./.test(host) ||
        /^169\.254\./.test(host) ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(host)

    if (privateHost) {
        return { error: 'Indirizzi locali o privati non consentiti.' }
    }

    return { url }
}

export const MAX_BYTES = 3 * 1024 * 1024
