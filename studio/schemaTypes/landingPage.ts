export default {
  name: 'landingPage',
  title: 'Landing Page / כלי',
  type: 'document',
  groups: [
    { name: 'content', title: 'תוכן הדף', default: true },
    { name: 'form', title: 'טופס וליד' },
    { name: 'tools', title: '🧰 הגדרות כלי (/tools)' },
  ],
  fields: [
    {
      name: 'title',
      title: 'כותרת ראשית',
      type: 'string',
      group: 'content',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'כתובת הדף',
      type: 'slug',
      group: 'content',
      description: 'הכתובת של הדף באתר למשל human-os-guide חובה באנגלית וללא רווחים',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'subtitle',
      title: 'תת כותרת',
      type: 'text',
      group: 'content',
    },
    {
      name: 'mainImage',
      title: 'תמונה ראשית',
      type: 'image',
      group: 'content',
      options: {
        hotspot: true
      }
    },
    {
      name: 'bullets',
      title: 'נקודות',
      type: 'array',
      group: 'content',
      of: [{ type: 'string' }],
      description: 'הנקודות שמתארות את הכאב והפתרון'
    },
    {
      name: 'content',
      title: 'תוכן',
      type: 'array',
      group: 'content',
      of: [{ type: 'block' }]
    },
    {
      name: 'seoDescription',
      title: 'תקציר לשיתופים',
      type: 'text',
      group: 'content',
      rows: 3,
      description: 'הטקסט הקצר שיופיע כשישתפו את הקישור בוואטסאפ או בפייסבוק מומלץ עד 160 תווים'
    },

    // ── שאלות נפוצות (אופציונלי) ───────────────────────────
    {
      name: 'faqItems',
      title: 'שאלות נפוצות (FAQ)',
      type: 'array',
      group: 'content',
      description:
        'שאלות שיופיעו בתחתית דף הנחיתה ויקבלו Schema אוטומטי ב-Google (Rich Snippets). אופציונלי — אם ריק, לא יופיע.',
      of: [
        {
          name: 'qa',
          title: 'שאלה ותשובה',
          type: 'object',
          fields: [
            {
              name: 'question',
              title: 'שאלה',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'answer',
              title: 'תשובה',
              type: 'text',
              rows: 4,
              validation: (Rule: any) => Rule.required(),
            },
          ],
          preview: {
            select: { title: 'question' },
          },
        },
      ],
    },

    // ── טופס ──────────────────────────────────────────────
    {
      name: 'cta',
      title: 'טקסט כפתור',
      type: 'string',
      group: 'form',
      description: 'למשל שלח לי את המדריך עכשיו'
    },
    {
      name: 'trustText',
      title: 'טקסט הרגעה מתחת לכפתור',
      type: 'string',
      group: 'form',
      description: 'משפט קצר שמשדר ביטחון ללקוח',
      initialValue: 'הפרטים שלך בטוחים מבטיח לא לשלוח ספאם'
    },
    {
      name: 'newsletterConsent',
      title: 'הצגת שורת הסכמה לדיוור',
      type: 'boolean',
      group: 'form',
      description: 'האם להציג תיבת סימון להצטרפות לרשימת תפוצה',
      initialValue: true
    },
    {
      name: 'newsletterConsentText',
      title: 'טקסט הסכמה לדיוור',
      type: 'string',
      group: 'form',
      description: 'הטקסט שיופיע לצד תיבת הסימון',
      initialValue: 'אני מאשר לקבל תובנות וכלים שיעזרו לי להבין את השומר הפנימי שלי'
    },
    {
      name: 'leadMagnet',
      title: 'קובץ המדריך',
      type: 'file',
      group: 'form',
      description: 'העלה לכאן את קובץ המדריך שהגולש יקבל בדף התודה'
    },

    // ── כלים (/tools) ──────────────────────────────────────
    {
      name: 'toolCategory',
      title: 'קטגוריית כלי',
      type: 'string',
      group: 'tools',
      description: 'שיוך הכלי לדף /tools. השאר ריק אם זה רק דף נחיתה רגיל.',
      options: {
        list: [
          { title: '📖 מדריך', value: 'guide' },
          { title: '🧩 שאלון אבחון', value: 'quiz' },
          { title: '🎮 משחק', value: 'game' },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'toolTagline',
      title: 'תיאור קצר לכרטיס',
      type: 'string',
      group: 'tools',
      description: 'משפט אחד שמסביר מה הכלי עושה – מופיע בכרטיס בדף /tools.',
    },
    {
      name: 'externalUrl',
      title: 'קישור חיצוני',
      type: 'url',
      group: 'tools',
      description: 'אם הכלי נמצא מחוץ לאתר (base44, אפליקציה...) – הכרטיס יפנה לכאן.',
    },
    {
      name: 'toolOrder',
      title: 'סדר הצגה בדף הכלים',
      type: 'number',
      group: 'tools',
      description: '1 = ראשון. מספר נמוך = מופיע קודם.',
      initialValue: 10,
    },
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'toolCategory',
      media: 'mainImage',
    },
    prepare({ title, subtitle, media }) {
      const icons = { guide: '📖', quiz: '🧩', game: '🎮' }
      return {
        title,
        subtitle: subtitle ? `${icons[subtitle] ?? ''} ${subtitle}` : 'דף נחיתה',
        media,
      }
    },
  },
}
