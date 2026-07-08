import React from "react"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ChevronRight, ArrowLeft } from "lucide-react"
import { sanityService } from "@/lib/sanity"
import { urlFor } from "@/sanity/lib/image"
import { type SanityImageSource } from "@sanity/image-url"

interface Props {
  params: Promise<{ slug: string }>
}

const MOCK_POSTS = [
  {
    title: "How to Choose the Right LED Panel Wattage for Your Office",
    slug: "choose-right-led-panel-wattage",
    excerpt:
      "Luminous density makes a massive difference in workspace productivity. Learn how to map office dimensions to panel counts.",
    image:
      "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=1200",
    category: "Lighting Tips",
    readTime: "6 min read",
    publishedAt: "June 08, 2026",
    content: [
      "Lighting plays an incredibly vital role in workplace ergonomics. An office that is too dim causes eye strain and lethargy, while lighting that is overly bright can trigger headaches and screen glare. Finding the perfect middle ground depends on choosing the correct LED panel wattage.",
      "Generally, commercial spaces should aim for around 300 to 500 Lux at desktop levels. Lux measures luminous flux per unit area. In terms of LED panels, this can be easily translated by using our Room Lighting Calculator or checking total lumens. A standard 18W LED panel yields approximately 1,600 lumens.",
      "To calculate: if your workspace is 10 meters long and 6 meters wide, your total area is 60 square meters. Multiplying this by the target 400 Lux yields a total requirement of 24,000 Lumens. Dividing 24,000 by the 1,600 Lumens output of an 18W panel results in exactly 15 panels distributed uniformly across your ceiling grid.",
      "Always purchase panel lights featuring high-quality external drivers. External drivers protect the light panel itself from fluctuating voltage currents, which are common in industrial and commercial grids, ensuring your office lights operate for the full promised 30,000 hours.",
    ],
  },
  {
    title: "Vintage vs Modern: Chandelier Styling Guidelines for Living Rooms",
    slug: "vintage-vs-modern-chandelier-styling",
    excerpt:
      "Chandeliers are the focal point of residential ceilings. Discover K9 crystal and matte gold layout styling parameters.",
    image:
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=1200",
    category: "Interior Design",
    readTime: "8 min read",
    publishedAt: "June 03, 2026",
    content: [
      "Chandeliers are more than simple light fixtures; they are statement pieces that define the character of a room. Whether you are styling a contemporary loft in Westlands or a rustic home in Karen, deciding between a vintage filament chandelier and a modern K9 crystal pendant dictates the visual weight of your living room.",
      "Vintage chandeliers usually employ exposed Edison-style filament bulbs, finished iron frames, or distressed wood beams. They radiate warmth (typically around 2200K color temperature), establishing a cozy, intimate environment. They blend beautifully with industrial brick, leather couches, and warm color palettes.",
      "Modern chandeliers, conversely, focus on polished finishes, geometric minimalism, and K9 crystal arrays. K9 crystals refract light across the room, projecting diamond-like sparkles that suggest clean luxury. These fixtures operate best in dining spaces and double-height entryways, paired with cooler color profiles and glass tables.",
      "Whichever style you choose, pay close attention to hanging height. The bottom of the chandelier should hang no lower than 75cm to 90cm above table surfaces, or 2.1 meters above the floor in high-traffic walking corridors to prevent accidental contact.",
    ],
  },
]

export default async function BlogPostDetailPage({ params }: Props) {
  const { slug } = await params

  const post = await sanityService.getBlogPostBySlug(slug).catch((err) => {
    console.error(`Failed to fetch blog post for slug ${slug}:`, err)
    return null
  })

  let title, excerpt, category, readTime, publishedAt, imageUrl, contentNode

  if (post) {
    title = post.title
    excerpt = post.excerpt
    category = post.category || "Lighting Tips"
    readTime = `${post.readTime || 5} min read`
    publishedAt = new Date(
      post.publishedAt || post._createdAt || "2026-06-15T10:00:00Z"
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    imageUrl = post.coverImage
      ? urlFor(post.coverImage).url()
      : "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=1200"

    interface SanityBlock {
      _type: string
      _key?: string
      children?: { _type: string; text: string }[]
      alt?: string
    }

    const renderContent = (content: unknown[]) => {
      if (!content || !Array.isArray(content)) return null
      return content.map((rawBlock, idx: number) => {
        const block = rawBlock as SanityBlock
        if (block._type === "block") {
          const text = block.children?.map((c) => c.text).join("") || ""
          return <p key={idx}>{text}</p>
        }
        if (block._type === "image") {
          const url = urlFor(block as unknown as SanityImageSource).url()
          return (
            <div
              key={idx}
              className="relative my-6 aspect-video overflow-hidden rounded-2xl border border-border"
            >
              <Image
                src={url}
                alt={block.alt || "Blog image"}
                fill
                className="object-cover"
              />
            </div>
          )
        }
        return null
      })
    }
    contentNode = renderContent(post.content)
  } else {
    // Fallback to static post
    const mockPost = MOCK_POSTS.find((p) => p.slug === slug) || MOCK_POSTS[0]
    title = mockPost.title
    excerpt = mockPost.excerpt
    category = mockPost.category
    readTime = mockPost.readTime
    publishedAt = mockPost.publishedAt
    imageUrl = mockPost.image
    contentNode = mockPost.content.map((p, idx) => <p key={idx}>{p}</p>)
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-grow px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/blog" className="hover:text-primary">
            Blog
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-foreground">{title}</span>
        </div>

        {/* Title Header */}
        <article className="space-y-6">
          <header className="space-y-4">
            <span className="inline-block rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-bold tracking-wider text-amber-500 uppercase">
              {category}
            </span>
            <h1 className="text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
              {title}
            </h1>
            {excerpt && (
              <p className="text-base text-muted-foreground italic">
                {excerpt}
              </p>
            )}

            <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-amber-500" /> {publishedAt}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-amber-500" /> {readTime}
              </span>
            </div>
          </header>

          {/* Cover Image */}
          <div className="relative aspect-video overflow-hidden rounded-3xl border border-border bg-muted">
            <Image src={imageUrl} alt={title} fill className="object-cover" />
          </div>

          {/* Content paragraphs */}
          <div className="max-w-3xl space-y-6 pt-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {contentNode}
          </div>

          <div className="border-t border-border/60 pt-12">
            <Link href="/blog">
              <Button variant="outline" className="cursor-pointer gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Blog
              </Button>
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  )
}
