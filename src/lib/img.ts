// שם קובץ תיאורי בסוף כתובת התמונה — Sanity תומך רשמית ב"vanity filename":
// segment נוסף בנתיב שלא משנה את הפענוח, אבל נכנס לכתובת שגוגל רואה בפועל
// (ולשם שנשמר אם מישהו מוריד את התמונה). ראו:
// https://www.sanity.io/docs/apis-and-sdks/image-urls
// פועל רק על כתובות cdn.sanity.io; אחרת מוחזר כמו שהוא.
export function withFilename(url?: string, filename?: string): string | undefined {
  if (!url || !filename || !url.includes('cdn.sanity.io')) return url
  const extMatch = url.match(/\.(jpg|jpeg|png|webp|gif|avif)(?=(\?|$))/i)
  const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg'
  const safeName = filename
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  if (!safeName) return url
  const [base, query] = url.split('?')
  return `${base}/${safeName}.${ext}${query ? `?${query}` : ''}`
}

// אופטימיזציית תמונות דרך Sanity CDN:
// מוסיף רוחב מותאם + פורמט אוטומטי (WebP/AVIF) + דחיסה, ואופציונלית שם קובץ
// תיאורי (ראו withFilename למעלה — מוכנס לפני ה-query string).
// פועל רק על כתובות cdn.sanity.io; כתובות אחרות חוזרות כמו שהן.
export function optImg(url?: string, w = 1200, q = 80, filename?: string): string | undefined {
  if (!url || !url.includes('cdn.sanity.io')) return url
  const base = filename ? withFilename(url, filename) || url : url
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}w=${w}&auto=format&fit=max&q=${q}`
}
