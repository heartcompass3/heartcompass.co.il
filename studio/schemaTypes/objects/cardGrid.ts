import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'cardGrid',
  title: 'כרטיסים',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'כותרת הסקשן',
      type: 'string',
      initialValue: 'תחומי האימון',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'תיאור הסקשן',
      type: 'string',
      initialValue: 'שלושה עמודי תווך לתהליך עמוק, מדויק ומותאם.',
      validation: (Rule) =>
        Rule.max(180).warning('מומלץ עד 180 תווים'),
    }),
    defineField({
      name: 'items',
      title: 'כרטיסים',
      type: 'array',
      of: [
        defineField({
          name: 'card',
          title: 'כרטיס',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'כותרת',
              type: 'string',
            }),
            defineField({
              name: 'text',
              title: 'טקסט',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'link',
              title: 'קישור',
              type: 'string',
            }),
          ],
        }),
      ],
    }),
  ],
})
