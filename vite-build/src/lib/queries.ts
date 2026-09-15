import { supabase } from "@/integrations/supabase/client";

export type Business = {
  id: string; user_id: string; slug: string; name: string; category: string;
  short_desc: string|null; long_desc: string|null; logo_url: string|null;
  cover_url: string|null; video_url: string|null; website: string|null;
  email: string|null; phone: string|null; color_primary: string; color_accent: string;
  ai_headline: string|null; ai_tagline: string|null; ai_bio: string|null;
  ai_services: unknown; is_published: boolean; view_count: number;
  created_at: string; updated_at: string;
};

export type BookingSettings = {
  id: string; business_id: string; enabled: boolean; booking_type: string;
  available_days: string[]; start_time: string; end_time: string;
  slot_duration_mins: number; max_capacity: number;
  collect_name: boolean; collect_phone: boolean; collect_notes: boolean;
};

export type Booking = {
  id: string; business_id: string; customer_name: string;
  customer_phone: string|null; notes: string|null; date: string;
  time_slot: string; status: string; created_at: string;
};

export type Profile = {
  id: string; name: string|null; avatar_url: string|null;
  plan: string|null; trial_ends_at: string|null;
  stripe_customer_id: string|null; created_at: string;
};

export type SocialLink = { id: string; business_id: string; platform: string; url: string; };

export async function fetchProfile(userId: string): Promise<Profile|null> {
  try {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

export async function fetchMyBusiness(userId: string) {
  try {
    const { data: business, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !business) return { business: null, socials: [], booking: null };
    const [socialsRes, bookingRes] = await Promise.allSettled([
      supabase.from("social_links").select("*").eq("business_id", business.id),
      supabase.from("booking_settings").select("*").eq("business_id", business.id).maybeSingle(),
    ]);
    const socials = socialsRes.status === "fulfilled" ? (socialsRes.value.data ?? []) : [];
    const booking = bookingRes.status === "fulfilled" ? bookingRes.value.data : null;
    return { business: business as Business, socials: socials as SocialLink[], booking: booking as BookingSettings|null };
  } catch {
    return { business: null, socials: [], booking: null };
  }
}

export async function fetchBookings(businessId: string): Promise<Booking[]> {
  const { data } = await supabase.from("bookings").select("*").eq("business_id", businessId)
    .order("date", { ascending: false }).order("created_at", { ascending: false });
  return (data ?? []) as Booking[];
}

export async function getPublicBusiness(slug: string) {
  const { data: b } = await supabase.from("businesses").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  if(!b) return null;
  const [{ data: socials }, { data: booking }] = await Promise.all([
    supabase.from("social_links").select("*").eq("business_id", b.id),
    supabase.from("booking_settings").select("*").eq("business_id", b.id).maybeSingle(),
  ]);
  const logoUrl = b.logo_url ? supabase.storage.from("business-media").getPublicUrl(b.logo_url).data.publicUrl : null;
  const coverUrl = b.cover_url ? supabase.storage.from("business-media").getPublicUrl(b.cover_url).data.publicUrl : null;
  return { ...(b as Business), logo: logoUrl, cover: coverUrl,
    socials: (socials ?? []) as SocialLink[],
    services: Array.isArray(b.ai_services) ? (b.ai_services as {title:string;description:string}[]) : [],
    booking: booking as BookingSettings|null };
}

export async function uploadMedia(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("business-media").upload(path, file, { cacheControl: "3600", upsert: false });
  if(error) throw error;
  return path;
}

export function getPublicUrl(path: string): string {
  return supabase.storage.from("business-media").getPublicUrl(path).data.publicUrl;
}

export async function isSlugAvailable(slug: string, ownId?: string): Promise<boolean> {
  const { data } = await supabase.from("businesses").select("id").eq("slug", slug).maybeSingle();
  return !data || data.id === ownId;
}
