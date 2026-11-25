export const CATEGORIES = [
  "Restaurant","Retail","Beauty & Wellness","Professional Services",
  "Creative","Health","Education","Other",
] as const;

export const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourbrand" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourbrand" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@yourbrand" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/yourbrand" },
  { key: "x", label: "X / Twitter", placeholder: "https://x.com/yourbrand" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/15551234567" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourbrand" },
] as const;

export const PRESET_PALETTES = [
  { name: "Ocean Blue", primary: "#2563eb", accent: "#38bdf8" },
  { name: "Sunset Orange", primary: "#ea580c", accent: "#fbbf24" },
  { name: "Forest Green", primary: "#15803d", accent: "#84cc16" },
  { name: "Royal Purple", primary: "#6d28d9", accent: "#c084fc" },
  { name: "Monochrome", primary: "#18181b", accent: "#71717a" },
  { name: "Rose Gold", primary: "#be123c", accent: "#f9a8d4" },
];

export const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] as const;

const PRO_PERKS = [
  "Everything in trial","Unlimited edits & AI regeneration",
  "Page view analytics","Video embeds","Priority support",
] as const;

export type Currency = "myr" | "usd";

// Quick first guess from the browser's time zone. Many Malaysian Windows PCs report
// "Asia/Singapore" (Windows' "Kuala Lumpur, Singapore" zone), so this is only a fallback.
export function guessCurrency(): Currency {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz === "Asia/Kuala_Lumpur" || tz === "Asia/Kuching" ? "myr" : "usd";
  } catch { return "usd"; }
}

// Accurate answer: the visitor's country from Vercel (/api/geo). MY = RM, everyone else = $.
let cached: Promise<Currency> | null = null;
export function detectCurrency(): Promise<Currency> {
  if (!cached) {
    cached = fetch("/api/geo", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.country ? (d.country === "MY" ? "myr" : "usd") as Currency : guessCurrency())
      .catch(() => guessCurrency());
  }
  return cached;
}

// Must match the Stripe prices (USD default + MYR option)
const AMOUNTS = {
  monthly:   { usd: 9.99,  myr: 12.99 },
  quarterly: { usd: 25.99, myr: 35.99 },
  yearly:    { usd: 99.99, myr: 109.99 },
} as const;

export function formatPrice(amount: number, currency: Currency): string {
  return currency === "myr" ? `RM${amount.toFixed(2)}` : `$${amount.toFixed(2)}`;
}

function saving(plan: "quarterly" | "yearly", months: number, c: Currency): string {
  const pct = Math.round((1 - AMOUNTS[plan][c] / (AMOUNTS.monthly[c] * months)) * 100);
  return `Save ${pct}% vs monthly`;
}

export function getPlans(c: Currency) {
  return [
    { id:"trial", name:"Free Trial", price: c === "myr" ? "RM0" : "$0", period:"for 1 month", note:"No credit card required",
      perks:["Full AI page builder","Public business page","Booking inbox","QR code sharing"], highlight:false },
    { id:"monthly", name:"Pro Monthly", price: formatPrice(AMOUNTS.monthly[c], c), period:"per month", note:"Cancel anytime", perks:[...PRO_PERKS], highlight:false },
    { id:"quarterly", name:"Pro Quarterly", price: formatPrice(AMOUNTS.quarterly[c], c), period:"every 3 months", note: saving("quarterly", 3, c), perks:[...PRO_PERKS], highlight:true },
    { id:"yearly", name:"Pro Yearly", price: formatPrice(AMOUNTS.yearly[c], c), period:"per year", note:`Best value — ${saving("yearly", 12, c).toLowerCase()}`, perks:[...PRO_PERKS], highlight:false },
  ];
}

export function monthlyPriceLabel(c: Currency): string {
  return `${formatPrice(AMOUNTS.monthly[c], c)}/mo`;
}

// New Stripe prices (USD default + MYR option). Must match create-checkout.
export const PRICE_IDS = {
  monthly: "price_1UfaDKAN138436M6mkTRdk7V",
  quarterly: "price_1UfaE1AN138436M6jcwdh267",
  yearly: "price_1UfaFKAN138436M6RGmPEBpX",
} as const;

export type PlanId = keyof typeof PRICE_IDS;

export type AiContent = {
  headline: string; tagline: string; bio: string;
  services: { title: string; description: string }[];
};

export function slugify(input: string): string {
  return input.toLowerCase().normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g,"").trim()
    .replace(/\s+/g,"-").replace(/-+/g,"-").slice(0,48);
}

export function buildTimeSlots(start: string, end: string, durationMins: number): string[] {
  const toMins = (t: string) => { const [h,m] = t.split(":").map(Number); return (h??0)*60+(m??0); };
  const fmt = (mins: number) => {
    const h24=Math.floor(mins/60)%24, m=mins%60, suf=h24>=12?"PM":"AM", h12=h24%12===0?12:h24%12;
    return `${h12}:${String(m).padStart(2,"0")} ${suf}`;
  };
  const s=toMins(start), e=toMins(end), step=Math.max(15,durationMins||60), out:string[]=[];
  for(let t=s; t+step<=e && out.length<48; t+=step) out.push(fmt(t));
  return out;
}

export function youtubeEmbed(url: string|null|undefined): string|null {
  if(!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{6,})/);
  if(m?.[1]) return `https://www.youtube.com/embed/${m[1]}`;
  const v = url.match(/vimeo\.com\/(\d+)/)?.[1];
  return v ? `https://player.vimeo.com/video/${v}` : null;
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#","");
  const full = clean.length===3 ? clean.split("").map(c=>c+c).join("") : clean;
  const num = parseInt(full||"2563eb",16);
  return `rgba(${(num>>16)&255},${(num>>8)&255},${num&255},${alpha})`;
}

export function readableOn(hex: string): string {
  const clean = hex.replace("#","");
  const full = clean.length===3 ? clean.split("").map(c=>c+c).join("") : clean;
  const num = parseInt(full||"2563eb",16);
  const r=(num>>16)&255, g=(num>>8)&255, b=num&255;
  return (0.299*r+0.587*g+0.114*b)/255 > 0.62 ? "#111827" : "#ffffff";
}
