type BreadcrumbItem = {
  name: string
  item: string
}

export function buildBreadcrumbListSchema(params: {
  siteUrl: string
  brandName: string
  crumbs: BreadcrumbItem[]
}) {
  const { siteUrl, brandName, crumbs } = params

  const home = {
    '@type': 'ListItem',
    position: 1,
    name: brandName,
    item: `${siteUrl}/`,
  }

  const rest = (Array.isArray(crumbs) ? crumbs : []).map((c, idx) => ({
    '@type': 'ListItem',
    position: idx + 2,
    name: String(c?.name || '').trim(),
    item: String(c?.item || '').trim(),
  }))

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [home, ...rest].filter((x) => x.name && x.item),
  }
}
