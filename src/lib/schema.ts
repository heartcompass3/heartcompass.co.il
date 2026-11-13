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

export function getAreaServed(language = 'he') {
  return language === 'en' ? [
    { '@type': 'City', name: 'Netanya' },
    { '@type': 'City', name: 'Ra’anana' },
    { '@type': 'City', name: 'Kfar Saba' },
    { '@type': 'City', name: 'Herzliya' },
    { '@type': 'AdministrativeArea', name: 'Sharon' },
    { '@type': 'Country', name: 'Israel' },
    'Online',
  ] : AREA_SERVED
}

export function getCoachingTopics(language = 'he') {
  return language === 'en'
    ? ['Emotional coaching', 'Emotional intelligence', 'Parent coaching', 'Couples coaching', 'Teen coaching', 'Emotional patterns', 'The M.S.A. approach']
    : ['אימון רגשי', 'אינטליגנציה רגשית', 'הדרכת הורים', 'ליווי זוגות', 'אימון רגשי לבני נוער', 'דפוסים רגשיים', 'שיטת מ.ס.ע']
}

// Shared with the About page. Names and dates match the published certificates.
export function getProfessionalCredentials(siteUrl: string, language = 'he') {
  const en = language === 'en'
  return [
    {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Professional Certification',
      name: en ? 'Parotherapy coaching training, Migdalor Campus (2026)' : 'הכשרה באימון בשיטת פארותרפיה, קמפוס מגדלור (2026)',
      url: `${siteUrl}/assets/certificate-yossi.jpg`,
    },
    {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Specialized Training',
      name: en ? 'Specialist training in emotional coaching for teens, Migdalor Campus (2026)' : 'התמחות באימון רגשי לבני נוער, קמפוס מגדלור (2026)',
      url: `${siteUrl}/assets/certificate-yossi-youth.jpg`,
    },
  ]
}

function pageLanguage(url: string) {
  const path = new URL(url).pathname
  return path === '/en' || path.startsWith('/en/') ? 'en' : 'he'
}

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
    areaServed: getAreaServed(pageLanguage(url)),
  }
}

// AEO copy describes the page, not the service entity. `abstract`,
// `disambiguatingDescription` and `keywords` are CreativeWork properties, so
// they belong on WebPage and point back to the service as the main entity.
export function buildAeoWebPageSchema(params: {
  url: string
  name: string
  description?: string
  abstract?: string
  disambiguatingDescription?: string
  keywords?: string[]
  mainEntityId?: string
}) {
  const {
    url,
    name,
    description,
    abstract,
    disambiguatingDescription,
    keywords,
    mainEntityId,
  } = params

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name,
    inLanguage: pageLanguage(url),
    ...(description ? { description } : {}),
    ...(abstract ? { abstract } : {}),
    ...(disambiguatingDescription ? { disambiguatingDescription } : {}),
    ...(keywords?.length ? { keywords: keywords.join(', ') } : {}),
    ...(mainEntityId ? { mainEntity: { '@id': mainEntityId } } : {}),
  }
}
