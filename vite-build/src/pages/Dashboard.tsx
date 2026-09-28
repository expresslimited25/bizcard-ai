import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, CalendarDays, Check, Copy, CreditCard, ExternalLink, Eye, Loader2, Pencil, Share2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchBookings, fetchMyBusiness, fetchProfile, type Booking, type Business, type Profile } from "@/lib/queries";
import { checkSubscription, createCheckout, createPortalSession, type BillingState } from "@/lib/billing";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile|null>(null);
  const [business, setBusiness] = useState<Business|null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [billing, setBilling] = useState<BillingState|null>(null);
  const [loading, setLoading] = useState(true);
  const [billingBusy, setBillingBusy] = useState(false);
  const [bookTab, setBookTab] = useState<"pending"|"all">("pending");

  const load = useCallback(async () => {
    if (!user) return;
    const [p, { business: b }] = await Promise.all([fetchProfile(user.id), fetchMyBusiness(user.id)]);
    setProfile(p); setBusiness(b);
    if (b) setBookings(await fetchBookings(b.id));
    try { setBilling(await checkSubscription()); } catch {}
    setLoading(false);
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") { toast.success("Subscription active!"); window.history.replaceState({}, "", "/dashboard"); }
    else if (params.get("checkout") === "cancelled") { toast("Checkout cancelled."); window.history.replaceState({}, "", "/dashboard"); }
  }, []);

  const publicUrl = business ? `${window.location.origin}/${business.slug}` : "";
  const stats = useMemo(() => ({
    pending: bookings.filter(b => b.status==="pending").length,
    confirmed: bookings.filter(b => b.status==="confirmed").length,
    total: bookings.length, views: business?.view_count ?? 0,
  }), [bookings, business]);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) { toast.error("Could not update booking."); return; }
    setBookings(prev => prev.map(b => b.id===id ? { ...b, status } : b));
    toast.success(`Booking ${status}`);
  };

  const subscribe = async (plan = "monthly") => {
    setBillingBusy(true);
    try { window.location.href = await createCheckout(plan as any, window.location.origin); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Could not start checkout."); setBillingBusy(false); }
  };

  const manageBilling = async () => {
    setBillingBusy(true);
    try { window.location.href = await createPortalSession(window.location.origin); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Could not open billing portal."); setBillingBusy(false); }
  };

  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;

  const filteredBookings = bookTab === "pending" ? bookings.filter(b => b.status==="pending") : bookings;

  return (
    <div className="aurora min-h-screen bg-subtle-gradient">
      <header className="border-b bg-card/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="text-lg font-extrabold tracking-tight">BizCard<span className="text-primary"> AI</span></a>
          <div className="flex items-center gap-3">
            <span className="rounded-full border px-3 py-1 text-xs font-semibold">
              {billing?.subscribed ? "Pro" : `Free trial — ${billing?.trialDaysLeft ?? 0} days left`}
            </span>
            {billing?.subscribed ? (
              <button onClick={() => void manageBilling()} disabled={billingBusy}
                className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-60">
                <CreditCard className="size-4" /> Manage billing
              </button>
            ) : (
              <button onClick={() => void subscribe()} disabled={billingBusy}
                className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60">
                <CreditCard className="size-4" /> Upgrade — $10/mo
              </button>
            )}
            <button onClick={() => void signOut().then(() => window.location.href = "/")}
              className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-muted">Sign out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {business ? `Your page is ${business.is_published ? "live" : "unpublished"}.` : "Let's build your business page."}
          </p>
        </div>

        {!business ? (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            className="glass rounded-3xl p-10 text-center">
            <div className="bg-brand-gradient mx-auto grid size-16 place-items-center rounded-2xl text-white">
              <Sparkles className="size-7" />
            </div>
            <h2 className="mt-5 text-2xl font-extrabold">You don't have a page yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Answer a few questions and our AI writes your headline, bio and services — then publishes a beautiful public page.
            </p>
            <a href="/onboarding" className="hover-lift shadow-glow mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white">
              Create my business page
            </a>
          </motion.div>
        ) : (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon:<Eye className="size-4"/>, label:"Page views", value:stats.views },
                { icon:<CalendarDays className="size-4"/>, label:"Total bookings", value:stats.total },
                { icon:<BarChart3 className="size-4"/>, label:"Pending", value:stats.pending },
                { icon:<Check className="size-4"/>, label:"Confirmed", value:stats.confirmed },
              ].map(s => (
                <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                  className="glass rounded-2xl p-5">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.icon} {s.label}</span>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight">{s.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              {/* Booking inbox */}
              <div className="glass rounded-3xl p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-extrabold">Booking inbox</h2>
                  <div className="flex rounded-lg border p-1 text-sm">
                    {(["pending","all"] as const).map(t => (
                      <button key={t} onClick={() => setBookTab(t)}
                        className={`rounded-md px-3 py-1 font-semibold capitalize transition ${bookTab===t?"bg-card shadow-sm":"text-muted-foreground"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                {filteredBookings.length === 0 ? (
                  <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No bookings here yet. Share your page link to get your first one.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredBookings.map(b => (
                      <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
                        <div>
                          <p className="font-bold">{b.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{b.date} · {b.time_slot}{b.customer_phone ? ` · ${b.customer_phone}` : ""}</p>
                          {b.notes && <p className="mt-1 text-xs italic text-muted-foreground">"{b.notes}"</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                            b.status==="confirmed"?"bg-green-100 text-green-700":b.status==="cancelled"?"bg-red-100 text-red-700":"bg-gray-100 text-gray-600"
                          }`}>{b.status}</span>
                          {b.status==="pending" && <>
                            <button onClick={() => void setStatus(b.id,"confirmed")} className="rounded-lg bg-green-600 p-1.5 text-white"><Check className="size-3.5"/></button>
                            <button onClick={() => void setStatus(b.id,"cancelled")} className="rounded-lg border p-1.5"><X className="size-3.5"/></button>
                          </>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* QR Card */}
                <div className="glass rounded-3xl p-6 text-center">
                  <h2 className="text-lg font-extrabold">Your public page</h2>
                  <p className="mt-1 break-all font-mono text-xs text-primary">{publicUrl}</p>
                  <div className="mt-4 flex justify-center">
                    <div id="qr-code-svg">
  <QRCodeSVG value={publicUrl} size={160} fgColor={business.color_primary} />
</div>
                  </div>
                  <div className="mt-5 grid gap-2">
                    <button onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success("Link copied"); }}
  className="flex items-center justify-center gap-2 rounded-xl border py-2 text-sm font-semibold hover:bg-muted">
  <Copy className="size-4" /> Copy link
</button>
<button onClick={() => {
  const svg = document.querySelector("#qr-code-svg svg") as SVGElement;
  if (!svg) return;
  const svgData = new XMLSerializer().serializeToString(svg);
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>${business.name} QR Code</title><style>
    body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui,sans-serif;background:#fff;}
    svg{width:280px;height:280px;}
    p{margin-top:16px;font-size:14px;color:#6b7280;}
    h2{margin:0 0 8px;font-size:18px;font-weight:700;}
    @media print{button{display:none}}
    button{margin-top:20px;padding:10px 24px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;}
  </style></head><body>
    <h2>${business.name}</h2>
    ${svgData}
    <p>${publicUrl}</p>
    <button onclick="window.print()">Print</button>
  </body></html>`);
  win.document.close();
}} className="flex items-center justify-center gap-2 rounded-xl border py-2 text-sm font-semibold hover:bg-muted">
  🖨️ Print QR code
</button>
                    <a href={publicUrl} target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2 text-sm font-semibold text-white shadow-glow">
                      <ExternalLink className="size-4" /> View live page
                    </a>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="glass rounded-3xl p-6">
                  <h2 className="text-lg font-extrabold">Quick actions</h2>
                  <div className="mt-4 grid gap-2">
                    <a href="/onboarding" className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-muted">
                      <Pencil className="size-4" /> Edit page & regenerate AI copy
                    </a>
                    <button onClick={async () => {
                      const next = !business.is_published;
                      const { error } = await supabase.from("businesses").update({ is_published: next }).eq("id", business.id);
                      if (error) { toast.error("Could not update visibility"); return; }
                      setBusiness({ ...business, is_published: next });
                      toast.success(next ? "Page is live" : "Page unpublished");
                    }} className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-muted">
                      {business.is_published ? "Unpublish page" : "Publish page"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
