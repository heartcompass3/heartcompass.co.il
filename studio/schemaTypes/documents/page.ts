import {defineType, defineField, defineArrayMember} from 'sanity'

export default defineType({
  name: 'page',
  title: 'דף',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'כותרת',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'contentUpdatedAt',
      title: 'תאריך עדכון תוכן (עדכן ידנית!)',
      type: 'datetime',
      description:
        'עדכנו רק כשיש שינוי תוכן משמעותי (לא תיקון טעות כתיב). נשלף ל-dateModified ב-JSON-LD ולתאריך lastmod במפת האתר, במקום תאריך השמירה הטכני האחרון ב-Sanity.',
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
      title: 'שורת זהב (H2) / תיאור קצר',
      type: 'text',
      rows: 2,
      description:
        'בדפי התמחות זה ישמש כשורת הזהב מתחת ל-H1.',
    }),

    defineField({
      name: 'body',
      title: 'תוכן (מאמר / טקסט חופשי)',
      type: 'array',
      of: [{type: 'block'}],
      description:
        'לא חובה בדפי התמחות אם משתמשים בשדות הייעודיים למטה.',
    }),

    // =========================
    // SPECIALTY STRUCTURE
    // =========================

    defineField({
      name: 'specialty',
      title: 'דף התמחות – מבנה מסע',
      type: 'object',

      options: {
        collapsed: false,
        collapsible: true,
      },

      fields: [
        defineField({
          name: 'intro',
          title: 'טקסט פתיחה קצר (אחרי H1+שורת זהב)',
          type: 'text',
          rows: 5,
        }),

        defineField({
          name: 'practicalGuidance',
          title: 'מה מקבלים בתהליך – מקטע עומק',
          type: 'object',
          description:
            'מקטע אופציונלי שמסביר בצורה מעשית מה קורה בתהליך. בדף ההורים הוא מופיע לפני שלבי מ.ס.ע.',
          options: {
            collapsed: true,
            collapsible: true,
          },
          fields: [
            defineField({
              name: 'label',
              title: 'כותרת קטנה מעל המקטע',
              type: 'string',
            }),
            defineField({
              name: 'title',
              title: 'כותרת המקטע',
              type: 'string',
            }),
            defineField({
              name: 'intro',
              title: 'פסקת פתיחה',
              type: 'text',
              rows: 4,
            }),
            defineField({
              name: 'steps',
              title: 'הצעדים המעשיים',
              type: 'array',
              validation: (Rule) => Rule.max(4),
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'guidanceStep',
                  title: 'צעד',
                  fields: [
                    defineField({
                      name: 'title',
                      title: 'כותרת',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'text',
                      title: 'הסבר',
                      type: 'text',
                      rows: 3,
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'title',
                      subtitle: 'text',
                    },
                  },
                }),
                defineArrayMember({
                  type: 'object',
                  name: 'practicalGuidanceStep',
                  title: 'צעד',
                  fields: [
                    defineField({
                      name: 'title',
                      title: 'כותרת',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'text',
                      title: 'הסבר',
                      type: 'text',
                      rows: 3,
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'title',
                      subtitle: 'text',
                    },
                  },
                }),
              ],
            }),
            defineField({
              name: 'withoutTeen',
              title: 'התאמה, נקודה חשובה',
              type: 'object',
              fields: [
                defineField({name: 'title', title: 'כותרת', type: 'string'}),
                defineField({name: 'text', title: 'טקסט', type: 'text', rows: 5}),
              ],
            }),
            defineField({
              name: 'gettingStarted',
              title: 'כך מתחילים',
              type: 'object',
              fields: [
                defineField({name: 'title', title: 'כותרת', type: 'string'}),
                defineField({name: 'text', title: 'טקסט', type: 'text', rows: 4}),
              ],
            }),
            defineField({
              name: 'professionalTrust',
              title: 'מי מלווה, סמכות והקשר',
              type: 'object',
              fields: [
                defineField({name: 'title', title: 'כותרת', type: 'string'}),
                defineField({name: 'text', title: 'טקסט', type: 'text', rows: 4}),
              ],
            }),
            defineField({
              name: 'safety',
              title: 'גבולות המענה ומתי לפנות לעזרה נוספת',
              type: 'object',
              fields: [
                defineField({name: 'title', title: 'כותרת', type: 'string'}),
                defineField({name: 'text', title: 'טקסט', type: 'text', rows: 5}),
              ],
            }),
          ],
        }),

        // =========================
        // FAQ
        // =========================

        defineField({
          name: 'faqTitle',
          title: 'כותרת שאלות ותשובות',
          type: 'string',
          initialValue:
            'שאלות שאנשים שואלים את עצמם בשקט',
        }),

        defineField({
          name: 'faq',
          title: 'שאלות ותשובות',
          type: 'array',

          of: [
            {
              type: 'object',

              fields: [
                defineField({
                  name: 'question',
                  title: 'שאלה',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),

                defineField({
                  name: 'answer',
                  title: 'תשובה',
                  type: 'text',
                  rows: 4,
                  validation: (Rule) => Rule.required(),
                }),
              ],

              preview: {
                select: {
                  title: 'question',
                  subtitle: 'answer',
                },
              },
            },
          ],
        }),

        // =========================
        // STAGES
        // =========================

        defineField({
          name: 'stagesTitle',
          title: 'כותרת לפני השלבים (אופציונלי)',
          type: 'string',
          initialValue: 'מה קורה בפועל',
        }),

        defineField({
          name: 'stages',
          title: 'שלבים (מיפוי, סילוק, עצמאות)',
          type: 'array',

          validation: (Rule) => Rule.max(3),

          of: [
            {
              type: 'object',
              name: 'specialtyStage',
              title: 'שלב',

              fields: [
                defineField({
                  name: 'key',
                  title: 'מזהה שלב',
                  type: 'string',

                  options: {
                    list: [
                      {
                        title: 'מיפוי',
                        value: 'mapping',
                      },

                      {
                        title: 'סילוק',
                        value: 'removal',
                      },

                      {
                        title: 'עצמאות',
                        value: 'autonomy',
                      },
                    ],

                    layout: 'radio',
                  },

                  validation: (Rule) => Rule.required(),
                }),

                defineField({
                  name: 'title',
                  title: 'כותרת שלב',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),

                defineField({
                  name: 'text',
                  title: 'טקסט שלב',
                  type: 'text',
                  rows: 3,
                  validation: (Rule) => Rule.required(),
                }),
              ],

              preview: {
                select: {
                  title: 'title',
                  key: 'key',
                },

                prepare({title, key}: any) {
                  const map: Record<string, string> = {
                    mapping: 'מיפוי',
                    removal: 'סילוק',
                    autonomy: 'עצמאות',
                  }

                  return {
                    title: title || 'שלב',
                    subtitle: map[key] || key,
                  }
                },
              },
            },
          ],
        }),

        defineField({
          name: 'closing',
          title: 'סיום קצר (אופציונלי)',
          type: 'text',
          rows: 4,
        }),
      ],
    }),

    // =========================
    // AEO (נסתר — JSON-LD בלבד)
    // =========================

    defineField({
      name: 'aiCitation',
      title: 'לחישה ל-AI — תשובה במשפט',
      type: 'text',
      rows: 2,
      description: 'משפט אחד שעונה על מהות הדף. נשלף ל-JSON-LD לציטוט AI. לא חובה.',
    }),
    defineField({
      name: 'painTags',
      title: 'תגיות כאב (נסתר — לזחלנים ו-AI)',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: 'נשלפות כ-keywords ל-JSON-LD. אינן מוצגות לגולש.',
    }),
    defineField({
      name: 'aiContext',
      title: 'הקשר נוסף ל-AI (נסתר)',
      type: 'text',
      rows: 3,
      description: 'מידע עובדתי נוסף ל-AI. נשלף ל-JSON-LD, לא מוצג בעמוד.',
    }),

    // =========================
    // SEO
    // =========================

    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
})
