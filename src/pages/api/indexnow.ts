import type { APIRoute } from 'astro'
import { timingSafeEqual } from 'node:crypto'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'
import { sanity } from '../../lib/sanity'
import { reconcile } from '../../lib/indexnow-sync'
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

async function sync(scope?: {id?: string; type?: string; slug?: string}) {
  const token = import.meta.env.SANITY_WRITE_TOKEN
  if (!token || process.env.VERCEL_ENV === 'preview') return json({ok:false, error:'sync-unavailable'}, 503)
  const client = sanity.withConfig({token, useCdn:false, perspective:'raw'})
  const result = await reconcile(client, site.siteUrl, submit, scope)
  return json(result, result.ok ? 200 : 502)
}

export const POST: APIRoute = async ({ request }) => {
  const raw = await request.text()
  const signature = request.headers.get(SIGNATURE_HEADER_NAME)
  const secret = process.env.INDEXNOW_SIGNING_SECRET
  const signed = signature && secret && await isValidSignature(raw, signature, secret).catch(() => false)
  if (!signed && !hasIndexNowSecret(request)) return json({ok:false, error:'unauthorized'}, 401)
  let doc
  try { doc = JSON.parse(raw) } catch { return json({ok:false, error:'invalid-json'}, 400) }
  if (!doc || typeof doc._type !== 'string') return json({ok:false, error:'missing-type'}, 400)
  return sync({id:request.headers.get('sanity-document-id') || doc._id, type:doc._type, slug:doc.slug?.current || doc.slug})
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

  // Vercel Cron מפעיל את ה-endpoint ללא פרמטרים ומשלים רק שינויים שטרם דווחו.
  if (isCron && !url.searchParams.has('all')) return sync()
  if (url.searchParams.get('all')) {
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
