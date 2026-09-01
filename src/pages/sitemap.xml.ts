import type { APIRoute } from 'astro'
import { sanity } from '../lib/sanity'
import { withFilename } from '../lib/img'
import { INFO_CENTERS } from '../lib/infoCenters'

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
  const escapeXml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  let articles = []
  let pages = []
  let pains = []
  let landingPages = []
  let homeUpdatedAt = ''
  let methodUpdatedAt = ''
  let aboutUpdatedAt = ''

  try {
    // תאריכי עדכון אמיתיים (contentUpdatedAt) לעמודי הסינגלטון — לא buildDate
    // שמשתנה בכל דיפלוי בלי קשר לשינוי תוכן בפועל.
    const home = await sanity.fetch(`*[_type == "homePage"][0]{contentUpdatedAt, _updatedAt}`)
    homeUpdatedAt = home?.contentUpdatedAt || home?._updatedAt || ''

    const method = await sanity.fetch(`*[_type == "methodPage"][0]{contentUpdatedAt, _updatedAt}`)
    methodUpdatedAt = method?.contentUpdatedAt || method?._updatedAt || ''

    const about = await sanity.fetch(`*[_type == "page" && slug.current == "about"][0]{contentUpdatedAt, _updatedAt}`)
    aboutUpdatedAt = about?.contentUpdatedAt || about?._updatedAt || ''

    // משיכת המאמרים. lastmod נגזר מ-contentUpdatedAt (מעודכן ידנית בעריכות
    // תוכן משמעותיות בלבד) ולא מ-_updatedAt הטכני, שמשתנה בכל שמירה כולל
    // תיקונים טכניים — ומזייף אות רעננות לגוגל. mainImage + תמונות מגוף
    // המאמר נכנסות ל-image sitemap (המלצת גוגל: תמונות שלא תמיד מתגלות
    // אורגנית כדאי לחשוף במפה). "bodyImages" ממוין רק תמונות מתוך body,
    // לא כל ה-PortableText, כדי לא לגרור payload כבד סתם.
    articles = await sanity.fetch(`
      *[_type == "article" && defined(slug.current)]{
        "slug": slug.current,
        "_updatedAt": coalesce(contentUpdatedAt, publishedAt, _updatedAt),
        mainImage{ alt, asset->{url} },
        "bodyImages": body[_type == "image"]{ alt, asset->{url} }
      }
    `)

    // משיכת דפי ההתמחויות (סכימת "page") — contentUpdatedAt, לא _updatedAt הטכני
    pages = await sanity.fetch(`
      *[_type == "page" && defined(slug.current)]{
        "slug": slug.current,
        "_updatedAt": coalesce(contentUpdatedAt, _createdAt)
      }
    `)

    // משיכת מוקדי הכאב (Pain Hubs) — contentUpdatedAt, לא _updatedAt הטכני
    pains = await sanity.fetch(`
      *[_type == "pain" && defined(slug.current) && coalesce(publishedSite, "new") in ["new", "both"]]{
        "slug": slug.current,
        "_updatedAt": coalesce(contentUpdatedAt, _createdAt)
      }
    `)

    // משיכת דפי הנחיתה (מדריכים/כלים, /guide/[slug]) — מסמכי landingPage.
    // slug של קישור חיצוני מלא (base44/lovable וכו') מסונן: אין לו עמוד פנימי לאנדקס.
    landingPages = await sanity.fetch(`
      *[_type == "landingPage" && defined(slug.current) && !(slug.current match "http*")]{
        "slug": slug.current,
        _updatedAt
      }
    `)

  } catch (error) {
    console.error('❌ Error fetching dynamic routes from Sanity:', error)
  }

  // עמודי התשתית — תאריך תוכן אמיתי איפה שיש מסמך יחיד תואם; buildDate רק
  // כברירת מחדל וכ-fallback לעמודי אינדקס/ריכוז בלי מסמך תוכן משלהם (/articles,
  // /specialties, /tools).
  const staticPages = [
    { url: '/', lastmod: homeUpdatedAt || buildDate },
    { url: '/about', lastmod: aboutUpdatedAt || buildDate },
    { url: '/method', lastmod: methodUpdatedAt || buildDate },
    { url: '/articles', lastmod: buildDate },
    { url: '/specialties', lastmod: buildDate },
    // מרכז הכלים — עכשיו יעד של עשרות קישורים פנימיים ("אבחון קצר"), חייב להיות באינדקס
    { url: '/tools', lastmod: buildDate },
    { url: '/videos', lastmod: buildDate },
    ...INFO_CENTERS.map((center) => ({ url: center.href, lastmod: buildDate }))
  ]

  // איסוף כל הכתובות לרשימה אחת, ואז דה-דופ לפי loc.
  // (עמודי תשתית מקודדים-קשיח חופפים למסמכי "page" עם אותו slug — דה-דופ מונע כפילויות.)
  type Entry = { loc: string; lastmod: string; images: { url: string; alt?: string }[] }
  const entries: Entry[] = []

  staticPages.forEach(p => entries.push({ loc: `${baseUrl}${p.url}`, lastmod: p.lastmod, images: [] }))

  const addDocs = (docs: any[], prefix: string) =>
    docs
      .map(d => {
        const slug = cleanSlug(d.slug)
        if (!slug) return null
        // שם קובץ תיאורי (ה-slug של המאמר, +אינדקס לתמונות גוף נוספות) ב-URL
        // בפועל, לא רק כ-alt — ראו src/lib/img.ts withFilename.
        const images: { url: string; alt?: string }[] = []
        if (d.mainImage?.asset?.url) {
          images.push({ url: withFilename(d.mainImage.asset.url, slug) || d.mainImage.asset.url, alt: d.mainImage.alt })
        }
        ;(d.bodyImages || []).forEach((img: any, i: number) => {
          if (!img?.asset?.url) return
          images.push({ url: withFilename(img.asset.url, `${slug}-${i + 1}`) || img.asset.url, alt: img.alt })
        })
        return { slug, _updatedAt: d._updatedAt, images }
      })
      .filter((d): d is { slug: string; _updatedAt: string; images: { url: string; alt?: string }[] } => !!d && isValidSlug(d.slug))
      .forEach(d =>
        entries.push({ loc: encodeURI(`${baseUrl}${prefix}${d.slug}`), lastmod: d._updatedAt, images: d.images })
      )

  addDocs(articles, '/articles/')
  addDocs(pages, '/')
  addDocs(pains, '/pain/')
  addDocs(landingPages, '/guide/')

  // דה-דופ: שומרים על ה-lastmod החדש ביותר לכל כתובת (עם התמונות שלה).
  const byLoc = new Map<string, Entry>()
  for (const e of entries) {
    const prev = byLoc.get(e.loc)
    if (!prev || (e.lastmod && e.lastmod > prev.lastmod)) byLoc.set(e.loc, e)
  }

  const urls = [...byLoc.values()].map(({ loc, lastmod, images }) => `
      <url>
        <loc>${loc}</loc>
        <lastmod>${lastmod}</lastmod>
        ${images.map(image => `<image:image>
          <image:loc>${escapeXml(image.url)}</image:loc>
          ${image.alt ? `<image:caption>${escapeXml(image.alt)}</image:caption>` : ''}
        </image:image>`).join('')}
      </url>
    `)

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    ${urls.join('')}
  </urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=60, stale-while-revalidate=300'
    }
  })
}
