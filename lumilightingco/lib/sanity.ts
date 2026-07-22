import { client } from "@/sanity/lib/client"
import { type SanityImageSource } from "@sanity/image-url"

export interface HeroSlide {
  _id: string
  title: string
  subtitle?: string
  backgroundImage: SanityImageSource
  ctaText?: string
  ctaLink?: string
}

export interface PromoBanner {
  _id: string
  headline: string
  description?: string
  badge?: string
  image?: SanityImageSource
  ctaText?: string
  ctaLink?: string
  isActive: boolean
}

export interface Testimonial {
  _id: string
  name: string
  role?: string
  review: string
  rating: number
  avatar?: SanityImageSource
}

export interface FAQ {
  _id: string
  question: string
  answer: string
  category: string
}

export interface BlogPost {
  _id: string
  _createdAt?: string
  title: string
  slug: { current: string }
  coverImage: SanityImageSource
  excerpt: string
  content: unknown[]
  publishedAt: string
  category: string
  readTime: number
}

export interface AboutContent {
  _id: string
  title: string
  description: string
  mission: string
  vision: string
  heroImage?: SanityImageSource
  features?: { title: string; description: string }[]
}

export interface QuickTag {
  _id: string
  title: string
  tagValue: string
  icon?: string
}

export const sanityService = {
  async getQuickTags(): Promise<QuickTag[]> {
    return client.fetch(
      `*[_type == "quickTag"] | order(order asc) {
        _id,
        title,
        tagValue,
        icon
      }`
    )
  },

  async getHeroes(): Promise<HeroSlide[]> {
    return client.fetch(
      `*[_type == "hero"] | order(order asc) {
        _id,
        title,
        subtitle,
        backgroundImage,
        ctaText,
        ctaLink
      }`
    )
  },

  async getPromos(): Promise<PromoBanner[]> {
    return client.fetch(
      `*[_type == "promo" && isActive == true] {
        _id,
        headline,
        description,
        badge,
        image,
        ctaText,
        ctaLink
      }`
    )
  },

  async getTestimonials(): Promise<Testimonial[]> {
    return client.fetch(
      `*[_type == "testimonial"] {
        _id,
        name,
        role,
        review,
        rating,
        avatar
      }`
    )
  },

  async getFAQs(): Promise<FAQ[]> {
    return client.fetch(
      `*[_type == "faq"] | order(order asc) {
        _id,
        question,
        answer,
        category
      }`
    )
  },

  async getBlogPosts(): Promise<BlogPost[]> {
    return client.fetch(
      `*[_type == "blog"] | order(publishedAt desc) {
        _id,
        _createdAt,
        title,
        slug,
        coverImage,
        excerpt,
        publishedAt,
        category,
        readTime
      }`
    )
  },

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    if (!slug) {
      return null
    }
    return client.fetch(
      `*[_type == "blog" && slug.current == $slug][0] {
        _id,
        _createdAt,
        title,
        slug,
        coverImage,
        excerpt,
        content,
        publishedAt,
        category,
        readTime
      }`,
      { slug }
    )
  },

  async getAboutContent(): Promise<AboutContent | null> {
    return client.fetch(
      `*[_type == "about"][0] {
        _id,
        title,
        description,
        mission,
        vision,
        heroImage,
        features
      }`
    )
  },
}
