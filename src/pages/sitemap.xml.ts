import type { APIRoute } from 'astro';

type Country = {
  slug: string;
};

export const GET: APIRoute = async () => {
  const base = 'https://yug2704.github.io';

  // On récupère tous les JSON de pays
  const countryModules = import.meta.glob('../data/countries/*.json', {
    eager: true,
  }) as Record<string, any>;

  const countries: Country[] = Object.values(countryModules).map((mod) => {
    const data = mod.default ?? mod;
    return { slug: data.slug as string };
  });

  // URLs “fixes” + toutes les pages pays
  const urls: string[] = [
    '/',
    '/category/restaurant',
    ...countries.map((c) => `/pays/${c.slug}`),
  ];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls
      .map(
        (u) =>
          `<url><loc>${new URL(u, base).href}</loc></url>`
      )
      .join('') +
    `</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
