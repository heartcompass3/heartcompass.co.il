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

type Language = 'he' | 'en'
function errorPage(message: string, status = 502, language: Language = 'he') {
  const isEn = language === 'en'
  return new Response(
    `<!doctype html><html lang="${language}" dir="${isEn ? 'ltr' : 'rtl'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${isEn ? 'Registration error' : 'שגיאה'}</title>
    <meta name="robots" content="noindex,nofollow">
    <style>body{font-family:Assistant,sans-serif;background:#f8f7f4;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
    .box{background:#fff;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,.08);padding:40px;max-width:420px;text-align:center}
    a{display:inline-block;margin-top:20px;background:#25D366;color:#fff;text-decoration:none;font-weight:800;padding:12px 24px;border-radius:12px}</style>
    </head><body><div class="box">
    <h1 style="color:#0f2c36">${isEn ? 'Something went wrong' : 'אופס, הייתה תקלה'}</h1>
    <p style="color:#40525a">${escapeHtml(message)}</p>
    <a href="https://wa.me/972544580285">${isEn ? 'Contact Yossi on WhatsApp' : 'לכתוב לי בוואטסאפ במקום'}</a>
    </div></body></html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8' } }
  )
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const FIELD_LABELS: Record<string, string> = {
  name: 'שם מלא',
  phone: 'טלפון / וואטסאפ',
  email: 'כתובת מייל',
  group_interest: 'מעוניין/ת בקבוצת הורים / סדנה',
  tool_category: 'סוג כלי',
  consent: 'אישור תכנים ועדכונים במייל ובוואטסאפ',
  privacy_ack: 'אישור מדיניות פרטיות',
  language: 'שפה מועדפת',
}

async function sendNotification(fields: Record<string, string>) {
  const rows = Object.entries(fields)
    .filter(([k]) => !['_next', '_subject', 'debug'].includes(k))
    .map(([k, v]) => {
      const label = FIELD_LABELS[k] || k
      const displayVal = v === 'yes' ? 'כן ✓' : v
      return `<tr><td style="padding:8px 12px;color:#0f2c36;font-weight:700;border-bottom:1px solid #eef2f5;width:200px">${escapeHtml(label)}</td><td style="padding:8px 12px;color:#334155;border-bottom:1px solid #eef2f5">${escapeHtml(displayVal)}</td></tr>`
    })
    .join('')

  const payload = JSON.stringify({
    from: RESEND_FROM,
    to: [NOTIFY_EMAIL],
    subject: fields._subject || 'ליד חדש מהאתר מצפן הלב',
    html: `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"></head><body style="margin:0;padding:24px;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif"><div dir="rtl" style="max-width:540px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0"><h2 style="margin-top:0;color:#0f2c36;border-bottom:2px solid #0f2c36;padding-bottom:12px">ליד חדש התקבל במצפן הלב</h2><table style="width:100%;border-collapse:collapse;font-size:15px">${rows}</table></div></body></html>`,
    reply_to: fields.email || undefined,
  })

  // עד 3 ניסיונות: כשל רגעי של Resend (רשת/5xx/429) לא מפיל ליד
  let last = { ok: false as boolean, status: 0, body: '' }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'content-type': 'application/json',
        },
        body: payload,
      })
      if (res.ok) return { ok: true as const, status: res.status, body: '' }
      const body = await res.text().catch(() => '')
      last = { ok: false, status: res.status, body: body.slice(0, 500) }
      console.error(`resend-failed attempt ${attempt}`, res.status, last.body)
      // שגיאת ולידציה (4xx חוץ מ-429) לא תשתפר בניסיון חוזר
      if (res.status < 500 && res.status !== 429) break
    } catch (e) {
      last = { ok: false, status: 0, body: String(e).slice(0, 300) }
      console.error(`resend-network-error attempt ${attempt}`, last.body)
    }
    if (attempt < 3) await sleep(attempt * 800)
  }
  return last
}

// מזהה הרשימה: אם לא הוגדר ב-Vercel, מתגלה אוטומטית מהחשבון (הרשימה הראשונה) ונשמר בזיכרון
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

async function addToAudience(name: string, email: string, language: Language) {
  const audienceId = await getAudienceId()
  if (!audienceId) {
    console.error('audience-not-found: contact not added', email)
    return false
  }
  const [firstName, ...rest] = (name || '').trim().split(/\s+/)
  const res = await fetch('https://api.resend.com/contacts', {
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
      segments: [{ id: audienceId }],
      properties: { preferred_language: language },
    }),
  }).catch(() => null)
  if (res && !res.ok) {
    console.error('audience-add-failed', res.status, await res.text().catch(() => ''))
  }
  if (!res) console.error('audience-add-failed: network error')
  return Boolean(res?.ok)
}

export const POST: APIRoute = async ({ request }) => {
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
    const englishReferrer = (() => { try { return new URL(request.headers.get('referer') || '').pathname.startsWith('/en/') } catch { return false } })()
    return errorPage(englishReferrer ? 'We could not read the form. Please try again.' : 'לא הצלחנו לקרוא את הטופס. נסה שוב.', 400, englishReferrer ? 'en' : 'he')
  }

  const language: Language = fields.language === 'en' ? 'en' : 'he'
  fields.language = language
  const fail = (en: string, he: string, status = 502) => errorPage(language === 'en' ? en : he, status, language)
  if (!RESEND_API_KEY) {
    return fail('Registration is temporarily unavailable. Please contact Yossi on WhatsApp.', 'המערכת עדיין לא הוגדרה במלואה. אפשר לפנות ישירות בוואטסאפ.')
  }

  const name = fields.name?.trim()
  const email = fields.email?.trim()
  const requestedNext = fields._next || (language === 'en' ? '/en/thank-you' : '/')
  const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//') && !/[\\\r\n]/.test(requestedNext)
    ? requestedNext : (language === 'en' ? '/en/thank-you' : '/')

  if (!name || !email) {
    return fail('Please enter your name and email address.', 'חסרים שם או מייל בטופס.', 400)
  }

  // אישור פרטיות בלבד אינו הרשמה לעדכונים. כל טופסי ההרשמה שולחים consent=yes.
  // בודקים גם בשרת כדי שלא תתאפשר המשך הרשמה באמצעות טופס ישן או עקיפת required.
  if (fields.consent !== 'yes') {
    return fail('To continue, return to the form and tick the box to agree to receive the newsletter and email updates.', 'כדי להמשיך, חזרו לטופס וסמנו את האישור לקבלת תכנים ועדכונים.', 400)
  }

  const notified = await sendNotification(fields)

  if (!notified.ok) {
    return fail('We could not send your registration. Please try again or contact Yossi on WhatsApp.', 'לא הצלחנו לשלוח את הפנייה כרגע. נסה שוב או כתוב לנו בוואטסאפ.', 502)
  }

  // לא מציגים הצלחה או מעבירים למדריך כאשר הסנכרון לרשימת התפוצה נכשל.
  const subscribed = await addToAudience(name, email, language)
  if (!subscribed) {
    return fail('Your request was received, but your newsletter subscription could not be completed. Please return to the form and try again shortly.', 'הפנייה התקבלה, אך ההרשמה לעדכונים לא הושלמה. חזרו לטופס ונסו שוב בעוד רגע.', 502)
  }

  return new Response(null, { status: 302, headers: { Location: next } })
}
