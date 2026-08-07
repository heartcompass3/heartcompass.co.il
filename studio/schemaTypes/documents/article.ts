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
      validation: (Rule) =>
        Rule.required().custom(async (title, context) => {
          if (!title) return true
          const { document, getClient } = context
          const client = getClient({ apiVersion: '2026-04-23' })
          const id = document?._id?.replace(/^drafts\./, '')
          const duplicate = await client.fetch(
            `count(*[_type == "article" && title == $title && !(_id in [$id, "drafts." + $id])])`,
            { title, id }
          )
          return duplicate > 0 ? 'כבר קיים מאמר עם הכותרת הזאת בדיוק — כותרות זהות מבלבלות חיפוש וקישור פנימי' : true
        }),
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
      name: 'contentUpdatedAt',
      title: 'תאריך עדכון תוכן (עדכן ידנית!)',
      type: 'datetime',
      description:
        'עדכנו את השדה הזה רק כשעשיתם שינוי תוכן משמעותי במאמר (לא תיקון טעות כתיב או שינוי שדה טכני). זה מה שמוצג לקורא כ"עודכן ב-", נשלף ל-dateModified ב-JSON-LD, ולתאריך lastmod במפת האתר. אם ריק, נופל חזרה לתאריך הפרסום — לא לתאריך השמירה האחרון ב-Sanity, כדי שעריכות טכניות לא יזייפו אות רעננות לגוגל.',
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

      validation: (Rule) => Rule.required().min(1).error('קהל יעד חובה — משפיע על באילו דפים המאמר יופיע אוטומטית'),

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

    // ─── חדש: SEO (כותרת/תיאור נפרדים מהתצוגה הגלויה) ─────────────
    defineField({
      name: 'seo',
      title: 'SEO (אופציונלי — override)',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      description:
        'רק אם צריך כותרת/תיאור שונים ממה שמוצג לקורא בפועל (title/excerpt). אם ריק, נופל חזרה אליהם אוטומטית.',
      fields: [
        defineField({
          name: 'title',
          title: 'כותרת SEO (Title Tag)',
          type: 'string',
          validation: (Rule) => Rule.max(60).warning('מומלץ עד 60 תווים'),
        }),
        defineField({
          name: 'description',
          title: 'תיאור SEO (Meta Description)',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.max(160).warning('מומלץ עד 160 תווים'),
        }),
      ],
    }),

    // ─── חדש: כוונת חיפוש + תפקיד באשכול התוכן ────────────────────
    defineField({
      name: 'searchIntent',
      title: 'כוונת חיפוש',
      type: 'string',
      options: {
        list: [
          { title: 'מידעי (informational)', value: 'informational' },
          { title: 'מסחרי (commercial)', value: 'commercial' },
          { title: 'ניווטי (navigational)', value: 'navigational' },
        ],
      },
      description: 'מה המחפש רוצה להשיג. עוזר להחליט אם המאמר עונה על השאלה הנכונה.',
    }),
    defineField({
      name: 'contentRole',
      title: 'תפקיד באשכול התוכן',
      type: 'string',
      options: {
        list: [
          { title: 'מאמר עוגן (pillar)', value: 'anchor' },
          { title: 'מאמר המשך/תומך', value: 'supporting' },
          { title: 'עדכון עונתי/זמני', value: 'update' },
          { title: 'Legacy — לא לקדם בהצעות/קישורים אוטומטיים', value: 'legacy' },
        ],
      },
      description:
        '"Legacy" מסמן מאמרים ישנים (למשל קריירה/עסקים) שלא רוצים שיוצעו אוטומטית כ"מאמרים נוספים" למאמרים חדשים.',
    }),

    // ─── חדש: מוקדי כאב (Pain Hubs) — חוצי-תחום ──────────────────
    defineField({
      name: 'pains',
      title: 'מוקדי כאב (Pain Hubs)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'pain' }] }],
      description:
        'הכאבים החוצי-תחום שהמאמר עוסק בהם (קשר רעיל, ערך עצמי, חרדה חברתית...). המאמר יופיע אוטומטית בעמוד הכאב /pain/[slug]. מאמר יכול להשתייך לכמה כאבים.',
    }),

    // ─── חדש: קשור לשיטת מ.ס.ע ────────────────────────────────────
    defineField({
      name: 'relatedToMethod',
      title: 'קשור לשיטת מ.ס.ע',
      type: 'boolean',
      initialValue: false,
      description:
        'סמן אם המאמר מעמיק את שיטת מ.ס.ע עצמה (מיפוי/סילוק/עצמאות, איך התהליך עובד, למה זה שונה מטיפול רגיל וכו\'). המאמר יופיע אוטומטית בעמוד /method תחת "מאמרים על השיטה".',
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
      validation: (Rule) =>
        Rule.custom((value: string | undefined) => {
          if (!value) return true
          if (/https?:\/\//i.test(value)) {
            return 'יש קישור גולמי בטקסט — מקורות שייכים לשדה "מקורות" למטה, לא לכאן (הוא נשלף אוטומטית ל-JSON-LD citation ומוצג לקורא).'
          }
          const systemNotePatterns = [
            /לפי בקשת/, /מאמר \d+ מתוך/, /חלק מסדרת/, /לא חלק מסדרה/,
            /מיועדים לאימות מנועי חיפוש/, /אינם מוצגים לגולש/, /מצב כתיבה/,
          ]
          if (systemNotePatterns.some((p) => p.test(value))) {
            return {
              warning:
                'נראה שיש כאן הערת עבודה פנימית (תזמון/הנחיה) ולא הקשר עובדתי על המאמר עצמו — היא תיחשף בפועל ב-JSON-LD הציבורי.',
            }
          }
          return true
        }),
      description:
        'מידע עובדתי נוסף שעוזר ל-AI להבין ולצטט את המאמר נכון. נשלף ל-JSON-LD (disambiguatingDescription) ואינו מוצג בעמוד. טקסט הסבר בלבד — בלי קישורים גולמיים ובלי הערות עבודה פנימיות; מקורות ומחקרים שייכים לשדה "מקורות" למטה. אופציונלי.',
    }),
    // ─────────────────────────────────────────────────────────────

    // ─── חדש: מקורות (מוצג לקורא + JSON-LD citation) ─────────────
    defineField({
      name: 'sources',
      title: 'מקורות',
      type: 'array',
      description:
        'מחקרים/מקורות שהמאמר מתבסס עליהם. מוצגים לקורא בתחתית המאמר, וממופים ל-citation ב-JSON-LD (AEO/E-E-A-T). את הקישורים הגולמיים יש להוסיף כאן, לא בתוך "הקשר נוסף ל-AI".',
      of: [
        {
          type: 'object',
          name: 'source',
          fields: [
            defineField({
              name: 'title',
              title: 'כותרת המקור',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'authors',
              title: 'מחברים',
              type: 'string',
              description: 'לדוגמה: Calvocoressi et al.',
            }),
            defineField({
              name: 'publisher',
              title: 'כתב עת / גוף מפרסם',
              type: 'string',
              description: 'לדוגמה: Journal of Anxiety Disorders, Yale School of Public Health',
            }),
            defineField({
              name: 'year',
              title: 'שנה',
              type: 'string',
            }),
            defineField({
              name: 'url',
              title: 'קישור',
              type: 'url',
            }),
            defineField({
              name: 'sourceType',
              title: 'סוג מקור',
              type: 'string',
              options: {
                list: [
                  { title: 'מחקר אקדמי', value: 'academic' },
                  { title: 'ארגון מקצועי', value: 'organization' },
                  { title: 'ספר', value: 'book' },
                  { title: 'כתבה / אתר', value: 'article' },
                ],
              },
            }),
            defineField({
              name: 'note',
              title: 'תקציר קצר (מה המקור מראה)',
              type: 'text',
              rows: 2,
              description: 'משפט אחד: מה המחקר הזה מוצא או מראה. יוצג לקורא לצד המקור.',
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'publisher' },
          },
        },
      ],
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
