import { defineMiddleware } from 'astro:middleware'

// קאשינג בקצה (Vercel CDN) לעמודי HTML שנבנים ב-SSR.
// ברירת המחדל של ה-SSR היא "max-age=0, must-revalidate" => כל בקשה מריצה את
// הפונקציה מול Sanity (TTFB איטי, בזבוז תקציב זחילה). כאן אנו מורים ל-CDN
// להגיש מהקצה ל-10 דק' ולשרת גרסה ישנה עד 24ש' תוך רענון ברקע (SWR).
// תוכן מ-Sanity עדיין מתעדכן תוך דקות. לא נוגעים ב-/api ובתגובות שאינן HTML.
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next()

  const isGet = context.request.method === 'GET'
  const is200 = response.status === 200
  const isHtml = (response.headers.get('content-type') || '').includes('text/html')
  const isApi = context.url.pathname.startsWith('/api')

  if (isGet && is200 && isHtml && !isApi) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=0, s-maxage=600, stale-while-revalidate=86400'
    )
  }

  return response
})
