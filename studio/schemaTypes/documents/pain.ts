import { defineField, defineType } from 'sanity'

/**
 * pain — מוקד כאב חוצה-תחום (Pain Hub) → /pain/[slug]
 *
 * כל כאב הוא גם דף-עוגן (pillar) וגם תגית: מאמרים מצביעים אליו דרך
 * שדה reference (article.pains), והדף מתמלא בהם אוטומטית — בלי לבנות
 * דף ידני לכל כאב. שדות ה-AEO נשלפים ל-JSON-LD ואינם מוצגים לגולש.
 *
 * נבנה כ-document נפרד כדי לא לגעת בטיפוסים הקיימים בדאטהסט המשותף.
 */
export default defineType({
  name: 'pain',
  title: 'מוקד כאב (Pain Hub)',
  type: 'document',

  groups: [
    { name: 'content', title: 'תוכן הדף', default: true },
    { name: 'faqCta', title: 'שאלות נפוצות + CTA' },
    { name: 'aeo', title: '🤖 AEO — לחישה ל-AI (נסתר)' },
    { name: 'seo', title: 'SEO' },
    { name: 'settings', title: 'הגדרות' },
  ],

  fields: [
    // ─────────────────────────── תוכן ───────────────────────────
    defineField({
      name: 'title',
      title: 'כותרת ראשית (H1)',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
      description:
        'שם הכאב כפי שאנשים מחפשים אותו. ביטוי רחב, לא שאלה ארוכה. למשל: "קשר רעיל" / "ערך עצמי נמוך" / "חרדה חברתית".',
    }),

    defineField({
      name: 'slug',
      title: 'כתובת הדף (Slug)',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 64 },
      validation: (Rule) => Rule.required(),
      description: 'באנגלית, ללא רווחים. למשל: toxic-relationship / self-worth / social-anxiety.',
    }),

    defineField({
      name: 'goldLine',
      title: 'שורת מסגור (זהב, H2)',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.max(160),
      description: 'שורה אחת שממסגרת את זווית הכאב. מקצועית, לא שיווקית.',
    }),

    defineField({
      name: 'definition',
      title: 'מה זה בעצם? (הגדרה)',
      type: 'text',
      rows: 4,
      group: 'content',
      description:
        'הגדרה עניינית וקצרה בראש הדף: מה המונח אומר, ההיבט הקליני אם רלוונטי, ומקור השם. מצוין לתשובות חיפוש ול-AI (נשלף גם ל-schema). אופציונלי.',
    }),

    defineField({
      name: 'heroIntro',
      title: 'פיצוח הכאב — פסקת פתיחה',
      type: 'text',
      rows: 5,
      group: 'content',
      validation: (Rule) => Rule.required(),
      description: 'פתיח בקול יוסי שמדבר אל הכאב ומגדיר על מה הדף. 2–4 משפטים.',
    }),

    defineField({
      name: 'painPoints',
      title: 'הכאבים — "האם זה מוכר לך?"',
      type: 'array',
      group: 'content',
      of: [{ type: 'string' }],
      description: 'רשימת הסיטואציות שהקורא מזהה את עצמו בהן. כל פריט = משפט אחד. אופציונלי.',
    }),

    defineField({
      name: 'body',
      title: 'תוכן מורחב',
      type: 'blockContent',
      group: 'content',
      description: 'גוף הדף — הסבר מעמיק. אופציונלי. ניתן לכלול כותרות משנה, תמונות וציטוטים.',
    }),

    // ─────────────────────── שאלות נפוצות + CTA ───────────────────
    defineField({
      name: 'faqItems',
      title: 'שאלות נפוצות (FAQ)',
      type: 'array',
      group: 'faqCta',
      description: 'יופיעו בתחתית הדף ויקבלו FAQPage Schema אוטומטי (Rich Snippets ומענה למנועי AI).',
      of: [
        {
          name: 'qa',
          title: 'שאלה ותשובה',
          type: 'object',
          fields: [
            { name: 'question', title: 'שאלה', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'answer', title: 'תשובה', type: 'text', rows: 4, validation: (Rule) => Rule.required() },
          ],
          preview: { select: { title: 'question' } },
        },
      ],
    }),

    defineField({
      name: 'cta',
      title: 'בלוק קריאה לפעולה (CTA)',
      type: 'object',
      group: 'faqCta',
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: 'heading', title: 'כותרת', type: 'string' },
        { name: 'text', title: 'טקסט', type: 'text', rows: 3 },
        { name: 'buttonLabel', title: 'תווית כפתור', type: 'string' },
        { name: 'buttonHref', title: 'קישור כפתור', type: 'string', description: 'למשל /contact' },
      ],
    }),

    // ─────────────────────── AEO — נסתר מהגולש ───────────────────
    defineField({
      name: 'aiCitation',
      title: 'לחישה ל-AI — תשובה במשפט',
      type: 'text',
      rows: 2,
      group: 'aeo',
      description:
        'משפט עצמאי וחד שעונה במדויק על הכאב. זה מה שמנועי AI (ChatGPT, Perplexity, Google AI) ישלפו לציטוט. נשלף ל-JSON-LD — לא מוצג ויזואלית.',
    }),
    defineField({
      name: 'aiContext',
      title: 'הקשר נוסף ל-AI (נסתר)',
      type: 'text',
      rows: 4,
      group: 'aeo',
      description: 'מידע עובדתי נוסף שעוזר ל-AI להבין ולצטט נכון. לא מוצג בדף.',
    }),
    defineField({
      name: 'painKeywords',
      title: 'מילות מפתח (נסתר — לזחלנים ו-AI)',
      type: 'array',
      group: 'aeo',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description:
        'מילות המפתח שהכאב מכסה (פחד מנטישה, ריחוק רגשי, דפוסי ריצוי...). נשלפות כ-keywords ל-JSON-LD — אינן מוצגות לגולש.',
    }),

    // ─────────────────────────── SEO ─────────────────────────────
    defineField({
      name: 'excerpt',
      title: 'תקציר לשיתופים',
      type: 'text',
      rows: 3,
      group: 'seo',
      validation: (Rule) => Rule.max(160).warning('מומלץ עד 160 תווים'),
      description: 'תיאור קצר שמשמש כ-meta description ובשיתופים. אם ריק — ייגזר מפסקת הפתיחה.',
    }),
    defineField({
      name: 'seo',
      title: 'SEO מתקדם',
      type: 'seo',
      group: 'seo',
    }),

    // ───────────────────────── הגדרות ───────────────────────────
    defineField({
      name: 'publishedSite',
      title: 'באיזה אתר להציג',
      type: 'string',
      group: 'settings',
      initialValue: 'new',
      options: {
        list: [
          { title: 'אתר חדש בלבד (heartcompass.co.il)', value: 'new' },
          { title: 'שני האתרים', value: 'both' },
        ],
        layout: 'radio',
      },
      description: 'שליטה דו-אתרית. ברירת המחדל "אתר חדש בלבד" כדי לא לפגוע באתר הישן.',
    }),
    defineField({
      name: 'order',
      title: 'סדר הצגה',
      type: 'number',
      group: 'settings',
      initialValue: 10,
      description: '1 = ראשון. מספר נמוך מופיע קודם.',
    }),
  ],

  preview: {
    select: { title: 'title', subtitle: 'goldLine' },
    prepare({ title, subtitle }) {
      return { title: `🩹 ${title}`, subtitle: subtitle || 'מוקד כאב' }
    },
  },
})
