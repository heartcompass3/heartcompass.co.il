export const articleSlug = article => typeof article.slug === 'string' ? article.slug : article.slug?.current;
// Retained only as a hidden alias for links already shared before readable anchors.
export const legacyTopicAnchor = name => 'topic-' + Array.from(name).map(c => c.codePointAt(0).toString(16)).join('-');
export const topicAnchor = name => 'topic-' + name.normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
export function collectionGroups(articles, taxonomy, domain, topicDefinitions = {}) {
  const groups = new Map();
  const seen = new Set();
  for (const article of articles) {
    const slug = articleSlug(article);
    const entry = taxonomy[slug];
    if (!slug || seen.has(slug) || !entry) continue;
    seen.add(slug);
    const placements = [{domain: entry.domain, category: entry.category}, ...entry.secondary];
    for (const category of new Set(placements.filter(p => p.domain === domain).map(p => p.category))) {
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(article);
    }
  }
  return [...groups].map(([name, articles]) => ({name, articles, id: topicDefinitions[name]?.anchor || topicAnchor(name), legacyId: legacyTopicAnchor(name), description: topicDefinitions[name]?.description || ''}));
}
export function audienceGroups(articles, taxonomy, domains) {
  const groups = domains.map(d => ({...d, articles: articles.filter(a => taxonomy[articleSlug(a)]?.domain === d.id)}));
  const legacy = articles.filter(a => taxonomy[articleSlug(a)]?.domain === 'legacy');
  if (legacy.length) groups.push({id: 'legacy', name: 'מאמרים על עסקים ושיווק', articles: legacy});
  const other = articles.filter(a => !taxonomy[articleSlug(a)]);
  if (other.length) groups.push({id: 'other', name: 'מאמרים נוספים', articles: other});
  return groups.filter(g => g.articles.length);
}
export function relatedArticles(articles, taxonomy, slug, limit = 4) {
  const current = taxonomy[slug];
  if (!current || current.domain === 'legacy') return [];
  const topics = entry => new Set([entry.category, ...entry.secondary.filter(p => p.domain === current.domain).map(p => p.category)]);
  const currentTopics = topics(current);
  return articles.filter(a => articleSlug(a) !== slug && taxonomy[articleSlug(a)]?.domain === current.domain && a.contentRole !== 'legacy')
    .map((article, i) => ({article, i, score: [...topics(taxonomy[articleSlug(article)])].filter(t => currentTopics.has(t)).length}))
    .filter(a => a.score > 0)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, limit).map(a => a.article);
}
