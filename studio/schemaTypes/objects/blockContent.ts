import { defineArrayMember, defineType } from "sanity";

export default defineType({
  name: "blockContent",
  title: "תוכן עשיר",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "טקסט", value: "normal" },
        { title: "כותרת (H2)", value: "h2" },
        { title: "כותרת (H3)", value: "h3" },
        { title: "ציטוט", value: "blockquote" },
      ],
      lists: [
        { title: "בולטים", value: "bullet" },
        { title: "ממוספר", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "מודגש", value: "strong" },
          { title: "נטוי", value: "em" },
          { title: "קו תחתון", value: "underline" },
        ],
        annotations: [
          {
            name: "link",
            title: "לינק",
            type: "object",
            fields: [
              { name: "href", title: "כתובת", type: "url" },
              { name: "blank", title: "פתיחה בטאב חדש", type: "boolean", initialValue: true },
            ],
          },
        ],
      },
    }),

    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          title: "טקסט חלופי (Alt)",
          type: "string",
          description: "חשוב לנגישות ול-SEO",
          validation: (Rule) => Rule.required(),
        },
      ],
    }),
  ],
});
