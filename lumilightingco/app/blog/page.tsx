import React from "react"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Clock, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { sanityService } from "@/lib/sanity"
import { urlFor } from "@/sanity/lib/image"

export default async function BlogPage() {
  const sanityPosts = await sanityService.getBlogPosts().catch((err) => {
    console.error("Failed to fetch blog posts from Sanity:", err)
    return []
  })

  const posts =
    sanityPosts.length > 0
      ? sanityPosts.map((post) => ({
          id: post._id,
          title: post.title,
          slug: post.slug?.current || "",
          excerpt: post.excerpt,
          image: post.coverImage
            ? urlFor(post.coverImage).url()
            : "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=600",
          category: post.category || "Lighting Tips",
          readTime: `${post.readTime || 5} min read`,
          publishedAt: new Date(
            post.publishedAt || post._createdAt || "2026-06-15T10:00:00Z"
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        }))
      : [
          {
            id: "post-1",
            title: "How to Choose the Right LED Panel Wattage for Your Office",
            slug: "choose-right-led-panel-wattage",
            excerpt:
              "Luminous density makes a massive difference in workspace productivity. Learn how to map office dimensions to panel counts.",
            image:
              "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=600",
            category: "Lighting Tips",
            readTime: "6 min read",
            publishedAt: "June 08, 2026",
          },
          {
            id: "post-2",
            title:
              "Vintage vs Modern: Chandelier Styling Guidelines for Living Rooms",
            slug: "vintage-vs-modern-chandelier-styling",
            excerpt:
              "Chandeliers are the focal point of residential ceilings. Discover K9 crystal and matte gold layout styling parameters.",
            image:
              "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=600",
            category: "Interior Design",
            readTime: "8 min read",
            publishedAt: "June 03, 2026",
          },
          {
            id: "post-3",
            title:
              "Understanding IP Ratings for Outdoor Floodlights and Spotlights",
            slug: "understanding-ip-ratings-outdoor-floodlights",
            excerpt:
              "Don't let rain destroy your security lights. We break down the differences between IP44, IP65, and IP66 waterproof housings.",
            image:
              "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=600",
            category: "Product Guides",
            readTime: "4 min read",
            publishedAt: "May 28, 2026",
          },
        ]

  const featuredPost = posts[0]
  const otherPosts = posts.slice(1)

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="block text-xs font-bold tracking-wider text-amber-500 uppercase">
            LUMI Magazine
          </span>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Lighting Tips & Design Guides
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Get expert advice on room aesthetics, lumen guidelines, smart home
            switches, and industrial lighting setups.
          </p>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16 items-center gap-8 overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md lg:grid lg:grid-cols-2">
            <div className="relative aspect-video bg-muted lg:aspect-square">
              <Image
                src={featuredPost.image}
                alt={featuredPost.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-4 p-8">
              <span className="rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-bold tracking-wider text-amber-500 uppercase">
                {featuredPost.category}
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight transition-colors hover:text-primary">
                <Link href={`/blog/${featuredPost.slug}`}>
                  {featuredPost.title}
                </Link>
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {featuredPost.excerpt}
              </p>

              <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> {featuredPost.publishedAt}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {featuredPost.readTime}
                </span>
              </div>

              <div className="pt-4">
                <Link href={`/blog/${featuredPost.slug}`}>
                  <Button className="cursor-pointer gap-2 bg-slate-900 text-xs font-bold text-white hover:bg-slate-800">
                    Read Article <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {otherPosts.length > 0 && (
          <div className="grid grid-cols-1 gap-8 border-t border-border/60 pt-8 md:grid-cols-3">
            {otherPosts.map((post) => (
              <div
                key={post.id}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-xs transition-all hover:border-amber-500/30"
              >
                <div className="relative aspect-video shrink-0 bg-muted">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-grow flex-col space-y-3 p-5">
                  <span className="block text-[10px] font-bold tracking-wider text-amber-500 uppercase">
                    {post.category}
                  </span>
                  <h3 className="line-clamp-2 text-base leading-snug font-bold transition-colors hover:text-primary">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="line-clamp-3 flex-grow text-xs leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center gap-4 border-t border-border/40 pt-4 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {post.publishedAt}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {post.readTime}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
