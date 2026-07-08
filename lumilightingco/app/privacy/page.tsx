import React from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Last Updated: June 10, 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate dark:prose-invert prose-headings:font-bold prose-a:text-amber-500 hover:prose-a:text-amber-600 max-w-none transition-colors">
            <p className="lead">
              LUMI Lighting. respects your privacy and is committed to
              protecting the personal data you share with us. This Privacy
              Policy describes how we collect, use, and safeguard your data when
              using our storefront and services in Kenya.
            </p>

            <h2>1. Information We Collect</h2>
            <p>
              We collect information to process your orders and provide a
              personalized experience:
            </p>
            <ul>
              <li>
                <strong>Authentication Data</strong>: Provided securely when
                signing up or logging in through Clerk (name, email address).
              </li>
              <li>
                <strong>Order and Shipping Information</strong>: Shipping
                address (e.g. country, city, physical address), contact number,
                and cart choices.
              </li>
              <li>
                <strong>Payment Records</strong>: Transaction codes and payment
                confirmation metadata (e.g., M-Pesa Transaction ID). We do not
                store raw card numbers on our servers.
              </li>
              <li>
                <strong>Usage Information</strong>: Cookies and tracking
                technologies used to manage cart persistence (such as{" "}
                <code>_medusa_cart_id</code>).
              </li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>
              We process your personal information for the following purposes:
            </p>
            <ul>
              <li>To fulfill and manage orders, checkout, and payments.</li>
              <li>
                To persist and retrieve your active shopping cart across page
                reloads.
              </li>
              <li>
                To send order status updates, delivery alerts, and showroom
                notifications.
              </li>
              <li>
                To verify your identity and manage account access securely.
              </li>
            </ul>

            <h2>3. Information Sharing and Disclosure</h2>
            <p>
              We do not sell, rent, or trade your personal information. We only
              share information with third-party service providers who assist us
              in operating our business:
            </p>
            <ul>
              <li>
                <strong>Clerk</strong>: Auth provider handling identity
                management.
              </li>
              <li>
                <strong>Medusa Backend</strong>: Core database engine managing
                carts, customers, and order storage.
              </li>
              <li>
                <strong>Payment Processors</strong>: Processing transaction
                requests securely.
              </li>
              <li>
                <strong>Fulfillment Partners</strong>: Delivery couriers
                managing physical package delivery.
              </li>
            </ul>

            <h2>4. Data Retention and Security</h2>
            <p>
              We use standard encryption protocols (HTTPS/SSL) to protect all
              data during transmission. Your cart sessions are persisted using
              secure, HTTP-only cookies. We store customer profile and order
              data in our secure Medusa database.
            </p>

            <h2>5. Your Rights and Access</h2>
            <p>
              You have the right to request access to the personal data we hold
              about you, request corrections to out-of-date information, or
              request the deletion of your account. You can manage your profile
              settings directly through the authenticated dashboard.
            </p>

            <h2>6. Changes to this Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our operational procedures or compliance regulations.
              We will notify you of any major changes by updating the date at
              the top of this page.
            </p>

            <h2>7. Contact Support</h2>
            <p>
              For privacy-related questions or data deletion requests, please
              contact our support team:
            </p>
            <address className="rounded-lg border border-border/40 bg-muted/40 p-4 not-italic">
              <strong>LUMI Lighting.</strong>
              <br />
              14 Kijabe Street, Nairobi
              <br />
              Nairobi, Kenya
              <br />
              Email:{" "}
              <a href="mailto:privacy@lumilightingco.co.ke">
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
