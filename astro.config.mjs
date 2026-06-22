import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel'
import sitemap from '@astrojs/sitemap'

function getSiteUrl() {
  const env = process.env.VERCEL_ENV
  const vercelUrl = process.env.VERCEL_URL

  if (env === 'production') return 'https://www.heartcompass.co.il'
  if (vercelUrl) return `https://${vercelUrl}`

  return 'http://localhost:4321'
}

export default defineConfig({
  site: getSiteUrl(),
  output: 'server',
  trailingSlash: 'never',
  // ISR: Vercel מקאשר את ה-HTML בקצה ומחדש כל 10 דק' (TTFB מהיר, תקציב זחילה יעיל).
  // /api מוחרג כדי שה-IndexNow (כולל ה-cron) לא ייתפס בקאש.
  adapter: vercel({
    isr: {
      expiration: 600,
      // /api (IndexNow + cron) ו-/sitemap.xml מוחרגים — צריכים להישאר טריים
      // (ל-sitemap יש קאש משלו של 60ש'), לא להיתפס בקאש ISR של 10 דק'.
      exclude: [/^\/api\//, '/sitemap.xml'],
    },
  }),
  redirects: {
    '/sitemap-index.xml': '/sitemap.xml',
    '/sitemap-0.xml': '/sitemap.xml',
    '/the-method': '/method'
  },
  integrations: [
    sitemap({
      filter: (url) => {
        try {
          const pathname =
            typeof url === 'string'
              ? new URL(url).pathname
              : url?.pathname

          if (!pathname) return true

          const normalized = pathname.replace(/\/+$/, '') || '/'

          if (normalized === '/sanity-test') return false
          if (normalized === '/blog') return false
          if (normalized.startsWith('/method/')) return false

          return true
        } catch {
          return true
        }
      }
    })
  ]
})
