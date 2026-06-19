import { defineField, defineType } from 'sanity'

/**
 * specialty — עמוד תחום התמחות / קהל יעד (/specialties/[slug])
 *
 * נבנה כ-document נפרד כדי לא לגעת בטיפוסים הקיימים בדאטהסט המשותף.
 * שדות ה-AEO (לחישה ל-AI, תגיות כאב) נשלפים ל-JSON-LD / מטא ואינם מוצגים
 * ויזואלית בעמוד — בדיוק כפי שסוכם: קריאים לזחלנים ול-AI, בלתי נראים לגולש.
 */
export default defineType({
  name: 'specialty',
  title: 'תחום התמחות',
  type: 'document',

  groups: [
    { name: 'content', title: 'תוכן הדף', default: true },
    { name: 'mse', title: 'שיטת מ.ס.ע' },
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
      description: 'כותרת העמוד. ממוקדת בקהל ובכאב, לא בשם המותג. למשל: "ליווי זוגי — לתקשורת שמחברת מחדש".',
    }),

    defineField({
      name: 'audienceLabel',
      title: 'שם הקהל (קצר)',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
      description: 'תווית קצרה לכרטיסים ולתפריט. למשל: זוגות / הורים / נוער / התפתחות אישית.',
    }),

    defineField({
      name: 'slug',
      title: 'כתובת הדף (Slug)',
      type: 'slug',
      group: 'content',
      options: { source: 'audienceLabel', maxLength: 64 },
      validation: (Rule) => Rule.required(),
      description: 'באנגלית, ללא רווחים. למשל: couples / parents / teens / personal.',
    }),

    defineField({
      name: 'emoji',
      title: 'אייקון (אימוג\'י)',
      type: 'string',
      group: 'content',
      description: 'אופציונלי. למשל 💑 👨‍👩‍👧 🧑‍🎓 🧭.',
    }),

    defineField({
      name: 'goldLine',
      title: 'שורת מסגור (זהב)',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.max(160),
      description: 'שורה אחת שממסגרת את זווית העמוד. מקצועית, לא שיווקית.',
    }),

    defineField({
      name: 'heroIntro',
      title: 'פסקת פתיחה',
      type: 'text',
      rows: 4,
      group: 'content',
      validation: (Rule) => Rule.required(),
      description: 'פתיח שמדבר אל הכאב של הקהל ומגדיר על מה העמוד. 2–4 משפטים.',
    }),

    defineField({
      name: 'mainImage',
      title: 'תמונה ראשית',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt (תיאור נגישות)',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),

    defineField({
      name: 'painPoints',
      title: 'הכאבים — "האם זה מוכר לך?"',
      type: 'array',
      group: 'content',
      of: [{ type: 'string' }],
      description: 'רשימת הכאבים/הסיטואציות שהקהל מזהה את עצמו בהן. מוצגת בעמוד כרשימה. כל פריט = משפט אחד.',
    }),

    defineField({
      name: 'whoIsItFor',
      title: 'למי זה מתאים',
      type: 'array',
      group: 'content',
      of: [{ type: 'string' }],
      description: 'נקודות קצרות שמגדירות בדיוק למי העמוד מיועד.',
    }),

    defineField({
      name: 'benefits',
      title: 'מה תקבלו מהתהליך',
      type: 'array',
      group: 'content',
      of: [{ type: 'string' }],
      description: 'התוצאות/השינויים שהקהל ייקח מהתהליך.',
    }),

    defineField({
      name: 'body',
      title: 'תוכן מורחב',
      type: 'blockContent',
      group: 'content',
      description: 'גוף העמוד — הסבר מעמיק. ניתן לכלול כותרות משנה, תמונות וציטוטים.',
    }),

    // ─────────────────────────── מ.ס.ע ───────────────────────────
    defineField({
      name: 'mseIntro',
      title: 'משפט פתיחה למ.ס.ע (מותאם לקהל)',
      type: 'string',
      group: 'mse',
      description: 'איך שיטת מ.ס.ע מתורגמת לקהל הזה. אופציונלי.',
    }),
    defineField({
      name: 'mseSteps',
      title: 'שלבי מ.ס.ע מותאמים',
      type: 'array',
      group: 'mse',
      description: 'שלושת השלבים בהתאמה לקהל. אם ריק — יוצג מודל מ.ס.ע הגנרי.',
      of: [
        {
          type: 'object',
          name: 'mseStep',
          fields: [
            { name: 'letter', title: 'אות (מ / ס / ע)', type: 'string' },
            { name: 'title', title: 'שם השלב', type: 'string' },
            { name: 'text', title: 'תיאור מותאם לקהל', type: 'text', rows: 3 },
          ],
          preview: { select: { title: 'title', subtitle: 'letter' } },
        },
      ],
    }),

    // ─────────────────────── שאלות נפוצות + CTA ───────────────────
    defineField({
      name: 'faqItems',
      title: 'שאלות נפוצות (FAQ)',
      type: 'array',
      group: 'faqCta',
      description: 'יופיעו בתחתית העמוד ויקבלו FAQPage Schema אוטומטי (Rich Snippets ב-Google ומענה למנועי AI).',
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
        'משפט עצמאי וחד שעונה במדויק "מה מצפן הלב מציע לקהל הזה". זה מה שמנועי AI (ChatGPT, Perplexity, Google AI) ישלפו לציטוט. נשלף ל-JSON-LD (abstract) ולמטא — לא מוצג ויזואלית בעמוד.',
    }),
    defineField({
      name: 'aiContext',
      title: 'הקשר נוסף ל-AI (נסתר)',
      type: 'text',
      rows: 4,
      group: 'aeo',
      description: 'מידע עובדתי נוסף שעוזר ל-AI להבין ולצטט נכון. לא מוצג בעמוד.',
    }),
    defineField({
      name: 'painTags',
      title: 'תגיות כאב (נסתר — לזחלנים ו-AI)',
      type: 'array',
      group: 'aeo',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description:
        'תגיות הכאב שמאפיינות את הקהל (חרדה, ריחוק רגשי, פחד מנטישה, דפוסי ריצוי...). נכתבות כ-meta ול-JSON-LD (keywords) לקריאת זחלנים ו-AI — אינן מוצגות לגולש.',
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
      name: 'relatedTag',
      title: 'תגית מאמרים מקושרים',
      type: 'string',
      group: 'settings',
      options: {
        list: [
          { title: 'זוגיות', value: 'זוגיות' },
          { title: 'הורות', value: 'הורות' },
          { title: 'נוער', value: 'נוער' },
          { title: 'קריירה', value: 'קריירה' },
          { title: 'התפתחות אישית', value: 'התפתחות אישית' },
        ],
      },
      description: 'מאמרים עם תגית זו יוצגו אוטומטית בתחתית העמוד ("מאמרים נוספים").',
    }),
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
    select: { title: 'title', subtitle: 'audienceLabel', media: 'mainImage' },
    prepare({ title, subtitle, media }) {
      return { title, subtitle: subtitle ? `תחום: ${subtitle}` : 'תחום התמחות', media }
    },
  },
})
