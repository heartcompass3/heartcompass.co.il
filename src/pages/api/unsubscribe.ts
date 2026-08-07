import type { APIRoute } from 'astro'

export const prerender = false

// מסיר איש קשר מה-Audience ב-Resend (unsubscribed: true). אותו Audience שאליו
// src/pages/api/lead.ts מוסיף לידים עם הסכמת שיווק — כך שביטול כאן אכן עוצר דיוור.

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY
const RESEND_AUDIENCE_ID = import.meta.env.RESEND_AUDIENCE_ID

let discoveredAudienceId: string | null = null

async function getAudienceId(): Promise<string | null> {
  if (RESEND_AUDIENCE_ID) return RESEND_AUDIENCE_ID
  if (discoveredAudienceId) return discoveredAudienceId
  try {
    const res = await fetch('https://api.resend.com/audiences', {
      headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
    })
    if (!res.ok) return null
    const json: any = await res.json()
    discoveredAudienceId = json?.data?.[0]?.id || null
  } catch {
    return null
  }
  return discoveredAudienceId
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const POST: APIRoute = async ({ request, redirect }) => {
  let email = ''
  try {
    const bodyText = await request.text()
    email = new URLSearchParams(bodyText).get('email')?.trim() || ''
  } catch {
    return redirect('/unsubscribe?error=1', 302)
  }

  if (!email || !emailPattern.test(email)) {
    return redirect('/unsubscribe?error=1', 302)
  }

  if (!RESEND_API_KEY) {
    console.error('unsubscribe-failed: RESEND_API_KEY not configured')
    return redirect('/unsubscribe?error=1', 302)
  }

  const audienceId = await getAudienceId()
  if (!audienceId) {
    console.error('unsubscribe-failed: no audience found', email)
    return redirect('/unsubscribe?error=1', 302)
  }

  const res = await fetch(
    `https://api.resend.com/audiences/${audienceId}/contacts/${encodeURIComponent(email)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ unsubscribed: true }),
    }
  ).catch(() => null)

  // 404 = לא היה רשום מלכתחילה. עדיין הצלחה מבחינת המבקש — הוא לא בדיוור.
  if (!res || (!res.ok && res.status !== 404)) {
    console.error('unsubscribe-failed', res?.status, await res?.text().catch(() => ''))
    return redirect('/unsubscribe?error=1', 302)
  }

  return redirect('/unsubscribe?done=1', 302)
}
