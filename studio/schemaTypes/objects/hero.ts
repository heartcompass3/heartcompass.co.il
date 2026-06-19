// studio2/schemaTypes/objects/hero.ts
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'hero',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({
      name: 'badge',
      title: 'תגית קטנה',
      type: 'string',
    }),
    defineField({
      name: 'titleLine1',
      title: 'כותרת שורה 1',
      type: 'string',
    }),
    defineField({
      name: 'titleLine2',
      title: 'כותרת שורה 2',
      type: 'string',
    }),
    defineField({
      name: 'titleLine3',
      title: 'כותרת שורה 3',
      description: 'כדי שהכותרת הגדולה תשבר ל־3 שורות בדיוק',
      type: 'string',
    }),
    defineField({
      name: 'subheadline',
      title: 'תת כותרת',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'תיאור',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'primaryCtaText',
      title: 'כפתור ראשי טקסט',
      type: 'string',
    }),
    defineField({
      name: 'primaryCtaHref',
      title: 'כפתור ראשי קישור',
      type: 'url',
    }),
    defineField({
      name: 'secondaryCtaText',
      title: 'כפתור משני טקסט',
      type: 'string',
    }),
    defineField({
      name: 'secondaryCtaHref',
      title: 'כפתור משני קישור',
      type: 'string',
      description: 'יכול להיות גם נתיב פנימי למשל /about',
    }),
    defineField({
      name: 'image',
      title: 'תמונה',
      type: 'image',
      options: {hotspot: true},
    }),
  ],
})
