import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, CalendarClock, Check, Link2, Palette, QrCode, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { PLANS } from "@/lib/bizcard";
import { createCheckout } from "@/lib/billing";
import { useAuth } from "@/hooks/useAuth";

const FEATURES = [
  { icon: Wand2, title: "AI-generated page", body: "Answer a few questions and AI writes your headline, tagline, bio and services in your voice." },
  { icon: CalendarClock, title: "Built-in booking system", body: "Appointment slots or table reservations, with an inbox you actually manage." },
  { icon: Link2, title: "Social links hub", body: "Instagram, TikTok, WhatsApp, LinkedIn and more in one animated icon grid." },
  { icon: Palette, title: "Custom branding", body: "Pick colours and watch the whole page adapt live to your brand." },
];

const STEPS = [
  { title: "Sign in with Google", body: "No forms, no passwords. You're in within seconds." },
  { title: "Tell us about your business", body: "Six guided steps: identity, media, links, colours, bookings." },
  { title: "Let AI write it", body: "A polished bio, tagline, hero headline and services in one click." },
  { title: "Publish and share", body: "Get bizcard.ai/yourbrand plus a branded QR code to print anywhere." },
];

const fadeUp = { hidden:{ opacity:0, y:24 }, show:{ opacity:1, y:0 } };

export default function Landing() {
  const { session } = useAuth();
  const [busy, setBusy] = useState<string|null>(null);

  const startCheckout = async (planId: string) => {
    if (!session) { sessionStorage.setItem("bizcard-checkout-intent", planId); window.location.href = "/auth"; return; }
    setBusy(planId);
    try {
      const url = await createCheckout(planId as any, window.location.origin);
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start checkout.");
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-subtle-gradient">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b bg-white/80 backdrop-blur-xl dark:bg-gray-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-extrabold tracking-tight">BizCard<span className="text-primary"> AI</span></span>
          <div className="flex items-center gap-3">
            <a href="#pricing" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block">Pricing</a>
            <a href="/auth" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-glow hover:-translate-y-0.5 hover:shadow-elevated transition">
              Get Started Free
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="aurora relative overflow-hidden px-4 pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
              className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" /> One month free — no credit card
            </motion.div>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {["Your Business.", "One Link.", "Infinite First Impressions."].map((line, i) => (
                <motion.span key={line} initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }}
                  transition={{ duration:0.6, delay:0.1+i*0.12, ease:[0.22,1,0.36,1] }} className="block">
                  {i===2 ? <span className="text-gradient">{line}</span> : line}
                </motion.span>
              ))}
            </h1>
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
              className="mt-6 max-w-xl text-lg text-muted-foreground">
              BizCard AI turns a few answers into a stunning public business page — written by AI, branded by you, bookable by customers, shareable with a single QR code.
            </motion.p>
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.62 }}
              className="mt-8 flex flex-wrap items-center gap-3">
              <a href="/auth" className="hover-lift shadow-glow inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-white">
                Get Started Free <ArrowRight className="size-4" />
              </a>
              <a href="#pricing" className="inline-flex h-12 items-center rounded-xl border px-7 text-base font-semibold hover:bg-muted transition">
                See pricing
              </a>
            </motion.div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["Google sign-in", "Live in 5 minutes", "Cancel anytime"].map(t => (
                <span key={t} className="flex items-center gap-1.5"><BadgeCheck className="size-4 text-primary" /> {t}</span>
              ))}
            </div>
          </div>
          {/* Phone mockup */}
          <motion.div initial={{ opacity:0, scale:0.94 }} animate={{ opacity:1, scale:1 }}
            transition={{ duration:0.9, ease:[0.22,1,0.36,1] }}
            className="flex justify-center">
            <motion.div animate={{ y:[0,-14,0] }} transition={{ duration:7, repeat:Infinity, ease:"easeInOut" }}
              className="w-72 rounded-[2rem] border bg-card p-4 shadow-elevated">
              <div className="rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-br from-blue-600 via-blue-400 to-amber-400 p-6 text-center text-white">
                  <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-white/20 text-2xl">☕</div>
                  <p className="font-extrabold">Ember &amp; Oak Café</p>
                  <p className="text-xs opacity-90 mt-1">Where Every Cup Tells a Story</p>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  {["Espresso Bar","Small Plates","Private Events"].map(s => (
                    <div key={s} className="flex justify-between border-b pb-1.5 text-xs font-semibold">
                      {s} <span className="text-primary">Book →</span>
                    </div>
                  ))}
                  <div className="mt-3 rounded-xl bg-muted p-2 text-center">
                    <p className="text-[9px] text-muted-foreground">bizcard.ai/ember-oak</p>
                    <QrCode className="mx-auto mt-1 size-8 text-primary" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-muted/40 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Everything in one page" title="A business card that actually works for you"
            body="Not a link list. A living page that introduces your brand, takes bookings and looks expensive." />
          <motion.div variants={{ show:{ transition:{ staggerChildren:0.09 } } }} initial="hidden" whileInView="show" viewport={{ once:true }}
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(f => (
              <motion.div key={f.title} variants={fadeUp} transition={{ duration:0.5 }}
                className="glass hover-lift rounded-2xl p-6 shadow-soft">
                <span className="bg-brand-gradient mb-4 grid size-11 place-items-center rounded-xl text-white">
                  <f.icon className="size-5" />
                </span>
                <h3 className="font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="How it works" title="Four steps from idea to shareable link" body="The onboarding wizard does the thinking. You just answer." />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
                transition={{ duration:0.5, delay:i*0.08 }} className="rounded-2xl border bg-card p-6 shadow-soft">
                <span className="text-gradient text-3xl font-extrabold">0{i+1}</span>
                <h3 className="mt-3 font-bold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* QR highlight */}
      <section className="px-4 py-16">
        <div className="glass mx-auto flex max-w-6xl flex-col items-center gap-8 rounded-3xl p-8 md:flex-row md:p-12">
          <span className="bg-brand-gradient grid size-20 shrink-0 place-items-center rounded-3xl text-white">
            <QrCode className="size-10" />
          </span>
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight">Every page comes with its own QR code</h3>
            <p className="mt-2 text-muted-foreground">Download it as a PNG in your brand colour. Print it, share it, or put it anywhere.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-muted/40 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Pricing" title="Start free. Upgrade when it pays for itself."
            body="One month free with no credit card. Then pick the billing period that suits you." />
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PLANS.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
                transition={{ duration:0.5, delay:i*0.07 }}
                className={`hover-lift relative flex flex-col rounded-2xl border p-6 ${p.highlight ? "shadow-glow border-primary/40 bg-card" : "bg-card shadow-soft"}`}>
                {p.highlight && (
                  <span className="bg-brand-gradient absolute -top-3 left-6 rounded-full px-3 py-1 text-[11px] font-bold text-white">Most popular</span>
                )}
                <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight">{p.price}</span>
                </div>
                <p className="text-xs text-muted-foreground">{p.period}</p>
                <p className="mt-1 text-xs font-semibold text-primary">{p.note}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm">
                  {p.perks.map(perk => (
                    <li key={perk} className="flex gap-2 text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {perk}
                    </li>
                  ))}
                </ul>
                {p.id === "trial" ? (
                  <a href="/auth" className="mt-6 flex h-10 items-center justify-center rounded-xl border font-semibold text-sm hover:bg-muted transition">
                    Start free
                  </a>
                ) : (
                  <button onClick={() => void startCheckout(p.id)} disabled={busy === p.id}
                    className="mt-6 flex h-10 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white shadow-glow hover:-translate-y-0.5 transition disabled:opacity-60">
                    Subscribe — {p.price} {p.period}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 pt-8">
        <div className="bg-brand-gradient mx-auto max-w-5xl rounded-3xl px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Your first impression is one link away</h2>
          <p className="mx-auto mt-3 max-w-xl opacity-90">Join businesses replacing five scattered links with one page that sells.</p>
          <a href="/auth" className="hover-lift mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white/20 px-8 text-base font-semibold backdrop-blur transition">
            Get Started Free <ArrowRight className="size-4" />
          </a>
        </div>
      </section>

      <footer className="border-t px-4 py-10 text-center text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">BizCard AI</p>
        <p className="mt-1">Your Business. One Link. Infinite First Impressions.</p>
        <p className="mt-3 flex justify-center gap-4">
  <a href="/privacy" className="font-semibold text-foreground underline underline-offset-2">Privacy policy</a>
  <a href="/support" className="font-semibold text-foreground underline underline-offset-2">Contact support</a>
</p>
      </footer>
    </div>
  );
}

function SectionHeading({ eyebrow, title, body }: { eyebrow:string; title:string; body:string }) {
  return (
    <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
      className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mt-3 text-muted-foreground">{body}</p>
    </motion.div>
  );
}
