import { sanity } from './sanity'
import site from '../content/pages/site.json'

export const METHOD_IDS = {
  he: '6d628745-9229-4c8d-b5bc-7f727ff158b7',
  en: 'en-method-page',
} as const

// Separate documents share one renderer. Exact IDs preserve the existing Hebrew singleton.
export const METHOD_QUERY = `*[_type == "methodPage" && _id == $id][0]{
  ...,
  interludeImage{..., asset->{url}},
  seo{..., ogImage{..., asset->{url}}}
}`

export async function loadMethodPage(language: 'he' | 'en') {
  const publishedClient = sanity.withConfig({ perspective: 'published' })
  const previewClient = import.meta.env.VERCEL_ENV === 'preview' && process.env.SANITY_AUTH_TOKEN
    ? sanity.withConfig({ token: process.env.SANITY_AUTH_TOKEN, useCdn: false, perspective: 'drafts' })
    : publishedClient
  const [data, counterparts, methodArticles] = await Promise.all([
    previewClient.fetch(METHOD_QUERY, { id: METHOD_IDS[language] }),
    publishedClient.fetch(`*[_type == "methodPage" && _id in $ids && coalesce(seo.noindex, false) == false]{_id}`,
      { ids: Object.values(METHOD_IDS) }),
    publishedClient.fetch(`*[_type == "article" && coalesce(language, "he") == $language && relatedToMethod == true]
      | order(coalesce(publishedAt, _createdAt) desc){
        title, "slug": slug.current, excerpt, goldLine, publishedAt, mainImage{asset->{url}, alt}
      }`, { language }),
  ])
  const languageLinks = counterparts.length === 2 && !data?.seo?.noindex
    ? [
        { language: 'he', href: new URL('/method', site.siteUrl).toString() },
        { language: 'en', href: new URL('/en/method', site.siteUrl).toString() },
      ]
    : []
  return { data, methodArticles, languageLinks }
}

