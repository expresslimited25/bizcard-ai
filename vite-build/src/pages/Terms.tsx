import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

// ---------------------------------------------------------------------------
// EDIT THESE VALUES FIRST. They appear throughout the terms.
// ---------------------------------------------------------------------------
const COMPANY = "[Your legal entity name]";
const CONTACT_EMAIL = "[support@your-domain.com]";
const ADDRESS = "[Registered business address]";
const LAST_UPDATED = "[Date]";
const GOVERNING_LAW = "[Country or state whose laws apply]";
const COURTS = "[City or country whose courts will hear disputes]";
const MIN_AGE = "18";
const REFUND_POLICY =
  "[Payments are non-refundable except where the law requires otherwise. Edit this sentence to match your refund policy.]";
// ---------------------------------------------------------------------------

type Section = { title: string; paragraphs?: string[]; bullets?: string[]; after?: string[] };

const SECTIONS: Section[] = [
  {
    title: "About these terms",
    paragraphs: [
      `These terms are an agreement between you and ${COMPANY} ("we", "us") about your use of BizCard AI, including our website, dashboard, public business pages and related features (the "Service").`,
      "By creating an account or using the Service you agree to these terms and to our Privacy Policy. If you do not agree, do not use the Service.",
    ],
  },
  {
    title: "Who can use BizCard AI",
    paragraphs: [
      `You must be at least ${MIN_AGE} years old and able to form a binding contract. If you use the Service for a business, you confirm that you have the authority to act for that business.`,
    ],
  },
  {
    title: "Your account",
    paragraphs: [
      "You sign in with your Google account. You are responsible for the security of that account and for everything done through your BizCard AI account. Tell us promptly if you think someone has accessed it without permission.",
      "Give us accurate information and keep it up to date.",
    ],
  },
  {
    title: "Free trial and subscriptions",
    paragraphs: [
      "New accounts start with a free trial of 30 days. No payment card is needed to start the trial. When the trial ends, some features may become unavailable until you subscribe.",
      "Paid plans are billed in advance for the period you choose. At the time of writing, the plans are monthly, every 3 months, every 6 months and yearly. Current prices are shown on our website before you pay.",
      "Payments are processed by Stripe. Your subscription renews automatically at the end of each billing period until you cancel. You can cancel at any time from the Manage billing option in your dashboard, and you will keep access until the end of the period you have already paid for.",
      REFUND_POLICY,
      "We may change our prices. If we do, the new price applies from your next renewal and we will tell you in advance. You are responsible for any taxes that apply to your purchase.",
    ],
  },
  {
    title: "Your content",
    paragraphs: [
      "You keep ownership of the content you add to BizCard AI, such as your business details, text, logo and images. You give us a limited licence to store, display and process that content so we can run the Service, including showing your published page to the public.",
      "You are responsible for your content. You promise that you have the right to use it and that it does not break the law or anyone else's rights.",
    ],
  },
  {
    title: "AI-generated content",
    paragraphs: [
      "BizCard AI can write headlines, taglines, bios and service descriptions for you. AI output can be wrong, incomplete or similar to text produced for others. It is a starting point, and you are responsible for reading, editing and approving it before you publish.",
      "Once you publish AI-generated text on your page, you may use it as your own content. We do not promise that it is accurate or suitable for any particular purpose.",
    ],
  },
  {
    title: "Acceptable use",
    paragraphs: ["You agree not to use BizCard AI to:"],
    bullets: [
      "Break any law or regulation.",
      "Publish content that is unlawful, misleading, fraudulent, hateful, sexually explicit or that infringes someone else's rights.",
      "Pretend to be another person or business.",
      "Collect personal information from visitors in a way that breaks privacy laws.",
      "Upload malware or try to disrupt, probe or gain unauthorised access to the Service.",
      "Use automated tools to copy or overload the Service.",
      "Resell the Service without our written permission.",
    ],
    after: [
      "We may remove content or suspend a page that breaks these rules or that we reasonably believe is harmful.",
    ],
  },
  {
    title: "Bookings",
    paragraphs: [
      "BizCard AI provides a booking form that business owners can add to their page. A booking is an arrangement between the business and its customer. We are not a party to it and are not responsible for whether a booking is honoured, for the quality of any service, or for disputes between a business and its customers.",
      "If you collect customer details through your page, you are responsible for handling them lawfully, as described in our Privacy Policy.",
    ],
  },
  {
    title: "Third-party services",
    paragraphs: [
      "The Service relies on third parties, including Google (sign-in and AI), Supabase (database and storage), Vercel (hosting) and Stripe (payments). Their own terms apply to your use of their services, and we are not responsible for their failures.",
    ],
  },
  {
    title: "Our property",
    paragraphs: [
      "The Service, including its design, software, name and logo, belongs to us or our licensors. These terms do not give you any right to them except to use the Service as intended.",
    ],
  },
  {
    title: "Availability and changes",
    paragraphs: [
      "We work to keep BizCard AI running, but we do not promise it will always be available or error-free. We may update, change or remove features at any time, and we may carry out maintenance that causes short interruptions.",
    ],
  },
  {
    title: "Ending your use",
    paragraphs: [
      "You can stop using BizCard AI and ask us to delete your account at any time. Cancelling a paid plan does not delete your account by itself.",
      "We may suspend or end your access if you break these terms, if we must do so by law, or if your use puts the Service or other users at risk. If we end your access without a reason related to your conduct, we will refund the unused part of any prepaid period where the law requires.",
    ],
  },
  {
    title: "Disclaimers",
    paragraphs: [
      'The Service is provided "as is" and "as available". To the fullest extent the law allows, we do not give any warranties, express or implied, including about quality, fitness for a particular purpose, accuracy of AI output, or that the Service will be uninterrupted or secure.',
      "Nothing in these terms limits rights you have under consumer protection laws that cannot be excluded.",
    ],
  },
  {
    title: "Limit of liability",
    paragraphs: [
      "To the fullest extent the law allows, we are not liable for indirect or consequential losses, or for lost profits, revenue, data or goodwill, arising from your use of the Service.",
      "Our total liability to you for any claim related to the Service is limited to the amount you paid us in the 12 months before the claim arose, or the equivalent of 100 US dollars if you have not paid us anything.",
      "Nothing in these terms limits liability that cannot be limited by law, such as liability for fraud or for death or personal injury caused by negligence.",
    ],
  },
  {
    title: "Your responsibility to us",
    paragraphs: [
      "You agree to cover losses and costs we suffer because of a claim by a third party that arises from your content or your breach of these terms, to the extent the law allows.",
    ],
  },
  {
    title: "Changes to these terms",
    paragraphs: [
      "We may update these terms from time to time. When we make a material change, we will update the date at the top of this page and, where appropriate, tell you by email or in the app. If you keep using the Service after the change takes effect, you accept the new terms.",
    ],
  },
  {
    title: "Governing law",
    paragraphs: [
      `These terms are governed by the laws of ${GOVERNING_LAW}. Disputes will be handled by the courts of ${COURTS}, unless the law of your country gives you the right to bring a claim elsewhere.`,
    ],
  },
  {
    title: "Contact us",
    paragraphs: [
      `If you have questions about these terms, contact ${COMPANY} at ${CONTACT_EMAIL}.`,
      `Postal address: ${ADDRESS}`,
    ],
  },
];

export default function Terms() {
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
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Terms of service</h1>
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

          <p className="mt-10 flex flex-wrap gap-x-4 gap-y-1 border-t pt-6 text-sm text-muted-foreground">
            <a href="/privacy" className="font-semibold text-foreground underline underline-offset-2">Privacy policy</a>
            <a href="/support" className="font-semibold text-foreground underline underline-offset-2">Contact support</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
