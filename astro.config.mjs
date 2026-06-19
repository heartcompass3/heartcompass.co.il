import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel'
import sitemap from '@astrojs/sitemap'

function getSiteUrl() {
  const env = process.env.VERCEL_ENV
  const vercelUrl = process.env.VERCEL_URL

  if (env === 'production') return 'https://heartcompass.co.il'
  if (vercelUrl) return `https://${vercelUrl}`

  return 'http://localhost:4321'
}

export default defineConfig({
  site: getSiteUrl(),
  output: 'server',
  trailingSlash: 'never',
  adapter: vercel(),
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
