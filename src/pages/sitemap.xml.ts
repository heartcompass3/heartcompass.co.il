import type { APIRoute } from 'astro'
import { sanity } from '../lib/sanity'

// SSR (לא prerender): המפה נמשכת חיה מ-Sanity בכל בקשה, כך שתוכן חדש
// (מוקדי כאב, מאמרים) נכנס מיד בלי צורך ב-redeploy. יש קאש משלה (s-maxage=60)
// והיא מוחרגת מ-ISR ב-astro.config, כך שהיא נשארת טרייה.
export const prerender = false;

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

  // איסוף כל הכתובות לרשימה אחת, ואז דה-דופ לפי loc.
  // (עמודי תשתית מקודדים-קשיח חופפים למסמכי "page" עם אותו slug — דה-דופ מונע כפילויות.)
  type Entry = { loc: string; lastmod: string }
  const entries: Entry[] = []

  staticPages.forEach(p => entries.push({ loc: `${baseUrl}${p.url}`, lastmod: p.lastmod }))

  const addDocs = (docs: any[], prefix: string) =>
    docs
      .map(d => cleanSlug(d.slug) && { slug: cleanSlug(d.slug), _updatedAt: d._updatedAt })
      .filter((d): d is { slug: string; _updatedAt: string } => !!d && isValidSlug(d.slug))
      .forEach(d =>
        entries.push({ loc: encodeURI(`${baseUrl}${prefix}${d.slug}`), lastmod: d._updatedAt })
      )

  addDocs(articles, '/articles/')
  addDocs(pages, '/')
  addDocs(pains, '/pain/')

  // דה-דופ: שומרים על ה-lastmod החדש ביותר לכל כתובת.
  const byLoc = new Map<string, string>()
  for (const e of entries) {
    const prev = byLoc.get(e.loc)
    if (!prev || (e.lastmod && e.lastmod > prev)) byLoc.set(e.loc, e.lastmod)
  }

  const urls = [...byLoc.entries()].map(([loc, lastmod]) => `
      <url>
        <loc>${loc}</loc>
        <lastmod>${lastmod}</lastmod>
      </url>
    `)

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
