import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'כותרת (Title)',
      type: 'string',
      validation: (Rule) => Rule.max(60).warning('מומלץ עד 60 תווים'),
    }),
    defineField({
      name: 'description',
      title: 'תיאור (Description)',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(160).warning('מומלץ עד 160 תווים'),
    }),
    defineField({
      name: 'ogImage',
      title: 'תמונת OG (שיתוף)',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'noindex',
      title: 'לא לאנדקס (noindex)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'canonical',
      title: 'Canonical URL (אופציונלי)',
      type: 'url',
    }),
  ],
})
