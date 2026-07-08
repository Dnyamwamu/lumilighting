import { defineField, defineType } from "sanity"

export default defineType({
  name: "faq",
  title: "FAQs",
  type: "document",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description: 'e.g. "Shipping", "M-Pesa", "Warranty", "Lighting Advice"',
      initialValue: "General",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
    }),
  ],
})
