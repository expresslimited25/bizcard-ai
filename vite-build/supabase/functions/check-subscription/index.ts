import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// check-subscription (v2): asks Stripe directly whether the signed-in user
// has a paid subscription. No webhook needed. Response shape is unchanged.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TRIAL_DAYS = 30;
const PAID_STATUSES = ["active", "trialing"];
// Order used to pick the "best" subscription when a customer has several
const STATUS_RANK = ["active", "trialing", "past_due", "unpaid", "incomplete", "paused", "canceled", "incomplete_expired"];

async function stripeGet(path: string, key: string) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Stripe: ${body?.error?.message ?? res.status}`);
  return body;
}

// Finds the user's best Stripe subscription by their sign-in email
async function findStripeSubscription(email: string, key: string) {
  const customers = await stripeGet(`customers?email=${encodeURIComponent(email)}&limit=10`, key);
  let best: any = null;
  for (const c of customers.data ?? []) {
    const subs = await stripeGet(`subscriptions?customer=${c.id}&status=all&limit=20`, key);
    for (const s of subs.data ?? []) {
      if (!best) { best = s; continue; }
      const a = STATUS_RANK.indexOf(s.status), b = STATUS_RANK.indexOf(best.status);
      if (a < b || (a === b && s.created > best.created)) best = s;
    }
  }
  return best;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: { user }, error } = await supabase.auth.getUser(token!);
    if (error || !user) throw new Error("Unauthorized");

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

    // 1) Ask Stripe. If Stripe can't be reached, fall back to the database row.
    let status: string | null = null;
    let currentPeriodEnd: string | null = null;
    let cancelAtPeriodEnd = false;

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    let stripeOk = false;
    if (stripeKey && user.email) {
      try {
        const s = await findStripeSubscription(user.email, stripeKey);
        stripeOk = true;
        if (s) {
          status = s.status;
          // Newer Stripe API versions keep the period end on the subscription item
          const end = s.current_period_end ?? s.items?.data?.[0]?.current_period_end ?? null;
          currentPeriodEnd = end ? new Date(end * 1000).toISOString() : null;
          cancelAtPeriodEnd = !!s.cancel_at_period_end || !!s.cancel_at;

          // Best-effort: keep the subscriptions table in sync. Never blocks the answer.
          try {
            await supabase.from("subscriptions").upsert({
              user_id: user.id,
              status,
              current_period_end: currentPeriodEnd,
              cancel_at_period_end: cancelAtPeriodEnd,
            }, { onConflict: "user_id" });
          } catch (_) { /* ignore */ }
        }
      } catch (e) {
        console.error("Stripe lookup failed, using database:", (e as Error).message);
      }
    }

    if (!stripeOk) {
      const { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle();
      status = sub?.status ?? null;
      currentPeriodEnd = sub?.current_period_end ?? null;
      cancelAtPeriodEnd = sub?.cancel_at_period_end ?? false;
    }

    // 2) Free trial (unchanged)
    const trialEndsAt = profile?.trial_ends_at
      ? profile.trial_ends_at
      : new Date(new Date(user.created_at).getTime() + TRIAL_DAYS * 864e5).toISOString();
    const trialDaysLeft = Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 864e5));

    const subscribed = !!status && PAID_STATUSES.includes(status);
    const hasAccess = subscribed || trialDaysLeft > 0;

    return new Response(JSON.stringify({
      subscribed,
      status,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      trialEndsAt,
      trialDaysLeft,
      hasAccess,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
