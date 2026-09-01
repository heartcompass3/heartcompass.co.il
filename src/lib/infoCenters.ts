export type InfoCenter = {
  slug: string
  title: string
  eyebrow: string
  description: string
  href: string
  serviceHref: string
  serviceLabel: string
  keywords: RegExp
}

export const INFO_CENTERS: InfoCenter[] = [
  {
    slug: 'parenting-teens',
    title: 'הורות ומתבגרים',
    eyebrow: 'כשהבית מלא מתח',
    description: 'להבין מה קורה מתחת להסתגרות, שקרים, גבולות, כעס ומאבקי כוח — ולחזור לתקשורת שיש בה אחריות ובחירה.',
    href: '/pain/center/parenting-teens',
    serviceHref: '/specialties/parents',
    serviceLabel: 'להדרכת הורים',
    keywords: /(הורות|הורה|מתבגר|נוער|בית ספר|ילד|גבולות|סמכות|שקרים|בריונות|חרם|אלימות|ADHD|OCD|דיכאון)/i,
  },
  {
    slug: 'anxiety-fears',
    title: 'חרדה ופחדים',
    eyebrow: 'כשהפחד מתחיל להחליט',
    description: 'מאמרים על חרדה, פחד מדחייה, חוסר ודאות והימנעות — בלי להילחם ברגש ובלי לתת לו לנהל את כל הדרך.',
    href: '/pain/center/anxiety-fears',
    serviceHref: '/specialties/personal',
    serviceLabel: 'לתהליך אישי',
    keywords: /(חרדה|פחד|לחץ|פאניקה|אי-ודאות|חוסר ודאות|הימנעות|דריכות)/i,
  },
  {
    slug: 'anger-regulation',
    title: 'כעס וויסות',
    eyebrow: 'מה קורה רגע לפני ההתפרצות',
    description: 'להכיר את ההצפה, הכעס והתגובה האוטומטית — ולבנות מרווח שמחזיר יכולת בחירה.',
    href: '/pain/center/anger-regulation',
    serviceHref: '/specialties/youth',
    serviceLabel: 'לליווי בני נוער',
    keywords: /(כעס|זעם|התפרצות|ויסות|הצפה|שיתוק|אוטומט)/i,
  },
  {
    slug: 'self-worth-identity',
    title: 'ערך עצמי וזהות',
    eyebrow: 'כשהערך תלוי באישור',
    description: 'דימוי עצמי, בושה, ריצוי, ביקורת ופחד לא להיות מספיק — ומה מתחיל להשתנות כשנפריד בין דפוס לבין זהות.',
    href: '/pain/center/self-worth-identity',
    serviceHref: '/specialties/personal',
    serviceLabel: 'לתהליך אישי',
    keywords: /(ערך עצמי|דימוי עצמי|ביטחון עצמי|בושה|ריצוי|אישור|ביטול עצמי|זהות|מספיק)/i,
  },
  {
    slug: 'relationships-communication',
    title: 'זוגיות ותקשורת',
    eyebrow: 'כשהקשר חוזר לאותו ריב',
    description: 'להבין ריחוק, נטישה, שתיקה, ריצוי ודפוסים חוזרים — ולפתוח אפשרות לתקשורת אחרת.',
    href: '/pain/center/relationships-communication',
    serviceHref: '/specialties/couples',
    serviceLabel: 'לליווי זוגי',
    keywords: /(זוגיות|זוגי|בן זוג|בת זוג|תקשורת|ריחוק|נטישה|מחויבות|אהבה|קשר)/i,
  },
  {
    slug: 'patterns-personal-change',
    title: 'דפוסים ושינוי אישי',
    eyebrow: 'כשההבנה כבר לא מספיקה',
    description: 'תקיעות, דחיינות, שליטה, פרפקציוניזם והרגלים שחוזרים — דרך ההבנה של הפחד, ההגנה והבחירה החדשה.',
    href: '/pain/center/patterns-personal-change',
    serviceHref: '/specialties/personal',
    serviceLabel: 'לתהליך אישי',
    keywords: /(דפוס|תקיעות|דחיינות|שליטה|פרפקציוניזם|משמעות|התפתחות אישית|הרגל|מוטיבציה|הישרדות)/i,
  },
  {
    slug: 'career-business',
    title: 'קריירה ועסקים',
    eyebrow: 'כשהפחד נכנס לעשייה',
    description: 'חשיפה, שיווק, כסף, שחיקה ותחושת תקיעות — כדי לפעול מתוך בחירה ולא מתוך הישרדות.',
    href: '/pain/center/career-business',
    serviceHref: '/specialties/personal',
    serviceLabel: 'לתהליך אישי',
    keywords: /(קריירה|עסק|שיווק|עבודה|תעסוקה|מנהיג|כסף)/i,
  },
]

export function articleMatchesCenter(article: { title?: string; tags?: string[]; painTags?: string[] }, center: InfoCenter) {
  return center.keywords.test([article.title, ...(article.tags || []), ...(article.painTags || [])].filter(Boolean).join(' '))
}
