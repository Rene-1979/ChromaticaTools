
export const VISION_MATRICES = {
    protanopia: [
        [0.152286, 1.052583, -0.204868],
        [0.114503, 0.786281, 0.099216],
        [-0.003882, -0.048116, 1.051998],
    ],
    deuteranopia: [
        [0.367322, 0.860646, -0.227968],
        [0.280085, 0.672501, 0.047413],
        [-0.01182, 0.04294, 0.968881],
    ],
    tritanopia: [
        [1.255528, -0.076749, -0.178779],
        [-0.078411, 0.930809, 0.147602],
        [0.004733, 0.691367, 0.3039],
    ],
}

export const VISION_LABELS = {
    protanopia: 'Protanopia',
    deuteranopia: 'Deuteranopia',
    tritanopia: 'Tritanopia',
}

export function rgbToHex({ r, g, b }) {
    return (
        '#' +
        [r, g, b]
            .map((v) =>
                Math.round(Math.max(0, Math.min(255, v)))
                    .toString(16)
                    .padStart(2, '0')
            )
            .join('')
    ).toUpperCase()
}

export function hexToRgb(hex) {
    const clean = hex.replace('#', '')
    return {
        r: parseInt(clean.slice(0, 2), 16),
        g: parseInt(clean.slice(2, 4), 16),
        b: parseInt(clean.slice(4, 6), 16),
    }
}

/** Simula un deficit della visione cromatica su un colore HEX. */
export function simulateHex(hex, type) {
    const matrix = VISION_MATRICES[type]
    if (!matrix) return hex

    const { r, g, b } = hexToRgb(hex)
    const [nr, ng, nb] = matrix.map(
        (row) => row[0] * r + row[1] * g + row[2] * b
    )

    return rgbToHex({ r: nr, g: ng, b: nb })
}
