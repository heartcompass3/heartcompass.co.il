import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'article',
  title: 'מאמר',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'כותרת ראשית',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description:
        'כותרת חקירתית וברורה. מגדירה בעיה או תופעה. לא סלוגן ולא הבטחה.',
    }),

    defineField({
      name: 'goldLine',
      title: 'שורת מסגור (זהב)',
      type: 'string',
      validation: (Rule) => Rule.required().max(160),
      description:
        'שורת מסגור מקצועית. מבהירה את זווית המאמר. לא רגשית, לא שיווקית.',
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'excerpt',
      title: 'תקציר ענייני',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().max(300),
      description:
        'תקציר אינפורמטיבי: על מה המאמר, למי הוא רלוונטי, ומה הקורא יבין בסופו.',
    }),

    defineField({
      name: 'mainImage',
      title: 'תמונה ראשית',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt',
          type: 'string',
          validation: (Rule) => Rule.required(),
          description: 'תיאור נגישות לתמונה.',
        }),
      ],
    }),

    defineField({
      name: 'publishedAt',
      title: 'תאריך פרסום',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'author',
      title: 'מחבר',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'authorLine',
      title: 'שורת סמכות',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description:
        'לדוגמה: יוסי מדלסי · מורה דרך לשחרור דפוסים',
    }),

    defineField({
      name: 'tags',
      title: 'תחומים',
      type: 'array',

      of: [
        {
          type: 'string',
        },
      ],

      options: {
        list: [
          { title: 'זוגיות', value: 'זוגיות' },
          { title: 'הורות', value: 'הורות' },
          { title: 'נוער', value: 'נוער' },
          { title: 'קריירה', value: 'קריירה' },
          { title: 'התפתחות אישית', value: 'התפתחות אישית' },
        ],

        layout: 'grid',
      },

      description:
        'בחירת תחומים תציג את המאמר אוטומטית בדפים המתאימים באתר.',
    }),

    // ─── חדש: נקודות מפתח / תקציר מהיר (אופציונלי) ───────────────
    defineField({
      name: 'keyTakeaways',
      title: 'נקודות מפתח (תקציר מהיר)',
      type: 'object',
      description:
        'תיבה בראש המאמר עם הנקודות העיקריות. מצוין ל-Google (Featured Snippets) ולקורא. אופציונלי — אם משאירים ריק, התיבה לא תופיע.',
      options: { collapsible: true, collapsed: true },
      fields: [
        {
          name: 'heading',
          title: 'כותרת התיבה',
          type: 'string',
          description: 'למשל: "מה תלמדו במאמר". אם ריק — תוצג כותרת ברירת מחדל.',
        },
        {
          name: 'items',
          title: 'נקודות',
          type: 'array',
          of: [{ type: 'string' }],
        },
      ],
    }),
    // ─────────────────────────────────────────────────────────────

    // ─── חדש: תשובה במשפט (ציטוט למנועי AI / AEO) ────────────────
    defineField({
      name: 'aiCitation',
      title: 'תשובה במשפט (ציטוט למנועי AI)',
      type: 'text',
      rows: 2,
      description:
        'משפט אחד עצמאי וחד שעונה על שאלת הכותרת במלואה, בלי הקשר נוסף. יוצג כקאלאוט בולט בראש המאמר, וזה מה שמנועי AI (ChatGPT, Perplexity, Google AI) ישלפו לציטוט. אופציונלי — אם ריק, לא יוצג.',
    }),
    // ─────────────────────────────────────────────────────────────

    // ─── חדש: תגיות כאב (נסתר — לזחלנים ו-AI) ────────────────────
    defineField({
      name: 'painTags',
      title: 'תגיות כאב (נסתר — לזחלנים ו-AI)',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description:
        'תגיות הכאב שהמאמר עונה עליהן (למשל: חרדה חברתית, הצפה רגשית, ריחוק רגשי, דפוסים שחוזרים, פחד מנטישה). נשלפות כ-keywords ל-JSON-LD לקריאת זחלנים ומנועי AI — אינן מוצגות לגולש.',
    }),
    // ─── חדש: הקשר נוסף ל-AI (נסתר) ──────────────────────────────
    defineField({
      name: 'aiContext',
      title: 'הקשר נוסף ל-AI (נסתר)',
      type: 'text',
      rows: 3,
      description:
        'מידע עובדתי נוסף שעוזר ל-AI להבין ולצטט את המאמר נכון. נשלף ל-JSON-LD (disambiguatingDescription) ואינו מוצג בעמוד. אופציונלי.',
    }),
    // ─────────────────────────────────────────────────────────────

    defineField({
      name: 'body',
      title: 'גוף המאמר',
      type: 'blockContent',
      validation: (Rule) => Rule.required(),
      description:
        'תוכן המאמר. ניתן להוסיף תמונות בתוך הטקסט דרך כפתור "הוסף תמונה".',
    }),

    // ─── חדש: בלוק קריאה לפעולה (אופציונלי) ──────────────────────
    defineField({
      name: 'cta',
      title: 'בלוק קריאה לפעולה (CTA)',
      type: 'object',
      description:
        'תיבה מודגשת בתחתית המאמר שמזמינה את הקורא לפעולה. אופציונלי — אם משאירים ריק, לא תופיע.',
      options: { collapsible: true, collapsed: true },
      fields: [
        {
          name: 'heading',
          title: 'כותרת',
          type: 'string',
        },
        {
          name: 'text',
          title: 'טקסט',
          type: 'text',
          rows: 3,
        },
        {
          name: 'buttonLabel',
          title: 'תווית כפתור',
          type: 'string',
        },
        {
          name: 'buttonHref',
          title: 'קישור כפתור',
          type: 'url',
        },
      ],
    }),
    // ─────────────────────────────────────────────────────────────

    // ─── חדש: שאלות נפוצות ───────────────────────────────────────
    defineField({
      name: 'faqItems',
      title: 'שאלות נפוצות (FAQ)',
      type: 'array',
      description:
        'שאלות אלה יופיעו בסוף המאמר ויקבלו Schema אוטומטי ב-Google (Rich Snippets).',
      of: [
        {
          name: 'qa',
          title: 'שאלה ותשובה',
          type: 'object',
          fields: [
            {
              name: 'question',
              title: 'שאלה',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'answer',
              title: 'תשובה',
              type: 'text',
              rows: 4,
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: { title: 'question' },
          },
        },
      ],
    }),
    // ─────────────────────────────────────────────────────────────
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'goldLine',
      media: 'mainImage',
    },
  },
})
