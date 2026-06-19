import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'category',
  title: 'קטגוריה',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'שם הקטגוריה',
      type: 'string',
      validation: (Rule) => Rule.required(),
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
      name: 'description',
      title: 'תיאור קצר',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'heroText',
      title: 'טקסט פתיחה',
      type: 'text',
      rows: 5,
    }),
    defineField({
      name: 'faqTitle',
      title: 'כותרת שאלות ותשובות',
      type: 'string',
      initialValue: 'שאלות שאנשים שואלים את עצמם בשקט',
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
        },
      ],
    }),
  ],
})