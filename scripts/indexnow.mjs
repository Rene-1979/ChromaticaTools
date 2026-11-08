/**
 * Avvisa Bing (e gli altri motori che aderiscono a IndexNow, non Google) degli
 * indirizzi del sito, senza aspettare che li scoprano da soli.
 * https://www.indexnow.org/documentation
 *
 * Uso, DOPO aver pubblicato il sito su Firebase:  npm run indexnow
 *
 * Il file con la chiave (public/<chiave>.txt) deve essere già online: lo
 * script lo verifica prima di inviare. Non garantisce indicizzazione né
 * posizionamento: velocizza solo la scoperta degli indirizzi.
 */

import { PAGES, SITE, getPageUrl } from '../src/content/pages.js'

const ENDPOINT = 'https://www.bing.com/indexnow'

const key = SITE.indexNowKey
const keyLocation = `${SITE.url}/${key}.txt`

const keyFile = await fetch(keyLocation, { cache: 'no-store' }).catch(() => null)

if (!keyFile?.ok || (await keyFile.text()).trim() !== key) {
    console.error(
        `File chiave non raggiungibile o diverso: ${keyLocation}\nPubblica prima il sito (firebase deploy) e riprova.`
    )
    process.exit(1)
}

const urlList = PAGES.map(getPageUrl)

const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
        host: new URL(SITE.url).host,
        key,
        keyLocation,
        urlList,
    }),
})

console.log(`IndexNow: ${response.status} ${response.statusText}`)
console.log(urlList.map((url) => `- ${url}`).join('\n'))

// 200 = ricevuto, 202 = ricevuto (la chiave verra' verificata a breve)
if (![200, 202].includes(response.status)) {
    console.error('Invio non riuscito.')
    process.exit(1)
}
