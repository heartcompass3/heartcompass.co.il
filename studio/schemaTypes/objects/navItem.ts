import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'navItem',
  title: 'פריט ניווט',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'טקסט בתפריט',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'href',
      title: 'קישור',
      type: 'string',
      description: 'לדוגמה: /about או /services/couple. לפריט אב אפשר להשאיר ריק.',
    }),
    defineField({
      name: 'children',
      title: 'תתי פריטים',
      type: 'array',
      of: [{ type: 'navItem' }],
      description: 'פריטים שיופיעו מתחת לפריט זה בתפריט',
    }),
  ],
})
