import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'contactPage',
  title: 'צור קשר',
  type: 'document',
  fields: [
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),

    defineField({
      name: 'left',
      title: 'צד לבן (שמאל)',
      type: 'object',
      options: {collapsed: false, collapsible: true},
      fields: [
        defineField({
          name: 'title',
          title: 'כותרת',
          type: 'string',
          initialValue: 'תיאום שיחה קצרה',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'text',
          title: 'טקסט',
          type: 'text',
          rows: 4,
          initialValue:
            'כדי לא להעמיס, כרגע הדרך הכי מהירה היא WhatsApp. תכתוב לי כמה שאלות מוכנות בפתחו של הירוק למטה.',
        }),
        defineField({
          name: 'ctaLabel',
          title: 'טקסט כפתור (וואטסאפ)',
          type: 'string',
          initialValue: "בוא נדבר תכל'ס",
        }),
        defineField({
          name: 'helper',
          title: 'טקסט קטן מתחת לכפתור',
          type: 'text',
          rows: 2,
          initialValue:
            'אם אתה יודע כבר מה הכאב המרכזי, תכתוב אותו במשפט אחד. זה מספיק כדי להתחיל.',
        }),
      ],
    }),

    defineField({
      name: 'right',
      title: 'צד כחול (ימין)',
      type: 'object',
      options: {collapsed: false, collapsible: true},
      fields: [
        defineField({
          name: 'titleLine1',
          title: 'כותרת שורה 1',
          type: 'string',
          initialValue: 'בוא נפתח',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'titleLine2',
          title: 'כותרת שורה 2 (צהוב)',
          type: 'string',
          initialValue: 'דף חדש.',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'ctaLabel',
          title: 'טקסט כפתור (מייל)',
          type: 'string',
          initialValue: 'שליחת מייל',
        }),
        defineField({
          name: 'helper',
          title: 'טקסט קטן מתחת לכפתור',
          type: 'text',
          rows: 2,
          initialValue:
            'אם אתה לא בטוח מה לכתוב, פשוט רשום: “אני רוצה להבין מה הצעד הבא.”',
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'צור קשר'}
    },
  },
})
