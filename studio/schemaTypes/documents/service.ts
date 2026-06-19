import { defineType, defineField } from 'sanity'

const service = defineType({
  name: 'service',
  title: 'שירות',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'כותרת שירות',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'כתובת (slug)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'תת כותרת (אופציונלי)',
      type: 'string',
    }),
    defineField({
      name: 'lead',
      title: 'פתיח קצר',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'body',
      title: 'תוכן השירות',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
})

export default service
