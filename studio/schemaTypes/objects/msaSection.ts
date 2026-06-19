// studio2/schemaTypes/objects/msaSection.ts
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'msaSection',
  title: 'מודל מ.ס.ע',
  type: 'object',
  fields: [
    defineField({name: 'heading', title: 'כותרת החלק', type: 'string'}),
    defineField({
      name: 'intro',
      title: 'טקסט פתיחה',
      type: 'text',
      rows: 3,
    }),
    defineField({name: 'title', title: 'כותרת המודל', type: 'string'}),
    defineField({
      name: 'items',
      title: 'שלבים',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'msaItem',
          fields: [
            defineField({name: 'letter', title: 'אות', type: 'string'}),
            defineField({name: 'title', title: 'כותרת', type: 'string'}),
            defineField({name: 'subtitle', title: 'תת כותרת', type: 'string'}),
            defineField({
              name: 'text',
              title: 'טקסט',
              type: 'text',
              rows: 3,
            }),
          ],
        },
      ],
    }),
  ],
})
