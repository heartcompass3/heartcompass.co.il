import type { APIRoute } from 'astro'
import { createClient } from '@sanity/client'

export const prerender = false

// נקודת קצה מוגנת להעלאת תמונות ל-Sanity Assets, לשימוש אוטומציה חיצונית
// (לא לגולשים). מחזירה assetId שאפשר להצמיד ל-mainImage.asset._ref במסמך.
// שני סודות נפרדים בכוונה: UPLOAD_API_SECRET שומר את הנקודה מפני שימוש
// ציבורי; SANITY_WRITE_TOKEN הוא הכוח לכתוב בפועל ל-Sanity — טוקן פרטי,
// אף פעם לא PUBLIC_*.
//
// גוף הבקשה הוא JSON (לא multipart/form-data) בכוונה: הגנת ה-CSRF המובנית
// של Astro (security.checkOrigin) חוסמת POST עם content-type של form
// שמגיע בלי Origin תואם — בדיוק המצב של קריאה שרת-לשרת. JSON לא ברשימת
// ה-content-types ש-CORS מתייחס אליהם כ"simple request", אז דפדפן לא יכול
// לשלוח אותו cross-site בלי preflight ממילא — אין כאן חשיפת CSRF אמיתית
// (האימות גם ככה לא מבוסס עוגיות, אלא בסוד ב-Authorization).

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID
const dataset = import.meta.env.PUBLIC_SANITY_DATASET
const writeToken = import.meta.env.SANITY_WRITE_TOKEN
const uploadSecret = import.meta.env.UPLOAD_API_SECRET

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const MAX_BYTES = 15 * 1024 * 1024 // 15MB

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

export const POST: APIRoute = async ({ request }) => {
  if (!uploadSecret) {
    console.error('upload-asset: UPLOAD_API_SECRET not configured — refusing all requests')
    return jsonError('not configured', 500)
  }
  const auth = request.headers.get('authorization') || ''
  if (auth !== `Bearer ${uploadSecret}`) {
    return jsonError('unauthorized', 401)
  }

  if (!writeToken) {
    console.error('upload-asset: SANITY_WRITE_TOKEN not configured')
    return jsonError('upload not configured', 500)
  }

  let body: { filename?: string; contentType?: string; data?: string }
  try {
    body = await request.json()
  } catch {
    return jsonError('invalid JSON body — expected { filename, contentType, data (base64) }', 400)
  }

  const { filename, contentType, data } = body
  if (!contentType || !ALLOWED_TYPES.includes(contentType)) {
    return jsonError(`unsupported or missing contentType: ${contentType}`, 400)
  }
  if (!data || typeof data !== 'string') {
    return jsonError('missing data (base64-encoded file content)', 400)
  }

  let buffer: Buffer
  try {
    buffer = Buffer.from(data, 'base64')
  } catch {
    return jsonError('data is not valid base64', 400)
  }
  if (buffer.length === 0) {
    return jsonError('empty file', 400)
  }
  if (buffer.length > MAX_BYTES) {
    return jsonError('file too large (max 15MB)', 400)
  }

  const finalFilename = typeof filename === 'string' && filename.trim() ? filename.trim() : 'upload'

  const writeClient = createClient({
    projectId,
    dataset,
    apiVersion: '2026-04-23',
    token: writeToken,
    useCdn: false,
  })

  try {
    const asset = await writeClient.assets.upload('image', buffer, {
      filename: finalFilename,
      contentType,
    })
    return new Response(
      JSON.stringify({ assetId: asset._id, url: asset.url }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    )
  } catch (e) {
    console.error('upload-asset-failed', e)
    return jsonError('upload failed', 502)
  }
}
