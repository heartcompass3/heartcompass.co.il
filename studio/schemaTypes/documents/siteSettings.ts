// studio2/schemaTypes/documents/siteSettings.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'הגדרות אתר',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'שם מסמך',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    // פרטי יצירת קשר
    defineField({
      name: 'contact',
      title: 'פרטי יצירת קשר',
      type: 'object',
      fields: [
        defineField({
          name: 'email',
          title: 'מייל',
          type: 'string',
        }),
      ],
    }),

    // ניווט
    defineField({
      name: 'nav',
      title: 'תפריט',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'navItem',
          title: 'פריט תפריט',
          fields: [
            { name: 'label', title: 'טקסט', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'href', title: 'קישור', type: 'string', validation: (Rule) => Rule.required() },
            {
              name: 'children',
              title: 'תתי קישורים',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'navChild',
                  title: 'תת קישור',
                  fields: [
                    { name: 'label', title: 'טקסט', type: 'string', validation: (Rule) => Rule.required() },
                    { name: 'href', title: 'קישור', type: 'string', validation: (Rule) => Rule.required() },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),

    // פוטר
    defineField({
      name: 'footerLinks',
      title: 'קישורי פוטר',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'footerLink',
          title: 'קישור',
          fields: [
            { name: 'label', title: 'טקסט', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'href', title: 'קישור', type: 'string', validation: (Rule) => Rule.required() },
          ],
        },
      ],
    }),

    // רשתות
    defineField({
      name: 'socials',
      title: 'רשתות חברתיות',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'socialLink',
          title: 'רשת',
          fields: [
            { name: 'label', title: 'שם', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'href', title: 'קישור', type: 'string', validation: (Rule) => Rule.required() },
            {
              name: 'icon',
              title: 'אייקון',
              type: 'string',
              options: {
                list: [
                  { title: 'instagram', value: 'instagram' },
                  { title: 'facebook', value: 'facebook' },
                  { title: 'linkedin', value: 'linkedin' },
                  { title: 'blog', value: 'blog' },
                  { title: 'whatsapp', value: 'whatsapp' },
                ],
              },
            },
          ],
        },
      ],
    }),

    // וואטסאפ
    defineField({
      name: 'whatsapp',
      title: 'וואטסאפ',
      type: 'object',
      fields: [
        { name: 'label', title: 'טקסט', type: 'string' },
        { name: 'href', title: 'קישור', type: 'string' },
      ],
    }),

    // שאלות חימום
    defineField({
      name: 'whatsappWarmups',
      title: 'שאלות חימום לוואטסאפ',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'warmup',
          title: 'שאלה',
          fields: [
            { name: 'label', title: 'כותרת קצרה', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'message', title: 'הודעה מוכנה', type: 'text', rows: 3, validation: (Rule) => Rule.required() },
          ],
        },
      ],
    }),

    // Tracking
    defineField({
      name: 'tracking',
      title: 'Tracking (Analytics + Pixels)',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'הפעלת טראקינג',
          type: 'boolean',
          initialValue: false,
          description: 'כשהשדה כבוי – לא נטען שום פיקסל/אנליטיקס באתר.',
        }),
        defineField({
          name: 'gaMeasurementId',
          title: 'Google Analytics (GA4) Measurement ID',
          type: 'string',
          description: 'דוגמה: G-XXXXXXXXXX',
        }),
        defineField({
          name: 'metaPixelId',
          title: 'Meta Pixel ID',
          type: 'string',
          description: 'מספר פיקסל של פייסבוק',
        }),
        defineField({
          name: 'tiktokPixelId',
          title: 'TikTok Pixel ID',
          type: 'string',
        }),
      ],
    }),
  ],
})
