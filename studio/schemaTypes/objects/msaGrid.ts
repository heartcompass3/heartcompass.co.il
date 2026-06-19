import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'msaGrid',
  title: 'כרטיסי מ.ס.ע',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      title: 'כרטיסים',
      type: 'array',
      validation: (Rule) => Rule.max(3).warning('מומלץ 3 שלבים'),
      of: [
        {
          name: 'msaCard',
          title: 'כרטיס',
          type: 'object',
          fields: [
            {name: 'letter', title: 'אות', type: 'string'},
            {name: 'title', title: 'כותרת', type: 'string'},
            {name: 'subtitle', title: 'כותרת משנה', type: 'string'},
            {name: 'text', title: 'טקסט', type: 'text', rows: 3},
          ],
        },
      ],
    }),
  ],
})
