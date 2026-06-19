import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'faq',
  title: 'שאלות נפוצות',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      title: 'שאלות',
      type: 'array',
      of: [
        {
          name: 'qa',
          title: 'שאלה ותשובה',
          type: 'object',
          fields: [
            {name: 'question', title: 'שאלה', type: 'string'},
            {name: 'answer', title: 'תשובה', type: 'text'},
          ],
        },
      ],
    }),
  ],
})
