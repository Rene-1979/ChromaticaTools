/**
 * Generatore unico di esportazione per tutte le pagine di Chromatica.
 *
 * Ogni pagina passa solo l'elenco dei colori scelti:
 *   [{ label: 'Testo', hex: '#FFFFFF' }, ...]
 *
 * e ottiene sempre CSS, JSON e HTML con la STESSA struttura.
 * Cambiando questo file cambiano tutte le pagine insieme.
 */

// "Colore 1" → "colore-1", "Accessibilità" → "accessibilita"
function slugify(text) {
    return text
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export function buildExportOptions({ page, colors }) {
    const items = colors.map((color) => ({
        label: color.label,
        // "Colore 1" diventa --color-1 (come nella tua palette originale)
        slug: slugify(color.label).replace(/^colore-/, ''),
        hex: color.hex.toUpperCase(),
    }))

    const css = `:root {
${items.map((item) => `  --color-${item.slug}: ${item.hex};`).join('\n')}
}`

    const json = JSON.stringify(
        {
            colors: items.map((item) => ({
                name: item.label,
                hex: item.hex,
            })),
        },
        null,
        2
    )

    const html = `<ul class="color-palette">
${items
    .map(
        (item) =>
            `  <li style="--swatch: ${item.hex}">
    <span class="swatch"></span>
    <strong>${item.label}</strong>
    <code>${item.hex}</code>
  </li>`
    )
    .join('\n')}
</ul>

<style>
  .color-palette {
    display: grid;
    gap: 12px;
    padding: 0;
    list-style: none;
  }
  .color-palette li {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .color-palette .swatch {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: var(--swatch);
  }
</style>`

    const base = `chromatica-${slugify(page)}`

    return {
        css: {
            label: 'CSS',
            filename: `${base}.css`,
            mimeType: 'text/css;charset=utf-8',
            code: css,
            description: 'Variabili CSS pronte da incollare nel tuo progetto.',
        },
        json: {
            label: 'JSON',
            filename: `${base}.json`,
            mimeType: 'application/json;charset=utf-8',
            code: json,
            description: 'Elenco dei colori in formato strutturato.',
        },
        html: {
            label: 'HTML',
            filename: `${base}.html`,
            mimeType: 'text/html;charset=utf-8',
            code: html,
            description: 'Esempio HTML con i colori e CSS incorporato.',
        },
    }
}
