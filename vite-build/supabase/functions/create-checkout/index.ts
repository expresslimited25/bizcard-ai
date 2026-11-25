import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// New prices (USD default + MYR option). Stripe picks the currency from the customer's location.
const PRICE_IDS: Record<string, string> = {
  monthly: "price_1UfaDKAN138436M6mkTRdk7V",
  quarterly: "price_1UfaE1AN138436M6jcwdh267",
  yearly: "price_1UfaFKAN138436M6RGmPEBpX",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { plan, origin } = await req.json();
    const priceId = PRICE_IDS[plan] ?? PRICE_IDS.monthly;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SB_SERVICE_ROLE_KEY")!
    );
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token!);
    if (!user) throw new Error(`Unauthorized${authError ? `: ${authError.message}` : ""}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });

    const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).maybeSingle();
    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email!, metadata: { supabase_user_id: user.id } });
      customerId = customer.id;
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/dashboard?checkout=cancelled`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
