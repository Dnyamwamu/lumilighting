import React from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

export default function ReturnPolicyPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-grow px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-10 border-b border-border/60 pb-8">
            <span className="mb-2 block text-xs font-bold tracking-wider text-amber-500 uppercase">
              Customer Support
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Return & Refund Policy
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Last Updated: June 26, 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate dark:prose-invert prose-headings:font-bold prose-a:text-amber-500 hover:prose-a:text-amber-600 max-w-none transition-colors">
            <p className="lead">
              At LUMI Lighting, we stand behind the quality of our premium lighting products. If you are not entirely satisfied with your purchase, we are here to help you resolve any issues with a straightforward return and exchange process.
            </p>

            <h2>1. Return & Exchange Window</h2>
            <p>
              You have <strong>7 calendar days</strong> from the date of purchase (for showroom collections) or delivery (for shipped orders) to request a return or exchange.
            </p>

            <h2>2. Eligibility Criteria</h2>
            <p>
              To qualify for a return, replacement, or store credit refund, products must meet the following criteria:
            </p>
            <ul>
              <li>The item must be unused, uninstalled, and in the same pristine condition that you received it.</li>
              <li>The item must be in its original packaging (including all inner protective foams, manuals, brackets, and accessories).</li>
              <li>You must present a valid proof of purchase (such as a showroom receipt, invoice, or digital order number).</li>
            </ul>

            <h2>3. Non-Returnable Items</h2>
            <p>
              Certain items are excluded from returns and refunds:
            </p>
            <ul>
              <li>Custom orders, customized lengths of LED strip lights, or wires that have been cut to specifications.</li>
              <li>Products that show clear signs of installation, usage, or modifications (e.g., painted fixtures, cut wires).</li>
              <li>Clearance or sale items explicitly marked as non-returnable.</li>
            </ul>

            <h2>4. Defective, Damaged, or Incorrect Items</h2>
            <p>
              We highly recommend inspecting all fixtures immediately upon pickup or delivery.
            </p>
            <ul>
              <li><strong>Reporting Window</strong>: Any transit damage, glass breakage, or incorrect items must be reported within <strong>24 hours</strong> of delivery.</li>
              <li><strong>Resolution</strong>: We will replace or repair the damaged item at no additional charge. For items requiring specialized testing, our technical team will inspect the item at our showroom to confirm the warranty claim.</li>
            </ul>

            <h2>5. Refund Options</h2>
            <p>
              Once your return is received and inspected at our showroom:
            </p>
            <ul>
              <li><strong>Store Credit (Default)</strong>: We will issue a digital coupon or store credit equivalent to the product purchase price. This can be used for any future purchases.</li>
              <li><strong>Refunds</strong>: If a refund is approved, it will be processed to your original payment method (e.g., M-Pesa). Please note that delivery shipping charges are non-refundable, and return shipping is at the buyer&apos;s expense unless the item was defective.</li>
            </ul>

            <h2>6. Return Address & Support</h2>
            <p>
              To initiate a return, please contact our customer service hotline or visit our showroom:
            </p>
            <address className="rounded-lg border border-border/40 bg-muted/40 p-4 not-italic">
              <strong>LUMI Showroom</strong>
              <br />
              14 Kijabe Street, Nairobi, Kenya
              <br />
              Phone:{" "}
              <a href="tel:+254706504644">
                +254 706 504 644
              </a>
              <br />
              Email:{" "}
              <a href="mailto:info@lumilighting.co.ke">
                info@lumilighting.co.ke
              </a>
            </address>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
