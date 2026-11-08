/**
 * Clic "normale" su un link: solo in questo caso la navigazione resta dentro
 * l'app. Con Ctrl/Cmd/Maiusc, clic centrale o Alt il browser apre il link
 * come di consueto (nuova scheda, nuova finestra, ecc.).
 */
export function isPlainLeftClick(event) {
    return (
        event.button === 0 &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey
    )
}
