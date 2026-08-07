import type { APIRoute } from 'astro'
import { createClient } from '@sanity/client'

export const prerender = false

// נקודת קצה מוגנת להעלאת תמונות ל-Sanity Assets, לשימוש אוטומציה חיצונית
// (לא לגולשים). מחזירה assetId שאפשר להצמיד ל-mainImage.asset._ref במסמך.
// שני סודות נפרדים בכוונה: UPLOAD_API_SECRET שומר את הנקודה מפני שימוש
// ציבורי; SANITY_WRITE_TOKEN הוא הכוח לכתוב בפועל ל-Sanity — טוקן פרטי,
// אף פעם לא PUBLIC_*.

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

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return jsonError('invalid form data', 400)
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return jsonError('missing file field', 400)
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return jsonError(`unsupported file type: ${file.type}`, 400)
  }
  if (file.size > MAX_BYTES) {
    return jsonError('file too large (max 15MB)', 400)
  }

  const filenameField = formData.get('filename')
  const filename = typeof filenameField === 'string' && filenameField.trim() ? filenameField.trim() : file.name

  const writeClient = createClient({
    projectId,
    dataset,
    apiVersion: '2026-04-23',
    token: writeToken,
    useCdn: false,
  })

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const asset = await writeClient.assets.upload('image', buffer, { filename })
    return new Response(
      JSON.stringify({ assetId: asset._id, url: asset.url }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    )
  } catch (e) {
    console.error('upload-asset-failed', e)
    return jsonError('upload failed', 502)
  }
}
