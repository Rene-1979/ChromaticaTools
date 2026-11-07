import { getSampleSize } from './colorExtraction'

export const ACCEPTED_TYPES = [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'image/avif',
    'image/bmp',
]

export const MAX_FILE_SIZE = 15 * 1024 * 1024
export const MAX_FILE_SIZE_LABEL = '15 MB'

// Oltre questa risoluzione il browser potrebbe esaurire la memoria in decodifica.
const MAX_PIXELS = 100_000_000

/** Errore con un messaggio già pronto da mostrare all'utente. */
export class ImageLoadError extends Error {}

/** Controlla tipo e peso del file prima di leggerlo. */
export function validateImageFile(file) {
    if (!file || !ACCEPTED_TYPES.includes(file.type)) {
        throw new ImageLoadError(
            'Formato non supportato. Carica un\'immagine PNG, JPG, WebP, GIF, AVIF o BMP.'
        )
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new ImageLoadError(
            `L'immagine pesa più di ${MAX_FILE_SIZE_LABEL}. Scegline una più leggera.`
        )
    }
}

/** Carica un'immagine da un URL (anche blob:). */
export function loadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image()

        image.onload = () => resolve(image)
        image.onerror = () =>
            reject(
                new ImageLoadError(
                    'Non riesco a leggere questa immagine. Il file potrebbe essere danneggiato.'
                )
            )
        image.src = url
    })
}

/**
 * Disegna l'immagine su un canvas ridotto e ne restituisce i pixel RGBA.
 * Tutto avviene nel browser: l'immagine non viene inviata a nessun server.
 */
export function sampleImagePixels(image) {
    const { naturalWidth, naturalHeight } = image

    if (!naturalWidth || !naturalHeight) {
        throw new ImageLoadError('L\'immagine non ha dimensioni valide.')
    }

    if (naturalWidth * naturalHeight > MAX_PIXELS) {
        throw new ImageLoadError(
            'L\'immagine è troppo grande (oltre 100 megapixel). Ridimensionala e riprova.'
        )
    }

    const { width, height } = getSampleSize(naturalWidth, naturalHeight)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d', { willReadFrequently: true })
    context.imageSmoothingQuality = 'high'
    context.drawImage(image, 0, 0, width, height)

    return context.getImageData(0, 0, width, height).data
}
