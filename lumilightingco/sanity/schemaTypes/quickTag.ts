import { defineField, defineType } from "sanity"

export default defineType({
  name: "quickTag",
  title: "Quick Tags",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Display Title (e.g. Best Sellers)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tagValue",
      title: "Medusa Tag Value (e.g. Best Seller)",
      description: "Must match the exact tag value in Medusa (case-sensitive)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon or Emoji (e.g. 🔥 or ★)",
      type: "string",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      initialValue: 0,
    }),
  ],
})
