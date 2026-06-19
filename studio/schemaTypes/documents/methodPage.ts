import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'methodPage',
  title: 'השיטה (מ.ס.ע)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'כותרת פנימית (לניהול בלבד)',
      type: 'string',
      initialValue: 'השיטה (מ.ס.ע)',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      fields: [
        defineField({
          name: 'headlineLine1',
          title: 'כותרת ראשית שורה 1 (H1)',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'headlineLine2',
          title: 'כותרת ראשית שורה 2 (H1) (אופציונלי)',
          type: 'string',
        }),
        defineField({
          name: 'subheadline',
          title: 'שורת זהב מתחת לכותרת',
          type: 'text',
          rows: 2,
          description: 'משפט אחד קצר שמגדיר כיוון, לא מסביר.',
        }),
        defineField({
          name: 'intro',
          title: 'פתיחה קצרה (אופציונלי)',
          type: 'text',
          rows: 4,
        }),
      ],
    }),

    defineField({
      name: 'interludeImage',
      title: 'תמונה – נשימה באמצע הדרך',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'טקסט חלופי (Alt)',
          type: 'string',
          description: 'מומלץ ל-SEO ולנגישות',
        }),
        defineField({
          name: 'caption',
          title: 'כיתוב קטן (אופציונלי)',
          type: 'string',
        }),
      ],
    }),

    defineField({
      name: 'body',
      title: 'תוכן הדף (מאמר רציף)',
      type: 'array',
      of: [{type: 'block'}],
      description:
        'מדביקים כאן את הטקסט כרצף. כותרות פרקים מסמנים כ-Heading 2.',
    }),

    defineField({
      name: 'msa',
      title: 'מ.ס.ע – הליבה',
      type: 'object',
      fields: [
        defineField({
          name: 'intro',
          title: 'משפט פתיחה קצר (אופציונלי)',
          type: 'text',
          rows: 3,
        }),
        defineField({
          name: 'steps',
          title: 'שלבים (חייב בדיוק 3)',
          type: 'array',
          validation: (Rule) => Rule.required().min(3).max(3),
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'letter',
                  title: 'אות (מ / ס / ע)',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'title',
                  title: 'כותרת',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'description',
                  title: 'הסבר',
                  type: 'array',
                  of: [{type: 'block'}],
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'exampleTitle',
                  title: 'כותרת דוגמה',
                  type: 'string',
                  initialValue: 'דוגמה מהחיים',
                }),
                defineField({
                  name: 'example',
                  title: 'דוגמה מהחיים',
                  type: 'array',
                  of: [{type: 'block'}],
                }),
              ],
              preview: {
                select: {t: 'title', l: 'letter'},
                prepare({t, l}) {
                  return {title: `${l}. ${t}`}
                },
              },
            },
          ],
        }),
      ],
    }),

    defineField({
      name: 'cta',
      title: 'CTA',
      type: 'object',
      fields: [
        defineField({name: 'title', title: 'כותרת', type: 'string'}),
        defineField({name: 'text', title: 'טקסט', type: 'text', rows: 3}),
        defineField({name: 'buttonLabel', title: 'טקסט כפתור', type: 'string'}),
        defineField({name: 'buttonHref', title: 'קישור כפתור', type: 'string'}),
      ],
    }),

    // ─── AEO: תיבת "בקצרה" גלויה ─────────────────────────────────
    defineField({
      name: 'aiCitation',
      title: 'לחישה ל-AI — תשובה במשפט',
      type: 'text',
      rows: 2,
      description:
        'משפט אחד עצמאי שעונה "מהי שיטת מ.ס.ע". יוצג בתיבת "בקצרה" בראש הדף, וזה מה שמנועי AI ישלפו לציטוט.',
    }),
    defineField({
      name: 'keyTakeaways',
      title: 'נקודות מפתח (תיבת "בקצרה")',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: 'heading', title: 'כותרת התיבה', type: 'string' },
        { name: 'items', title: 'נקודות', type: 'array', of: [{ type: 'string' }] },
      ],
    }),
    defineField({
      name: 'faqItems',
      title: 'שאלות נפוצות (FAQ)',
      type: 'array',
      description: 'יופיעו בתחתית הדף ויקבלו FAQPage Schema אוטומטי.',
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

    // ─── AEO: נסתר (JSON-LD בלבד) ────────────────────────────────
    defineField({
      name: 'painTags',
      title: 'תגיות כאב (נסתר — לזחלנים ו-AI)',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'נשלפות כ-keywords ל-JSON-LD. אינן מוצגות לגולש.',
    }),
    defineField({
      name: 'aiContext',
      title: 'הקשר נוסף ל-AI (נסתר)',
      type: 'text',
      rows: 3,
      description: 'מידע עובדתי נוסף ל-AI. נשלף ל-JSON-LD, לא מוצג בעמוד.',
    }),

    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],

  initialValue: {
    hero: {
      headlineLine1: 'שיטת מ.ס.ע',
      headlineLine2: 'לצאת מהלופ ולחזור לעצמך',
      subheadline: 'תהליך רגשי תודעתי שמחזיר בהירות ושקט מבפנים.',
      intro: '',
    },
    cta: {
      title: 'רוצה לבדוק אם זה מתאים?',
      text: 'אפשר לדבר כמה דקות, להבין איפה אתה נמצא עכשיו, ולבדוק אם מ.ס.ע היא הדרך הנכונה עבורך.',
      buttonLabel: 'יוסי, בוא נבדוק התאמה',
      buttonHref: '',
    },
  },
})
