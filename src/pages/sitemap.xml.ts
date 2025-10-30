import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const base = 'https://yug2704.github.io'; // ✅ ton URL exacte
  const urls = ['/', '/category/restaurant'];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.map(u => `<url><loc>${new URL(u, base).href}</loc></url>`).join('')}
  </urlset>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
