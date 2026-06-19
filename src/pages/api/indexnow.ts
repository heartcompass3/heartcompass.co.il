import type { APIRoute } from 'astro'
import site from '../../content/pages/site.json'

export const prerender = false

// המפתח כבר מוגש בפומבי בקובץ /<key>.txt, ולכן אינו סוד.
// אפשר לעקוף דרך משתנה סביבה אם נחליף מפתח בעתיד.
const INDEXNOW_KEY =
  import.meta.env.INDEXNOW_KEY || '0b363f322a284df29f956bf0997d06ea'

// סוד אופציונלי לאימות שהקריאה הגיעה מ-Sanity ולא מגורם זר.
// אם מוגדר INDEXNOW_SECRET — נדרוש אותו ב-header/קוורי.
const SECRET = import.meta.env.INDEXNOW_SECRET

const host = new URL(site.siteUrl).host
const keyLocation = `${site.siteUrl}/${INDEXNOW_KEY}.txt`

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

function authorized(request: Request, url: URL) {
  // קריאות Vercel Cron הן פנימיות ומהימנות — מזוהות לפי ה-header הזה.
  if (request.headers.get('x-vercel-cron')) return true
  if (!SECRET) return true
  const provided =
    request.headers.get('x-indexnow-secret') || url.searchParams.get('secret')
  return provided === SECRET
}

// שולח רשימת כתובות ל-IndexNow (Bing + מנועים תומכים).
async function submit(urls: string[]) {
  const urlList = [...new Set(urls.filter(Boolean))]
  if (urlList.length === 0) return { ok: false, reason: 'no-urls' as const }

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation, urlList }),
  })

  return { ok: res.ok, status: res.status, submitted: urlList }
}

// ממפה מסמך Sanity (מ-webhook) לכתובת הציבורית שלו.
function urlForDoc(doc: any): string | null {
  if (!doc) return null
  const slug =
    typeof doc.slug === 'string' ? doc.slug : doc.slug?.current || undefined

  switch (doc._type) {
    case 'homePage':
      return `${site.siteUrl}/`
    case 'article':
      return slug ? `${site.siteUrl}/articles/${slug}` : null
    case 'service':
      return slug ? `${site.siteUrl}/services/${slug}` : null
    case 'page':
      return slug ? `${site.siteUrl}/${slug}` : null
    default:
      return slug ? `${site.siteUrl}/${slug}` : null
  }
}

// POST — מיועד ל-Sanity webhook (פרסום/עדכון מסמך).
export const POST: APIRoute = async ({ request, url }) => {
  if (!authorized(request, url)) return json({ ok: false, error: 'unauthorized' }, 401)

  let body: any = {}
  try {
    body = await request.json()
  } catch {
    return json({ ok: false, error: 'invalid-json' }, 400)
  }

  const target = urlForDoc(body)
  if (!target) return json({ ok: false, error: 'could-not-resolve-url', body }, 400)

  const result = await submit([target])
  return json(result, result.ok ? 200 : 502)
}

// GET — להפעלה ידנית:
//   /api/indexnow?url=https://heartcompass.co.il/articles/xxx   (כתובת בודדת)
//   /api/indexnow?all=1                                              (כל ה-sitemap — "בעיטת התנעה")
export const GET: APIRoute = async ({ request, url }) => {
  if (!authorized(request, url)) return json({ ok: false, error: 'unauthorized' }, 401)

  const one = url.searchParams.get('url')
  if (one) {
    const result = await submit([one])
    return json(result, result.ok ? 200 : 502)
  }

  // Vercel Cron מפעיל את ה-endpoint ללא פרמטרים → דחיפת כל ה-sitemap.
  const isCron = !!request.headers.get('x-vercel-cron')
  if (isCron || url.searchParams.get('all')) {
    const sm = await fetch(`${site.siteUrl}/sitemap.xml`)
    const xml = await sm.text()
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    const result = await submit(urls)
    return json({ ...result, trigger: isCron ? 'cron' : 'manual' }, result.ok ? 200 : 502)
  }

  return json({
    ok: true,
    usage: 'GET ?url=<absolute-url> | GET ?all=1 | POST (Sanity webhook) | Vercel Cron',
    host,
    keyLocation,
  })
}
