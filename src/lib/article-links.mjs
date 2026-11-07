import { slugify } from './slug.ts'

export const PUBLISHED_ARTICLE_TRANSLATIONS_QUERY = /* groq */ `
*[_type == "article" && coalesce(language, "he") == "he" && slug.current in $slugs]{
  "sourceSlug": slug.current,
  "translations": *[_type == "article" && language == "en" && translationOf._ref == ^._id
    && defined(slug.current) && coalesce(seo.noindex, false) == false][0...2]{
      "slug": slug.current,
      "headings": body[_type == "block" && style in ["h2", "h3"]]{"parts": children[].text}
    }
}
`

function hebrewArticleLink(href, siteUrl) {
  if (typeof href !== 'string' || !/^(\/|https?:\/\/)/i.test(href)) return

  try {
    const url = new URL(href, siteUrl)
    const host = hostname => hostname.replace(/^www\./, '')
    if (!['http:', 'https:'].includes(url.protocol) || url.port || url.username || url.password) return
    if (host(url.hostname) !== host(new URL(siteUrl).hostname)) return

    const match = /^\/articles\/(.+?)\/?$/.exec(url.pathname)
    if (match) return { url, slug: decodeURIComponent(match[1]) }
  } catch {
    // A malformed link cannot be matched to a CMS document.
  }
}

export function linkedHebrewArticleSlugs(body, siteUrl) {
  const slugs = new Set()
  for (const block of body ?? []) {
    for (const mark of block?.markDefs ?? []) {
      const link = mark._type === 'link' && hebrewArticleLink(mark.href, siteUrl)
      if (link) slugs.add(link.slug)
    }
  }
  return [...slugs]
}

export function englishArticleLinkResolver(rows, siteUrl) {
  const bySlug = new Map()
  for (const { sourceSlug, translations } of rows) {
    if (translations.length !== 1 || !translations[0].slug) continue
    const { slug, headings } = translations[0]
    bySlug.set(sourceSlug, {
      path: `/en/articles/${slug.split('/').map(encodeURIComponent).join('/')}`,
      anchors: new Set((headings ?? []).map(({ parts }) => slugify((parts ?? []).join('')))),
    })
  }

  return href => {
    const link = hebrewArticleLink(href, siteUrl)
    const target = link && bySlug.get(link.slug)
    if (!target) return href

    if (link.url.hash) {
      // Preserve the original destination if the English article lacks that exact anchor.
      try {
        if (!target.anchors.has(decodeURIComponent(link.url.hash.slice(1)))) return href
      } catch {
        return href
      }
    }

    return target.path + link.url.search + link.url.hash
  }
}
