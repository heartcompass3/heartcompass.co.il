import domainsData from '../../../src/content/insights-domains.json'
import topicsData from '../../../src/content/insights-topics.json'
import taxonomyData from '../../../src/content/insights-taxonomy.json'

export const insightDomains = [
  ...domainsData.map(({id, name}) => ({id, name})),
  {id: 'legacy', name: 'תוכן עסקי ותיק (Legacy)'},
] as const

export type InsightDomainId = (typeof insightDomains)[number]['id']

const legacyCategories = Array.from(
  new Set(
    Object.values(taxonomyData)
      .filter((placement) => placement.domain === 'legacy')
      .map((placement) => placement.category),
  ),
)

export const insightCategoriesByDomain: Record<InsightDomainId, string[]> = {
  personal: Object.keys(topicsData.personal),
  parents: Object.keys(topicsData.parents),
  youth: Object.keys(topicsData.youth),
  relationships: Object.keys(topicsData.relationships),
  legacy: legacyCategories,
}

export const insightDomainOptions = insightDomains.map(({id, name}) => ({
  title: name,
  value: id,
}))

export const secondaryInsightDomainOptions = insightDomainOptions.filter(
  ({value}) => value !== 'legacy',
)

export const insightCategoryOptions = insightDomains.flatMap(({id, name}) =>
  insightCategoriesByDomain[id].map((category) => ({
    title: `${name} › ${category}`,
    value: category,
  })),
)

export function isInsightCategory(domain: string, category: string) {
  return (insightCategoriesByDomain[domain as InsightDomainId] || []).includes(category)
}
