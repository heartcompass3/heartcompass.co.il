// בונה Service schema שמקשר כל עמוד התמחות לישות המוסמכת (#person)
// ולישות העסקית (#business). מחזק את הסמכות של עמודי הדגל בגוגל וב-AI.
export function buildServiceSchema(params: {
  siteUrl: string
  name: string
  url: string
  description?: string
  serviceType?: string
}) {
  const { siteUrl, name, url, description, serviceType } = params

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name,
    ...(serviceType ? { serviceType } : {}),
    ...(description ? { description } : {}),
    url,
    provider: { '@id': `${siteUrl}/#person` },
    brand: { '@id': `${siteUrl}/#business` },
    areaServed: [{ '@type': 'Country', name: 'ישראל' }, 'Online'],
    availableLanguage: 'he',
  }
}
