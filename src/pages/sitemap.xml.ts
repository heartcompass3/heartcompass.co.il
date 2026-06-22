import type { APIRoute } from 'astro'
import { sanity } from '../lib/sanity'

export const prerender = true;

export const GET: APIRoute = async () => {
  const baseUrl = 'https://www.heartcompass.co.il'

  // תאריך הבנייה — עדכני לכל deploy במקום תאריך קשיח שמתיישן
  const buildDate = new Date().toISOString().slice(0, 10)

  // מנקה ובודק slug: גוזם רווחים, מסיר סלאש מוביל, ומדלג על slug פגום
  // (רווחים/טאבים בתוך ה-slug = כתובת לא חוקית שלא נפתרת). מקודד עברית ל-%xx.
  const cleanSlug = (s: string) => (s || '').trim().replace(/^\/+/, '')
  const isValidSlug = (s: string) => !!s && !/\s/.test(s)

  // עמודי התשתית
  const staticPages = [
    { url: '/', lastmod: buildDate },
    { url: '/about', lastmod: buildDate },
    { url: '/method', lastmod: buildDate },
    { url: '/articles', lastmod: buildDate },
    { url: '/specialties', lastmod: buildDate }
  ]

  let articles = []
  let pages = []
  let pains = []

  try {
    // משיכת המאמרים
    articles = await sanity.fetch(`
      *[_type == "article" && defined(slug.current)]{
        "slug": slug.current,
        _updatedAt
      }
    `)

    // משיכת דפי ההתמחויות (סכימת "page")
    pages = await sanity.fetch(`
      *[_type == "page" && defined(slug.current)]{
        "slug": slug.current,
        _updatedAt
      }
    `)

    // משיכת מוקדי הכאב (Pain Hubs)
    pains = await sanity.fetch(`
      *[_type == "pain" && defined(slug.current) && coalesce(publishedSite, "new") in ["new", "both"]]{
        "slug": slug.current,
        _updatedAt
      }
    `)

  } catch (error) {
    console.error('❌ Error fetching dynamic routes from Sanity:', error)
  }

  const urls = [
    ...staticPages.map(p => `
      <url>
        <loc>${baseUrl}${p.url}</loc>
        <lastmod>${p.lastmod}</lastmod>
      </url>
    `),
    ...articles
      .map(a => cleanSlug(a.slug) && { slug: cleanSlug(a.slug), _updatedAt: a._updatedAt })
      .filter((a): a is { slug: string; _updatedAt: string } => !!a && isValidSlug(a.slug))
      .map(a => `
      <url>
        <loc>${encodeURI(`${baseUrl}/articles/${a.slug}`)}</loc>
        <lastmod>${a._updatedAt}</lastmod>
      </url>
    `),
    ...pages
      .map(p => cleanSlug(p.slug) && { slug: cleanSlug(p.slug), _updatedAt: p._updatedAt })
      .filter((p): p is { slug: string; _updatedAt: string } => !!p && isValidSlug(p.slug))
      .map(p => `
      <url>
        <loc>${encodeURI(`${baseUrl}/${p.slug}`)}</loc>
        <lastmod>${p._updatedAt}</lastmod>
      </url>
    `),
    ...pains
      .map(p => cleanSlug(p.slug) && { slug: cleanSlug(p.slug), _updatedAt: p._updatedAt })
      .filter((p): p is { slug: string; _updatedAt: string } => !!p && isValidSlug(p.slug))
      .map(p => `
      <url>
        <loc>${encodeURI(`${baseUrl}/pain/${p.slug}`)}</loc>
        <lastmod>${p._updatedAt}</lastmod>
      </url>
    `)
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.join('')}
  </urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=60, stale-while-revalidate=300'
    }
  })
}
