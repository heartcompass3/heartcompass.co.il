import type { APIRoute } from 'astro'
import { sanity } from '../lib/sanity'

export const prerender = true;

export const GET: APIRoute = async () => {
  const baseUrl = 'https://heartcompass.co.il'

  // עמודי התשתית 
  const staticPages = [
    { url: '/', lastmod: '2026-03-01' },
    { url: '/about', lastmod: '2026-03-01' },
    { url: '/method', lastmod: '2026-03-01' },
    { url: '/articles', lastmod: '2026-03-01' },
    { url: '/specialties', lastmod: '2026-03-01' }
  ]

  let articles = []
  let pages = []

  try {
    // משיכת המאמרים
    articles = await sanity.fetch(`
      *[_type == "article" && defined(slug.current)]{
        "slug": slug.current,
        _updatedAt
      }
    `)

    // משיכת דפי ההתמחויות (סכימת "page")
    pages = await sanity.fetch(`
      *[_type == "page" && defined(slug.current)]{
        "slug": slug.current,
        _updatedAt
      }
    `)

  } catch (error) {
    console.error('❌ Error fetching dynamic routes from Sanity:', error)
  }

  const urls = [
    ...staticPages.map(p => `
      <url>
        <loc>${baseUrl}${p.url}</loc>
        <lastmod>${p.lastmod}</lastmod>
      </url>
    `),
    ...articles.map(a => {
      // מנקה סלאש מיותר אם קיים בטעות ב-Sanity
      const cleanSlug = a.slug.replace(/^\/+/, '')
      return `
      <url>
        <loc>${baseUrl}/articles/${cleanSlug}</loc>
        <lastmod>${a._updatedAt}</lastmod>
      </url>
    `}),
    ...pages.map(page => {
      // כאן הסרנו את הקידומת הקשיחה, כי ה-Slug כבר מכיל אותה
      const cleanSlug = page.slug.replace(/^\/+/, '')
      return `
      <url>
        <loc>${baseUrl}/${cleanSlug}</loc>
        <lastmod>${page._updatedAt}</lastmod>
      </url>
    `})
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.join('')}
  </urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=60, stale-while-revalidate=300'
    }
  })
}
