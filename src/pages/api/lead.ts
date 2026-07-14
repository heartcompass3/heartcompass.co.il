import type { APIRoute } from 'astro'

export const prerender = false

// שולח התראת ליד למייל שלך, ואם ניתנה הסכמה לשיווק — מוסיף את הליד ל-Audience ב-Resend.
// מחליף את formsubmit.co (נפל בעבר ובלי שליטה עלינו) — אפס תלות בצד ג׳ לא-אמין,
// והלידים נשמרים גם ב-Resend Audiences לקראת דיוור עתידי.

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY
const RESEND_AUDIENCE_ID = import.meta.env.RESEND_AUDIENCE_ID
// כתובת ברירת המחדל של Resend — עובדת מיידית בלי אימות דומיין.
// כשהדומיין heartcompass.co.il יאומת, אפשר לעדכן RESEND_FROM ב-Vercel ל-leads@heartcompass.co.il.
const RESEND_FROM = import.meta.env.RESEND_FROM || 'מצפן הלב <onboarding@resend.dev>'
// בלי דומיין מאומת ב-Resend, אפשר לשלוח רק לכתובת שאיתה נרשם החשבון.
// אחרי אימות heartcompass.co.il אפשר להגדיר LEAD_NOTIFY_EMAIL ב-Vercel לכל כתובת רצויה.
const NOTIFY_EMAIL = import.meta.env.LEAD_NOTIFY_EMAIL || 'heartcompass3@gmail.com'

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

function errorPage(message: string) {
  return new Response(
    `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>שגיאה</title>
    <meta name="robots" content="noindex,nofollow">
    <style>body{font-family:Assistant,sans-serif;background:#f8f7f4;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
    .box{background:#fff;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,.08);padding:40px;max-width:420px;text-align:center}
    a{display:inline-block;margin-top:20px;background:#25D366;color:#fff;text-decoration:none;font-weight:800;padding:12px 24px;border-radius:12px}</style>
    </head><body><div class="box">
    <h1 style="color:#0f2c36">אופס, הייתה תקלה</h1>
    <p style="color:#40525a">${escapeHtml(message)}</p>
    <a href="https://wa.me/972544580285">לכתוב לי בוואטסאפ במקום</a>
    </div></body></html>`,
    { status: 502, headers: { 'content-type': 'text/html; charset=utf-8' } }
  )
}

async function sendNotification(fields: Record<string, string>) {
  const rows = Object.entries(fields)
    .filter(([k]) => !['_next', '_subject'].includes(k))
    .map(([k, v]) => `<tr><td style="padding:4px 10px;color:#667;font-weight:700">${escapeHtml(k)}</td><td style="padding:4px 10px">${escapeHtml(v)}</td></tr>`)
    .join('')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [NOTIFY_EMAIL],
      subject: fields._subject || 'ליד חדש מהאתר מצפן הלב',
      html: `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"></head><body><div dir="rtl" style="font-family:sans-serif"><h2>ליד חדש</h2><table>${rows}</table></div></body></html>`,
      reply_to: fields.email || undefined,
    }),
  })
  return res.ok
}

async function addToAudience(name: string, email: string) {
  if (!RESEND_AUDIENCE_ID) return
  const [firstName, ...rest] = (name || '').trim().split(/\s+/)
  await fetch(`https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      email,
      first_name: firstName || undefined,
      last_name: rest.join(' ') || undefined,
      unsubscribed: false,
    }),
  }).catch(() => {})
}

export const POST: APIRoute = async ({ request }) => {
  if (!RESEND_API_KEY) {
    return errorPage('המערכת עדיין לא הוגדרה במלואה. אפשר לפנות ישירות בוואטסאפ.')
  }

  // מפענחים ידנית עם URLSearchParams במקום request.formData(): על ריצת ה-Vercel שלנו
  // formData() החליף תווי UTF-8 רב-בייט (עברית) ב-U+FFFD (איבוד מידע בלתי הפיך).
  // URLSearchParams מפענח application/x-www-form-urlencoded לפי התקן, ותקין ל-UTF-8.
  let fields: Record<string, string> = {}
  try {
    const bodyText = await request.text()
    const params = new URLSearchParams(bodyText)
    for (const [key, value] of params.entries()) {
      fields[key] = value
    }
  } catch {
    return errorPage('לא הצלחנו לקרוא את הטופס. נסה שוב.')
  }

  const name = fields.name?.trim()
  const email = fields.email?.trim()
  const next = fields._next || '/'

  if (!name || !email) {
    return errorPage('חסרים שם או מייל בטופס.')
  }

  // אבחון זמני לבעיית קידוד עברית — לא שולח מייל, רק מחזיר איך השרת קרא את הנתונים.
  // מוסר לאחר האבחון.
  if (fields.debug === '1') {
    const bytes = [...new TextEncoder().encode(name)].map((b) => b.toString(16).padStart(2, '0')).join(' ')
    return new Response(JSON.stringify({ name, nameHex: bytes, allFields: fields }, null, 2), {
      headers: { 'content-type': 'application/json; charset=utf-8' },
    })
  }

  const notified = await sendNotification(fields)
  if (!notified) {
    return errorPage('לא הצלחנו לשלוח את הפנייה כרגע. נסה שוב או כתוב לנו בוואטסאפ.')
  }

  // מוסיפים לרשימת התפוצה רק אם ניתנה הסכמה מפורשת לשיווק שוטף
  if (fields.consent === 'yes') {
    await addToAudience(name, email)
  }

  return new Response(null, { status: 302, headers: { Location: next } })
}
