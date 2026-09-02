// אזור שירות משותף לכל ה-schema באתר: העסק מבוסס בנתניה ומשרת אונליין את כל הארץ,
// אבל מציינים במפורש ערי שרון מרכזיות כדי לחזק אותות רלוונטיות מקומיות (Local SEO)
// לשאילתות כמו "אימון רגשי לנוער בנתניה". לא כתובת פיזית שלקוחות מגיעים אליה.
export const AREA_SERVED = [
  { '@type': 'City', name: 'נתניה' },
  { '@type': 'City', name: 'רעננה' },
  { '@type': 'City', name: 'כפר סבא' },
  { '@type': 'City', name: 'הרצליה' },
  { '@type': 'AdministrativeArea', name: 'השרון' },
  { '@type': 'Country', name: 'ישראל' },
  'Online',
]

// בונה Service schema שמקשר כל עמוד התמחות לישות המוסמכת (#person)
// ולישות העסקית (#business). מחזק את הסמכות של עמודי הדגל בגוגל וב-AI.
export function buildServiceSchema(params: {
  siteUrl: string
  name: string
  url: string
  description?: string
  serviceType?: string
  audience?: string
}) {
  const { siteUrl, name, url, description, serviceType, audience } = params

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name,
    ...(serviceType ? { serviceType } : {}),
    ...(description ? { description } : {}),
    ...(audience ? {
      audience: {
        '@type': 'PeopleAudience',
        audienceType: audience,
      },
    } : {}),
    url,
    provider: { '@id': `${siteUrl}/#person` },
    brand: { '@id': `${siteUrl}/#business` },
    areaServed: AREA_SERVED,
    // Service לא תומך ב-availableLanguage ישירות — רק דרך ServiceChannel.
    availableChannel: {
      '@type': 'ServiceChannel',
      availableLanguage: { '@type': 'Language', name: 'Hebrew', alternateName: 'he' },
    },
  }
}
