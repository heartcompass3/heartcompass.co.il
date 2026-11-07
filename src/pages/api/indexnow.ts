import type { APIRoute } from 'astro'
import { timingSafeEqual } from 'node:crypto'
import site from '../../content/pages/site.json'

export const prerender = false

// המפתח כבר מוגש בפומבי בקובץ /<key>.txt, ולכן אינו סוד.
// אפשר לעקוף דרך משתנה סביבה אם נחליף מפתח בעתיד.
const INDEXNOW_KEY =
  import.meta.env.INDEXNOW_KEY || '0b363f322a284df29f956bf0997d06ea'

// Vercel Cron sends CRON_SECRET as a Bearer token. Sanity and manual
// submissions use a separate secret, passed only in a request header.
const CRON_SECRET = process.env.CRON_SECRET
const INDEXNOW_SECRET = process.env.INDEXNOW_SECRET

const host = new URL(site.siteUrl).host
const keyLocation = `${site.siteUrl}/${INDEXNOW_KEY}.txt`

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

function matchesSecret(provided: string | null, expected?: string) {
  if (!provided || !expected) return false
  const actual = Buffer.from(provided)
  const secret = Buffer.from(expected)
  return actual.length === secret.length && timingSafeEqual(actual, secret)
}

function hasIndexNowSecret(request: Request) {
  return matchesSecret(request.headers.get('x-indexnow-secret'), INDEXNOW_SECRET)
}

function isSiteUrl(value: string) {
  try {
    const target = new URL(value)
    return target.origin === new URL(site.siteUrl).origin && !target.username && !target.password
  } catch {
    return false
  }
}

// שולח רשימת כתובות ל-IndexNow (Bing + מנועים תומכים).
async function submit(urls: string[]) {
  const urlList = [...new Set(urls.filter(isSiteUrl))]
  if (urlList.length === 0) return { ok: false, reason: 'no-urls' as const }

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
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
      return `${site.siteUrl}${doc._id?.replace(/^drafts\./, '') === 'en-home-page' ? '/en' : '/'}`
    case 'article':
      return slug ? `${site.siteUrl}/${doc.language === "en" ? "en/" : ""}articles/${slug}` : null
    case 'service':
      return slug ? `${site.siteUrl}/services/${slug}` : null
    case 'page':
      return slug ? `${site.siteUrl}/${slug}` : null
    case 'pain':
      return slug ? `${site.siteUrl}/pain/${slug}` : null
    case 'landingPage':
      // slug של קישור חיצוני מלא (base44/lovable) אין לו עמוד פנימי לדחוף
      return slug && !/^https?:\/\//.test(slug) ? `${site.siteUrl}/guide/${slug}` : null
    default:
      return slug ? `${site.siteUrl}/${slug}` : null
  }
}

// POST — מיועד ל-Sanity webhook (פרסום/עדכון מסמך).
export const POST: APIRoute = async ({ request }) => {
  if (!hasIndexNowSecret(request)) return json({ ok: false, error: 'unauthorized' }, 401)

  let body: any = {}
  try {
    body = await request.json()
  } catch {
    return json({ ok: false, error: 'invalid-json' }, 400)
  }

  const target = urlForDoc(body)
  if (!target) return json({ ok: false, error: 'could-not-resolve-url' }, 400)

  const result = await submit([target])
  return json(result, result.ok ? 200 : 502)
}

// GET — להפעלה ידנית:
//   /api/indexnow?url=https://heartcompass.co.il/articles/xxx   (כתובת בודדת)
//   /api/indexnow?all=1                                              (כל ה-sitemap — "בעיטת התנעה")
export const GET: APIRoute = async ({ request, url }) => {
  const isCron = Boolean(CRON_SECRET) && matchesSecret(
    request.headers.get('authorization'), `Bearer ${CRON_SECRET}`
  )
  if (!isCron && !hasIndexNowSecret(request)) {
    return json({ ok: false, error: 'unauthorized' }, 401)
  }

  const one = url.searchParams.get('url')
  if (one) {
    if (!isSiteUrl(one)) return json({ ok: false, error: 'invalid-url' }, 400)
    const result = await submit([one])
    return json(result, result.ok ? 200 : 502)
  }

  // Vercel Cron מפעיל את ה-endpoint ללא פרמטרים → דחיפת כל ה-sitemap.
  if (isCron || url.searchParams.get('all')) {
    const sm = await fetch(`${site.siteUrl}/sitemap.xml`)
    if (!sm.ok) return json({ ok: false, error: 'sitemap-unavailable' }, 502)
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
