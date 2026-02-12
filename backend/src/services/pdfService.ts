import puppeteer from 'puppeteer';

export async function generatePdfFromHtml(html: string, title: string): Promise<Buffer> {
  const fullHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: 'Georgia', serif; font-size: 12pt; line-height: 1.6; padding: 2cm; max-width: 14cm; margin: 0 auto; }
    h1 { font-size: 18pt; margin-bottom: 1em; text-align: center; }
    p { margin-bottom: 0.8em; }
    @media print { body { padding: 1.5cm; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div class="content">${html}</div>
</body>
</html>`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A5',
      printBackground: true,
      margin: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Convertit le contenu markdown/texte en HTML simple pour le PDF. */
export function contentToHtml(content: string): string {
  return content
    .split(/\n\n+/)
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      return `<p>${escapeHtml(trimmed)}</p>`;
    })
    .filter(Boolean)
    .join('\n');
}
