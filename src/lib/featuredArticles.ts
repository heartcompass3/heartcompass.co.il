export function selectFeaturedArticles(
  articles: any[] = [],
  preferredSlugs: string[] = [],
  matchesCategory: (article: any) => boolean,
  limit = 4,
) {
  const eligible = articles.filter(
    (article) => article?.slug?.current && article?.contentRole !== 'legacy',
  )
  const bySlug = new Map(eligible.map((article) => [article.slug.current, article]))
  const selected = preferredSlugs
    .map((slug) => bySlug.get(slug))
    .filter(Boolean)

  if (selected.length < limit) {
    for (const article of eligible) {
      if (!matchesCategory(article) || selected.some((item) => item._id === article._id)) continue
      selected.push(article)
      if (selected.length === limit) break
    }
  }

  return selected.slice(0, limit)
}
