import { defineField, defineType } from "sanity"

export default defineType({
  name: "testimonial",
  title: "Customer Testimonials",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Reviewer Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      title: "Reviewer Role / Subtitle",
      type: "string",
      description: 'e.g. "Interior Designer", "Home Owner in Nairobi"',
    }),
    defineField({
      name: "review",
      title: "Review Content",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "rating",
      title: "Rating (Stars)",
      type: "number",
      initialValue: 5,
      validation: (Rule) => Rule.min(1).max(5).integer(),
    }),
    defineField({
      name: "avatar",
      title: "Avatar Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
  ],
})
