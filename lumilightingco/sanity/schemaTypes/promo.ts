import { defineField, defineType } from "sanity"

export default defineType({
  name: "promo",
  title: "Promotional Banners",
  type: "document",
  fields: [
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "badge",
      title: "Promo Badge/Tag",
      type: "string",
      description: 'e.g. "Limited Offer", "New Arrival", "20% OFF"',
    }),
    defineField({
      name: "image",
      title: "Promo Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "ctaText",
      title: "CTA Text",
      type: "string",
      initialValue: "View Deals",
    }),
    defineField({
      name: "ctaLink",
      title: "CTA Link",
      type: "string",
    }),
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      initialValue: true,
    }),
  ],
})
