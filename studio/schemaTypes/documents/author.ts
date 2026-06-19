import { defineField, defineType } from "sanity";

export default defineType({
  name: "author",
  title: "מחבר",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "שם",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "תמונה",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "bio",
      title: "ביו קצר",
      type: "blockContent",
    }),
  ],
  preview: {
    select: { title: "name", media: "image" },
  },
});
