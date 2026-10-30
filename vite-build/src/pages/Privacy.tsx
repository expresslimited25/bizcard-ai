import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

// ---------------------------------------------------------------------------
// EDIT THESE FOUR VALUES FIRST. They appear throughout the policy.
// ---------------------------------------------------------------------------
const COMPANY = "[Express Limited]";
const CONTACT_EMAIL = "[expresslimited25@gmail.com]";
const ADDRESS = "[Shah Alam, Selangor]";
const LAST_UPDATED = "[30 October 2026]";
const MIN_AGE = "21";
// ---------------------------------------------------------------------------

type Section = { title: string; paragraphs?: string[]; bullets?: string[]; after?: string[] };

const SECTIONS: Section[] = [
  {
    title: "Who we are",
    paragraphs: [
      `BizCard AI is a service operated by ${COMPANY} ("we", "us"). It lets business owners create a public business page with AI-written content, social links, bookings and a QR code. This policy explains what personal information we collect, why we collect it, and the choices you have.`,
      "By using BizCard AI you agree to the practices described here. If you do not agree, please do not use the service.",
    ],
  },
  {
    title: "Information we collect",
    paragraphs: ["We collect the following information, depending on how you use BizCard AI."],
    bullets: [
      "Account details. When you sign in with Google we receive your name, email address and profile picture.",
      "Business page content. Everything you enter while building your page, such as your business name, category, descriptions, logo, cover photo, contact details, social media links, brand colours, video link and booking settings.",
      "Visitor and customer details. When someone makes a booking on a business page, we collect the name, phone number, notes, date and time they submit.",
      "Billing details. Payments are handled by Stripe. We store your Stripe customer ID and subscription status. We do not see or store your full card number.",
      "Usage and technical data. We count views of each public page. Our hosting provider also records standard request data such as IP address, browser type and device information.",
    ],
  },
  {
    title: "How we use your information",
    bullets: [
      "To create your account and keep you signed in.",
      "To build, host and display your public business page.",
      "To generate headlines, taglines, bios and service descriptions with AI.",
      "To pass booking requests to the business you booked with.",
      "To manage subscriptions, process payments and send billing-related messages.",
      "To answer support requests and keep the service secure and working.",
      "To meet our legal obligations.",
    ],
  },
  {
    title: "AI-generated content",
    paragraphs: [
      "When you ask BizCard AI to write your page, the details you entered about your business (such as its name, category, descriptions, website and any extra details you add) are sent to Google's Gemini API, which returns the text.",
      "Please do not enter sensitive personal information in these fields. AI output can be inaccurate, so review and edit it before you publish. How Google handles the information it receives is covered by Google's own terms and privacy policy.",
    ],
  },
  {
    title: "What is public",
    paragraphs: [
      "When you publish a page, anyone with the link can see it. That includes your business name, descriptions, images, services, contact details and social links that you chose to add. Do not add anything to your page that you do not want to be public. You can unpublish your page at any time from your dashboard.",
    ],
  },
  {
    title: "Bookings and your customers' information",
    paragraphs: [
      "If you turn on bookings, you decide to collect information from your visitors. You are responsible for how you use that information and for following the privacy laws that apply to your business. We process it on your behalf only to show it to you in your dashboard and to operate the booking feature.",
      "We recommend telling your customers what you collect and why, for example on your own website or at the time of booking.",
    ],
  },
  {
    title: "Who we share information with",
    paragraphs: [
      "We do not sell your personal information. We share it only with the service providers that help us run BizCard AI, and only as needed for them to do their job:",
    ],
    bullets: [
      "Supabase, for our database, sign-in and file storage.",
      "Vercel, for hosting the website.",
      "Stripe, for subscription payments and billing.",
      "Google, for Google sign-in and the Gemini AI service.",
    ],
    after: [
      "We may also disclose information if the law requires it, to protect our rights or users' safety, or as part of a business sale or restructuring.",
    ],
  },
  {
    title: "Cookies and local storage",
    paragraphs: [
      "BizCard AI stores a sign-in session in your browser so you stay logged in. We do not currently use advertising or cross-site tracking cookies. If this changes, we will update this policy and ask for consent where the law requires it.",
    ],
  },
  {
    title: "How long we keep information",
    paragraphs: [
      "We keep your account and business page information for as long as your account is active. If you ask us to delete your account, we will delete or anonymise your information within a reasonable time, except where we must keep some records for legal, tax or security reasons, such as payment records.",
      "Booking details are kept until you or we delete the booking or the business page.",
    ],
  },
  {
    title: "Where information is stored",
    paragraphs: [
      "Our database is hosted by Supabase in the Seoul region (South Korea). Our other providers may process information in other countries, including the United States. Where required, we rely on appropriate safeguards for these transfers.",
    ],
  },
  {
    title: "Security",
    paragraphs: [
      "We use industry-standard measures to protect your information, including encrypted connections and access controls on our database. No online service is completely secure, so we cannot guarantee absolute security. If we become aware of a breach that affects you, we will tell you as the law requires.",
    ],
  },
  {
    title: "Your choices and rights",
    paragraphs: ["Depending on where you live, you may have the right to:"],
    bullets: [
      "Access the personal information we hold about you.",
      "Correct information that is wrong or out of date.",
      "Ask us to delete your information.",
      "Receive a copy of your information.",
      "Object to or limit certain uses of your information, or withdraw consent you gave earlier.",
    ],
    after: [
      `You can edit or unpublish your business page from your dashboard. For anything else, email us at ${CONTACT_EMAIL}. We may need to confirm your identity before acting on a request.`,
    ],
  },
  {
    title: "Children",
    paragraphs: [
      `BizCard AI is not meant for anyone under ${MIN_AGE}, and we do not knowingly collect information from children. If you think a child has given us personal information, contact us and we will delete it.`,
    ],
  },
  {
    title: "Changes to this policy",
    paragraphs: [
      "We may update this policy from time to time. When we make an important change, we will update the date at the top of this page and, where appropriate, notify you by email or in the app.",
    ],
  },
  {
    title: "Contact us",
    paragraphs: [
      `If you have questions or requests about this policy, contact ${COMPANY} at ${CONTACT_EMAIL}.`,
      `Postal address: ${ADDRESS}`,
    ],
  },
];

export default function Privacy() {
  return (
    <div className="aurora relative min-h-screen bg-subtle-gradient px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to BizCard AI
        </a>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="glass mt-8 rounded-3xl p-6 shadow-soft md:p-10"
        >
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Privacy policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

          <div className="mt-8 space-y-8">
            {SECTIONS.map((s) => (
              <section key={s.title}>
                <h2 className="text-xl font-bold tracking-tight">{s.title}</h2>
                {s.paragraphs?.map((p, i) => (
                  <p key={i} className="mt-3 max-w-[72ch] text-sm leading-relaxed text-muted-foreground">{p}</p>
                ))}
                {s.bullets && (
                  <ul className="mt-3 max-w-[72ch] list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                    {s.bullets.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                )}
                {s.after?.map((p, i) => (
                  <p key={i} className="mt-3 max-w-[72ch] text-sm leading-relaxed text-muted-foreground">{p}</p>
                ))}
              </section>
            ))}
          </div>

          <p className="mt-10 border-t pt-6 text-sm text-muted-foreground">
            Need help? <a href="/support" className="font-semibold text-foreground underline underline-offset-2">Contact support</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
