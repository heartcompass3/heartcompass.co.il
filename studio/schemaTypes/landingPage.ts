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
      of: [{
        type: 'block',
        styles: [
          { title: 'טקסט', value: 'normal' },
          { title: 'כותרת (H2)', value: 'h2' },
          { title: 'כותרת (H3)', value: 'h3' },
          { title: 'ציטוט', value: 'blockquote' },
        ],
      }]
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
          { title: '🧭 כלי מעשי', value: 'interactive' },
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
      title: 'קישור לכלי (אפליקציה חיצונית)',
      type: 'url',
      group: 'tools',
      description:
        'הקישור לכלי עצמו. אם לדף יש תוכן – הכרטיס ב-/tools יוביל קודם לדף הנחיתה, וכפתור ה-CTA בדף יפתח את הקישור הזה. אם אין תוכן – הכרטיס יפנה ישירות לכאן.',
    },
    {
      name: 'internalToolPath',
      title: 'כתובת של כלי פנימי באתר',
      type: 'string',
      group: 'tools',
      description:
        'לכלי שנבנה בתוך האתר. להתחיל ב־/ למשל /tools/parent-moment. כשיש כתובת כאן, הכרטיס בדף הכלים יפנה אליה.',
      validation: (Rule: any) =>
        Rule.custom((value: string | undefined) =>
          !value || value.startsWith('/') ? true : 'הכתובת חייבת להתחיל ב־/'
        ),
    },
    {
      name: 'directToTool',
      title: 'דילוג על דף הנחיתה (ישר לכלי)',
      type: 'boolean',
      group: 'tools',
      initialValue: false,
      description:
        'להשאיר כבוי כברירת מחדל. הדלקה תגרום לכרטיס ב-/tools לקפוץ ישירות לקישור החיצוני גם כשיש דף נחיתה.',
    },
    {
      name: 'toolOrder',
      title: 'סדר הצגה בדף הכלים',
      type: 'number',
      group: 'tools',
      description: '1 = ראשון. מספר נמוך = מופיע קודם.',
      initialValue: 10,
    },
    {
      name: 'interactiveTool',
      title: 'תוכן לכלי המעשי',
      type: 'object',
      group: 'tools',
      description: 'ממלאים רק לכלי פנימי אינטראקטיבי. כל הטקסט שמוצג לגולש נשלט מכאן.',
      fields: [
        {
          name: 'eyebrow',
          title: 'כותרת קטנה מעל הכלי',
          type: 'string',
        },
        {
          name: 'firstQuestion',
          title: 'שאלה ראשונה',
          type: 'string',
        },
        {
          name: 'firstOptions',
          title: 'אפשרויות לשאלה הראשונה',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'interactiveOption',
              fields: [
                { name: 'key', title: 'מזהה פנימי באנגלית', type: 'string', validation: (Rule: any) => Rule.required() },
                { name: 'label', title: 'טקסט שמופיע לגולש', type: 'string', validation: (Rule: any) => Rule.required() },
              ],
              preview: { select: { title: 'label' } },
            },
          ],
        },
        {
          name: 'secondQuestion',
          title: 'שאלה שנייה',
          type: 'string',
        },
        {
          name: 'secondOptions',
          title: 'אפשרויות לשאלה השנייה',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'interactiveResponseOption',
              fields: [
                { name: 'key', title: 'מזהה פנימי באנגלית', type: 'string', validation: (Rule: any) => Rule.required() },
                { name: 'label', title: 'טקסט שמופיע לגולש', type: 'string', validation: (Rule: any) => Rule.required() },
              ],
              preview: { select: { title: 'label' } },
            },
          ],
        },
        {
          name: 'results',
          title: 'תוצאות לפי התגובה של ההורה',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'interactiveResult',
              fields: [
                { name: 'key', title: 'מזהה שמתחבר לאפשרות השנייה', type: 'string', validation: (Rule: any) => Rule.required() },
                { name: 'title', title: 'כותרת התוצאה', type: 'string', validation: (Rule: any) => Rule.required() },
                { name: 'text', title: 'הסבר קצר', type: 'text', rows: 3, validation: (Rule: any) => Rule.required() },
                { name: 'nextStep', title: 'צעד קטן לרגע הבא', type: 'text', rows: 3, validation: (Rule: any) => Rule.required() },
                { name: 'phrase', title: 'משפט שאפשר לומר', type: 'string', validation: (Rule: any) => Rule.required() },
              ],
              preview: { select: { title: 'title' } },
            },
          ],
        },
        {
          name: 'safetyTitle',
          title: 'כותרת הבהרה מקצועית',
          type: 'string',
        },
        {
          name: 'safetyText',
          title: 'טקסט הבהרה מקצועית',
          type: 'text',
          rows: 3,
        },
      ],
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
