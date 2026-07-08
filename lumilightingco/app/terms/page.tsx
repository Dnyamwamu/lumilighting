import React from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

export default function TermsPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-grow px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-10 border-b border-border/60 pb-8">
            <span className="mb-2 block text-xs font-bold tracking-wider text-amber-500 uppercase">
              Legal Agreements
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Last Updated: June 10, 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate dark:prose-invert prose-headings:font-bold prose-a:text-amber-500 hover:prose-a:text-amber-600 max-w-none transition-colors">
            <p className="lead">
              Welcome to LUMI Lighting. These Terms of Service (&quot;Terms&quot;) govern
              your access to and use of our e-commerce platform, showroom
              bookings, and related services in Kenya.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, or placing an order through our storefront
              at <code>localhost:3000</code>, you agree to comply with and be
              bound by these Terms and our Privacy Policy. If you do not agree,
              please discontinue use of our site.
            </p>

            <h2>2. Accounts and Authentication</h2>
            <p>
              We use Clerk to manage secure customer authentication and
              profiles. When registering, you agree to provide accurate,
              current, and complete registration information. You are solely
              responsible for maintaining the confidentiality of your account
              credentials.
            </p>

            <h2>3. Product Information and Pricing</h2>
            <p>
              LUMI Lighting. offers architectural lighting fixtures and
              accessories. All prices listed on the platform are in{" "}
              <strong>Kenyan Shillings (KES)</strong>. We make every effort to
              display correct product details, specifications, and availability,
              but we reserve the right to correct errors or cancel orders
              resulting from inadvertent pricing mistakes.
            </p>

            <h2>4. Payment Terms & Security</h2>
            <p>
              We accept payments via M-Pesa (via automated STK Push
              integration), credit/debit cards, and payment links. All card
              transactions are processed securely through certified payment
              gateways. Goods will only be dispatched or released for pickup
              upon receipt of cleared funds.
            </p>

            <h2>5. Fulfillments and Deliveries</h2>
            <p>
              Our primary stock location is the{" "}
              <strong>LUMI Lighting Showroom</strong> in 14 Kijabe Street, Nairobi. Delivery
              options include:
            </p>
            <ul>
              <li>
                <strong>Nairobi Standard Delivery</strong>: 1-2 business days.
              </li>
              <li>
                <strong>Upcountry / Regional Delivery</strong>: 2-3 business
                days.
              </li>
              <li>
                <strong>Showroom Pickup</strong>: Available at our 14 Kijabe Street, Nairobi
                showroom during operational hours.
              </li>
            </ul>

            <h2>6. Returns, Exchanges, and Warranties</h2>
            <p>
              Most premium fixtures are backed by our showroom warranty
              (typically 1 to 2 years, as indicated on the product detail page).
              Returns and exchanges are accepted within 7 days of delivery for
              unused, boxed merchandise, subject to inspection. Custom
              installations and customized LED strip cutouts are non-refundable.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              For any questions regarding these Terms, please contact our
              showroom:
            </p>
            <address className="rounded-lg border border-border/40 bg-muted/40 p-4 not-italic">
              <strong>LUMI Lighting.</strong>
              <br />
              14 Kijabe Street, Nairobi
              <br />
              Nairobi, Kenya
              <br />
              Email:{" "}
              <a href="mailto:info@lumilighting.co.ke">
                info@lumilighting.co.ke
              </a>
              <br />
              Phone: <a href="tel: +254706504644"> +254 706 504 644</a>
            </address>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
