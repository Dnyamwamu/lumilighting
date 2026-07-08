import { defineField, defineType } from "sanity"

export default defineType({
  name: "about",
  title: "About Page Content",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Page Title",
      type: "string",
      initialValue: "About LUMI Lighting.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Company Description",
      type: "text",
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "mission",
      title: "Our Mission",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "vision",
      title: "Our Vision",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "features",
      title: "Why Choose Us Features",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", type: "string", title: "Feature Title" },
            { name: "description", type: "text", title: "Feature Description" },
          ],
        },
      ],
    }),
  ],
})
