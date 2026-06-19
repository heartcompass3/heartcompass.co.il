// studio2/scripts/seed-homepage.ts
import {createClient} from '@sanity/client'

type SanityConfigLike = {
  projectId?: string
  dataset?: string
  api?: {projectId?: string; dataset?: string}
}

async function getProjectAndDataset() {
  // 1) אם קיימים env vars – נשתמש בהם
  const envProjectId = process.env.SANITY_STUDIO_PROJECT_ID
  const envDataset = process.env.SANITY_STUDIO_DATASET
  if (envProjectId && envDataset) {
    return {projectId: envProjectId, dataset: envDataset}
  }

  // 2) אחרת – נקרא מה־sanity.config.ts (הדרך הנפוצה ב־Sanity Studio)
  try {
    const mod: any = await import('../sanity.config')
    const cfg: SanityConfigLike = mod?.default ?? mod
    const projectId = cfg?.projectId ?? cfg?.api?.projectId
    const dataset = cfg?.dataset ?? cfg?.api?.dataset

    if (projectId && dataset) return {projectId, dataset}
  } catch {
    // נמשיך לשגיאה מסודרת למטה
  }

  throw new Error(
    [
      'Missing projectId/dataset.',
      'Fix options:',
      '1) Ensure studio2/sanity.config.ts includes projectId + dataset (recommended), OR',
      '2) Create studio2/.env with:',
      '   SANITY_STUDIO_PROJECT_ID=xxxx',
      '   SANITY_STUDIO_DATASET=production (or your dataset)',
    ].join('\n')
  )
}

async function main() {
  const {projectId, dataset} = await getProjectAndDataset()

  const token = process.env.SANITY_AUTH_TOKEN
  if (!token) {
    throw new Error(
      'Missing SANITY_AUTH_TOKEN. Run with:\n  npx sanity exec ./scripts/seed-homepage.ts --with-user-token'
    )
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2025-01-01',
    useCdn: false,
    token,
  })

  // Singleton id – קבוע, כדי שלא יווצרו "כמה דפי בית"
  const _id = 'homePage'

  const doc = {
    _id,
    _type: 'homePage',

    // SEO (מחובר כבר עכשיו דרך index.astro -> BaseLayout)
    seo: {
      _type: 'seo',
      title: 'מצפן הלב',
      description: 'אימון רגשי תודעתי לשחרור חסמים, מציאת זוגיות ופריצת דרך בקריירה ועסקים.',
      noindex: false,
      // ogImage בכוונה לא ממולא כרגע, כי האתר עדיין לא קורא אותו מ-Sanity בלי שינוי קוד.
    },

    // HERO
    hero: {
      _type: 'hero',
      badge: 'משנים דפוסים מהשורש',
      titleLine1: 'לבחור מתוך תשוקה,',
      titleLine2: 'לא מתוך הפחד.',
      titleLine3: '',
      subheadline: 'תהליך עומק לשחרור חסמים, מציאת זוגיות ופריצת דרך בקריירה ועסקים',
      primaryCtaHref: 'https://wa.me/972544580285',
    },

    // פסקת גשר
    introParagraph:
      'תהליך עומק לשחרור חסמים, מציאת זוגיות ופריצת דרך בקריירה ועסקים.',

    // מודל מ.ס.ע
    methodIntro:
      'חשוב להדגיש: אימון מוגדר כמטרה ויעד. המודל עובד בשלושה שלבים מדויקים.',

    // אצלך בפועל homePage משתמש ב-msaSection
    msa: {
      _type: 'msaSection',
      items: [
        {
          _key: 'mipui',
          letter: 'מ',
          title: 'מיפוי',
          subtitle: 'זיהוי החסמים',
          text: 'מיפוי הדפוסים, החסמים והאמונות שמנהלים אותך בפועל.',
        },
        {
          _key: 'siluk',
          letter: 'ס',
          title: 'סילוק',
          subtitle: 'ניקוי השטח',
          text: 'סילוק החסמים בעזרת כלים תודעתיים, והנמכת הרעש הפנימי.',
        },
        {
          _key: 'atzmaut',
          letter: 'ע',
          title: 'עצמאות',
          subtitle: 'הגעה ליעד',
          text: 'בהירות, החלטה וביצוע. כשאתה הבוגר שמוביל – אתה מתקדם.',
        },
      ],
    },

    // FAQ
    faq: {
      _type: 'faq',
      items: [
        {
          _key: 'faq1',
          question: 'זה טיפול או אימון?',
          answer: 'זה אימון רגשי תודעתי עם תהליך עומק, ממוקד יעד ותנועה פנימית.',
        },
        {
          _key: 'faq2',
          question: 'כמה זמן לוקח לראות שינוי?',
          answer: 'תלוי בעומק הדפוס ובמחויבות. המטרה היא שינוי מורגש כבר בשלבים הראשונים.',
        },
      ],
    },

    // CTA תחתון
    bottomCtaText: 'בוא נדבר תכל׳ס ←',
    bottomCtaHref: 'https://wa.me/972544580285',
  }

  await client.createIfNotExists({_id, _type: 'homePage'})

  await client
    .patch(_id)
    .set(doc)
    .commit({autoGenerateArrayKeys: true})

  console.log('✅ Seeded homePage successfully:', {projectId, dataset, _id})
}

main().catch((err) => {
  console.error('❌ Seed failed:\n', err?.message ?? err)
  process.exit(1)
})
