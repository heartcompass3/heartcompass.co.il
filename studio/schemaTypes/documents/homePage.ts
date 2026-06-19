// studio2/schemaTypes/documents/homePage.ts
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'homePage',
  title: 'דף בית',
  type: 'document',

  // סינגלטון: לא מאפשרים ליצור/למחוק, רק לערוך ולפרסם
  __experimental_actions: ['update', 'publish'],

  groups: [
    {name: 'seo', title: 'SEO'},
    {name: 'hero', title: 'Hero'},
    {name: 'content', title: 'תוכן'},
    {name: 'msa', title: 'מודל מ.ס.ע'},
    {name: 'faq', title: 'FAQ'},
    {name: 'bottom', title: 'CTA תחתון'},
    {name: 'legacy', title: 'Legacy (מוסתר)'},
  ],

  fields: [
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),

    // ─── AEO (נסתר — JSON-LD בלבד) ──────────────────────────────
    defineField({
      name: 'aiCitation',
      title: 'לחישה ל-AI — תשובה במשפט',
      type: 'text',
      rows: 2,
      group: 'seo',
      description: 'משפט אחד שעונה "מהו מצפן הלב ומה הוא מציע". נשלף ל-JSON-LD לציטוט AI. לא מוצג לגולש.',
    }),
    defineField({
      name: 'painTags',
      title: 'תגיות כאב (נסתר — לזחלנים ו-AI)',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      group: 'seo',
      description: 'נשלפות כ-keywords ל-JSON-LD. אינן מוצגות לגולש.',
    }),
    defineField({
      name: 'aiContext',
      title: 'הקשר נוסף ל-AI (נסתר)',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'מידע עובדתי נוסף ל-AI. נשלף ל-JSON-LD, לא מוצג בעמוד.',
    }),

    defineField({
      name: 'h1',
      title: 'H1 (כותרת ראשית בדף הבית)',
      type: 'string',
      description: 'מופיע מתחת לכותרת העיצובית. H1 אחד בלבד בדף.',
      group: 'seo',
      validation: (Rule) => Rule.max(90).warning('מומלץ עד 90 תווים'),
    }),

    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'hero',
      group: 'hero',
    }),

    // השדה הישן – נשאר TEXT כדי לא לשבור נתונים קיימים
    defineField({
      name: 'introParagraph',
      title: 'פסקת גשר (ישן – טקסט פשוט)',
      type: 'text',
      rows: 3,
      group: 'legacy',
      hidden: true,
    }),

    // השדה החדש – Rich Text עם סרגל כלים
    defineField({
      name: 'introParagraphRich',
      title: 'פסקת גשר (עם עריכה מלאה)',
      type: 'blockContent',
      group: 'content',
      description: 'כאן אפשר הדגשות, קישורים, רשימות וריווח טבעי בין פסקאות.',
    }),

    // IMPORTANT:
    // האתר (Astro) מצפה ל- home.cards.items ולכן cards חייב להיות אובייקט (cardGrid) ולא מערך.
    defineField({
      name: 'cards',
      title: 'כרטיסים (3 תחומים)',
      type: 'cardGrid',
      group: 'content',
    }),

    defineField({
      name: 'methodHeading',
      title: 'כותרת קטנה לסקשן השיטה',
      type: 'string',
      group: 'content',
    }),

    defineField({
      name: 'methodTitle',
      title: 'כותרת סקשן השיטה',
      type: 'string',
      group: 'content',
    }),

    defineField({
      name: 'methodIntro',
      title: 'טקסט פתיחה לסקשן השיטה',
      type: 'text',
      rows: 4,
      group: 'content',
    }),

    // IMPORTANT:
    // האתר (Astro) מצפה ל- home.msa.items ולכן msa חייב להיות אובייקט שמכיל items (msaGrid).
    defineField({
      name: 'msa',
      title: 'כרטיסי מ.ס.ע',
      type: 'msaGrid',
      group: 'msa',
    }),

    defineField({
      name: 'faq',
      title: 'שאלות נפוצות',
      type: 'faq',
      group: 'faq',
    }),

    defineField({
      name: 'bottomCtaText',
      title: 'טקסט CTA תחתון',
      type: 'string',
      group: 'bottom',
    }),

    defineField({
      name: 'bottomCtaHref',
      title: 'קישור CTA תחתון',
      type: 'string',
      group: 'bottom',
    }),

    // ===== שדות מיותרים כרגע (משאירים תאימות אבל מסתירים מהסטודיו) =====

    defineField({
      name: 'cardsHeading',
      title: 'כותרת הכרטיסים',
      type: 'string',
      hidden: true,
      group: 'legacy',
    }),

    defineField({
      name: 'cardsIntro',
      title: 'טקסט פתיחה לכרטיסים',
      type: 'text',
      hidden: true,
      group: 'legacy',
    }),

    defineField({
      name: 'ctaText',
      title: 'CTA טקסט',
      type: 'string',
      hidden: true,
      group: 'legacy',
    }),

    defineField({
      name: 'ctaHref',
      title: 'CTA קישור',
      type: 'string',
      hidden: true,
      group: 'legacy',
    }),
  ],

  preview: {
    select: {title: 'title'},
    prepare({title}) {
      return {title: title || 'דף הבית'}
    },
  },
})
