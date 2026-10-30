import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Mail, Send } from "lucide-react";
import { toast } from "sonner";

const TOPICS = ["Billing and subscription", "My business page", "Bookings", "Something is broken", "Other"];

const inputCls = "w-full rounded-xl border bg-card px-3 py-2 text-sm outline-none focus:border-primary transition";

export default function Support() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");

  // Placeholder only: nothing is sent anywhere yet.
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      toast.error("Add your email and a message so we can reply.");
      return;
    }
    toast.success("Message received. This form is a placeholder, so nothing was sent yet.");
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="aurora relative min-h-screen bg-subtle-gradient px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to BizCard AI
        </a>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Contact support</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Tell us what you need help with and we will reply by email.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-[1.4fr_1fr]">
            <form onSubmit={submit} className="glass space-y-5 rounded-3xl p-6 shadow-soft md:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="support-name" className="mb-2 block text-sm font-semibold">Your name</label>
                  <input id="support-name" className={inputCls} value={name} placeholder="Jane Doe"
                    onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="support-email" className="mb-2 block text-sm font-semibold">Email</label>
                  <input id="support-email" type="email" className={inputCls} value={email} placeholder="you@example.com"
                    onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div>
                <label htmlFor="support-topic" className="mb-2 block text-sm font-semibold">What is this about?</label>
                <select id="support-topic" className={inputCls} value={topic} onChange={(e) => setTopic(e.target.value)}>
                  {TOPICS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="support-message" className="mb-2 block text-sm font-semibold">Message</label>
                <textarea id="support-message" className={`${inputCls} resize-none`} rows={6} value={message}
                  placeholder="Describe what happened and what you expected."
                  onChange={(e) => setMessage(e.target.value)} />
              </div>

              <button type="submit"
                className="hover-lift shadow-glow inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
                <Send className="size-4" /> Send message
              </button>
            </form>

            <aside className="space-y-4">
              <div className="glass rounded-3xl p-6">
                <span className="bg-brand-gradient mb-3 grid size-10 place-items-center rounded-xl text-white">
                  <Mail className="size-5" />
                </span>
                <h2 className="font-bold">Email us</h2>
                <p className="mt-1 text-sm text-muted-foreground">support@your-domain.com</p>
                <p className="mt-1 text-xs text-muted-foreground">Placeholder address. Replace it with your real support email.</p>
              </div>

              <div className="glass rounded-3xl p-6">
                <span className="bg-brand-gradient mb-3 grid size-10 place-items-center rounded-xl text-white">
                  <Clock className="size-5" />
                </span>
                <h2 className="font-bold">Response time</h2>
                <p className="mt-1 text-sm text-muted-foreground">We aim to reply within one business day.</p>
              </div>
            </aside>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
