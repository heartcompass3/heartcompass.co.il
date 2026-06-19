import {defineType, defineField, defineArrayMember} from 'sanity'

export default defineType({
  name: 'richText',
  title: 'תוכן עומק',
  type: 'object',
  fields: [
    defineField({
      name: 'content',
      title: 'טקסט',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
              {title: 'Underline', value: 'underline'},
              {title: 'Highlight', value: 'highlight'},
            ],
            annotations: [
              {
                name: 'link',
                title: 'Link',
                type: 'object',
                fields: [
                  defineField({name: 'href', title: 'URL', type: 'url'}),
                  defineField({
                    name: 'blank',
                    title: 'Open in new tab',
                    type: 'boolean',
                    initialValue: true,
                  }),
                ],
              },
            ],
          },
        }),

        // אופציונלי: "רווח" בתוך אותו שדה, בלי לפצל בלוקים בדף
        defineArrayMember({
          name: 'spacer',
          title: 'רווח',
          type: 'object',
          fields: [
            defineField({
              name: 'size',
              title: 'גודל רווח',
              type: 'string',
              options: {
                list: [
                  {title: 'קטן', value: 'sm'},
                  {title: 'בינוני', value: 'md'},
                  {title: 'גדול', value: 'lg'},
                ],
                layout: 'radio',
              },
              initialValue: 'md',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {size: 'size'},
            prepare({size}) {
              const label =
                size === 'sm' ? 'רווח קטן' : size === 'lg' ? 'רווח גדול' : 'רווח בינוני'
              return {title: label}
            },
          },
        }),
      ],
    }),
  ],
})
