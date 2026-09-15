import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { HexColorPicker } from "react-colorful";
import { ArrowLeft, ArrowRight, Check, Copy, ImagePlus, Loader2, Share2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { generateBusinessCopy } from "@/lib/ai";
import { fetchMyBusiness, isSlugAvailable, uploadMedia, getPublicUrl } from "@/lib/queries";
import { CATEGORIES as _CAT, DAYS as _DAYS, PRESET_PALETTES as _PAL, SOCIAL_PLATFORMS as _SOC, buildTimeSlots, hexToRgba, readableOn, slugify, type AiContent } from "@/lib/bizcard";

const CATEGORIES = Array.isArray(_CAT) ? [..._CAT] : ["Restaurant","Retail","Beauty & Wellness","Professional Services","Creative","Health","Education","Other"];
const DAYS = Array.isArray(_DAYS) ? [..._DAYS] : ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const PRESET_PALETTES = Array.isArray(_PAL) ? [..._PAL] : [{name:"Ocean Blue",primary:"#2563eb",accent:"#38bdf8"}];
const SOCIAL_PLATFORMS = Array.isArray(_SOC) ? [..._SOC] : [{key:"instagram",label:"Instagram",placeholder:"https://instagram.com/yourbrand"},{key:"facebook",label:"Facebook",placeholder:"https://facebook.com/yourbrand"},{key:"tiktok",label:"TikTok",placeholder:"https://tiktok.com/@yourbrand"},{key:"linkedin",label:"LinkedIn",placeholder:"https://linkedin.com/company/yourbrand"},{key:"x",label:"X / Twitter",placeholder:"https://x.com/yourbrand"},{key:"whatsapp",label:"WhatsApp",placeholder:"https://wa.me/15551234567"},{key:"youtube",label:"YouTube",placeholder:"https://youtube.com/@yourbrand"}];

type Form = {
  id:string|null; name:string; slug:string; category:string; short_desc:string; long_desc:string;
  logo_url:string; cover_url:string; video_url:string; website:string; email:string; phone:string;
  color_primary:string; color_accent:string; socials:Record<string,string>;
  bookingEnabled:boolean; booking_type:string; available_days:string[];
  start_time:string; end_time:string; slot_duration_mins:number; max_capacity:number;
  collect_name:boolean; collect_phone:boolean; collect_notes:boolean;
};

const EMPTY: Form = {
  id:null, name:"", slug:"", category:"Other", short_desc:"", long_desc:"",
  logo_url:"", cover_url:"", video_url:"", website:"", email:"", phone:"",
  color_primary:"#2563eb", color_accent:"#38bdf8", socials:{},
  bookingEnabled:false, booking_type:"appointment",
  available_days:["Mon","Tue","Wed","Thu","Fri"],
  start_time:"09:00", end_time:"18:00", slot_duration_mins:60, max_capacity:1,
  collect_name:true, collect_phone:true, collect_notes:true,
};

const STEPS = ["Business identity","Media","Links & contact","Colour palette","Booking settings","AI generation","Publish"];

export default function Onboarding() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [ai, setAi] = useState<AiContent|null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm(f => ({ ...f, [key]: value }));

  useEffect(() => {
    if (!user) return;
    fetchMyBusiness(user.id).then(({ business, socials, booking }) => {
      if (business) {
        setForm({
          id:business.id, name:business.name, slug:business.slug, category:business.category,
          short_desc:business.short_desc??"", long_desc:business.long_desc??"",
          logo_url:business.logo_url??"", cover_url:business.cover_url??"", video_url:business.video_url??"",
          website:business.website??"", email:business.email??user.email??"", phone:business.phone??"",
          color_primary:business.color_primary, color_accent:business.color_accent,
          socials:Object.fromEntries(socials.map(s => [s.platform, s.url])),
          bookingEnabled:booking?.enabled??false, booking_type:booking?.booking_type??"appointment",
          available_days:booking?.available_days??EMPTY.available_days,
          start_time:booking?.start_time??"09:00", end_time:booking?.end_time??"18:00",
          slot_duration_mins:booking?.slot_duration_mins??60, max_capacity:booking?.max_capacity??1,
          collect_name:booking?.collect_name??true, collect_phone:booking?.collect_phone??true, collect_notes:booking?.collect_notes??true,
        });
        if (business.ai_headline||business.ai_bio) {
          setAi({ headline:business.ai_headline??"", tagline:business.ai_tagline??"", bio:business.ai_bio??"",
            services:Array.isArray(business.ai_services)?(business.ai_services as AiContent["services"]):[] });
        }
      } else setForm(f => ({ ...f, email: user.email??"" }));
      setLoading(false);
    });
  }, [user]);

  const publicUrl = `${window.location.origin}/${form.slug}`;
  const canContinue = useMemo(() => {
    if (step===0) return form.name.trim().length>1 && form.short_desc.trim().length>0;
    if (step===5) return !!ai;
    return true;
  }, [step, form.name, form.short_desc, ai]);

  const runGeneration = async () => {
    setGenerating(true);
    try {
      const result = await generateBusinessCopy({ name:form.name, category:form.category, shortDesc:form.short_desc, longDesc:form.long_desc, website:form.website });
      setAi(result); toast.success("Your page copy is ready");
    } catch (err) { toast.error(err instanceof Error ? err.message : "AI generation failed"); }
    finally { setGenerating(false); }
  };

  const publish = async () => {
    if (!user) return;
    setPublishing(true);
    try {
      let slug = slugify(form.slug||form.name);
      if (!slug) slug = `biz-${Math.random().toString(36).slice(2,8)}`;
      if (!(await isSlugAvailable(slug, form.id??undefined))) slug = `${slug}-${Math.random().toString(36).slice(2,5)}`;

      const payload = {
        user_id:user.id, slug, name:form.name.trim(), category:form.category,
        short_desc:form.short_desc||null, long_desc:form.long_desc||null,
        logo_url:form.logo_url||null, cover_url:form.cover_url||null, video_url:form.video_url||null,
        website:form.website||null, email:form.email||null, phone:form.phone||null,
        color_primary:form.color_primary, color_accent:form.color_accent,
        ai_bio:ai?.bio??null, ai_tagline:ai?.tagline??null, ai_headline:ai?.headline??null,
        ai_services:(ai?.services??[]) as unknown as never, is_published:true, updated_at:new Date().toISOString(),
      };

      let businessId = form.id;
      if (businessId) { const { error } = await supabase.from("businesses").update(payload).eq("id", businessId); if (error) throw error; }
      else { const { data, error } = await supabase.from("businesses").insert(payload).select("id").single(); if (error) throw error; businessId = data.id; }

      await supabase.from("social_links").delete().eq("business_id", businessId);
      const socialRows = Object.entries(form.socials).filter(([,url]) => url?.trim().length>3).map(([platform,url]) => ({ business_id:businessId!, platform, url:url.trim() }));
      if (socialRows.length) await supabase.from("social_links").insert(socialRows);

      const { error: bsErr } = await supabase.from("booking_settings").upsert({
        business_id:businessId, enabled:form.bookingEnabled, booking_type:form.booking_type,
        available_days:form.available_days, start_time:form.start_time, end_time:form.end_time,
        slot_duration_mins:form.slot_duration_mins, max_capacity:form.max_capacity,
        collect_name:form.collect_name, collect_phone:form.collect_phone, collect_notes:form.collect_notes,
      }, { onConflict:"business_id" });
      if (bsErr) throw bsErr;

      setForm(f => ({ ...f, id:businessId, slug }));
      setPublished(true);
      confetti({ particleCount:160, spread:80, origin:{ y:0.35 } });
      setTimeout(() => confetti({ particleCount:90, spread:110, origin:{ y:0.4 } }), 260);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Could not publish your page"); }
    finally { setPublishing(false); }
  };

  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;

  return (
    <div className="aurora min-h-screen bg-subtle-gradient px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <a href="/dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Dashboard
          </a>
        </div>

        {!published && (
          <div className="mb-8">
            <div className="mb-2 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Step {step+1} of 7</p>
                <h1 className="text-2xl font-extrabold tracking-tight">{STEPS[step]}</h1>
              </div>
              <span className="text-sm text-muted-foreground">{Math.round(((step+1)/7)*100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="bg-brand-gradient h-full transition-all duration-500" style={{ width:`${((step+1)/7)*100}%` }} />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={published?"done":step} initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x:-24 }} transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}
            className="glass rounded-3xl p-6 shadow-soft md:p-8">
            {published ? (
              <div className="text-center">
                <motion.div initial={{ scale:0.5, opacity:0 }} animate={{ scale:1, opacity:1 }}
                  transition={{ type:"spring", stiffness:220, damping:16 }}
                  className="bg-brand-gradient mx-auto grid size-16 place-items-center rounded-2xl text-white">
                  <Check className="size-8" />
                </motion.div>
                <h2 className="mt-5 text-2xl font-extrabold">You're live!</h2>
                <p className="mt-2 text-sm text-muted-foreground">{form.name} now has a public page at {publicUrl}</p>
                <div className="mt-6 flex justify-center">
                  <QRCodeSVG value={publicUrl} size={160} fgColor={form.color_primary} />
                </div>
                <p className="mt-4 break-all font-mono text-sm text-primary">{publicUrl}</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success("Copied!"); }}
                    className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted">
                    <Copy className="size-4" /> Copy Link
                  </button>
                  <a href={publicUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
                    View my page
                  </a>
                  <a href="/dashboard" className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted">
                    Go to dashboard
                  </a>
                </div>
              </div>
            ) : (
              <>
                {step===0 && <StepIdentity form={form} set={set} />}
                {step===1 && <StepMedia form={form} set={set} userId={user?.id??""} />}
                {step===2 && <StepLinks form={form} set={set} />}
                {step===3 && <StepColors form={form} set={set} />}
                {step===4 && <StepBooking form={form} set={set} />}
                {step===5 && <StepAi ai={ai} setAi={setAi} generating={generating} onGenerate={() => void runGeneration()} businessName={form.name} />}
                {step===6 && <StepPreview form={form} ai={ai} />}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {!published && (
          <div className="mt-6 flex items-center justify-between">
            <button onClick={() => setStep(s => Math.max(0,s-1))} disabled={step===0}
              className="flex items-center gap-1 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-40">
              <ArrowLeft className="size-4" /> Back
            </button>
            {step<6 ? (
              <button onClick={() => setStep(s => Math.min(6,s+1))} disabled={!canContinue}
                className="hover-lift flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
                Continue <ArrowRight className="size-4" />
              </button>
            ) : (
              <button onClick={() => void publish()} disabled={publishing}
                className="hover-lift shadow-glow flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {publishing && <Loader2 className="size-4 animate-spin" />} Publish my page
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

type SetFn = <K extends keyof Form>(key: K, value: Form[K]) => void;

function Field({ label, hint, children }: { label:string; hint?:string; children:React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-semibold">{label}</label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-xl border bg-card px-3 py-2 text-sm outline-none focus:border-primary transition";
const textareaCls = `${inputCls} resize-none`;

function StepIdentity({ form, set }: { form:Form; set:SetFn }) {
  return (
    <div className="space-y-5">
      <Field label="Business name">
        <input className={inputCls} value={form.name} placeholder="Aurora Coffee House"
          onChange={e => { set("name", e.target.value); if(!form.id) set("slug", slugify(e.target.value)); }} />
      </Field>
      <Field label="Public link">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">bizcard.ai/</span>
          <input className={inputCls} value={form.slug} placeholder="aurora-coffee"
            onChange={e => set("slug", slugify(e.target.value))} />
        </div>
      </Field>
      <Field label="Category">
        <select className={inputCls} value={form.category} onChange={e => set("category", e.target.value)}>
          {(CATEGORIES || []).map(c => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Short description" hint={`${form.short_desc.length}/300`}>
        <textarea className={textareaCls} rows={3} maxLength={300} value={form.short_desc}
          placeholder="Speciality coffee roasted in-house, served in a plant-filled corner shop."
          onChange={e => set("short_desc", e.target.value)} />
      </Field>
      <Field label="Long description (optional)" hint={`${form.long_desc.length}/1000`}>
        <textarea className={textareaCls} rows={5} maxLength={1000} value={form.long_desc}
          placeholder="Tell us more — your story, what makes you different, who you serve."
          onChange={e => set("long_desc", e.target.value)} />
      </Field>
    </div>
  );
}

function StepMedia({ form, set, userId }: { form:Form; set:SetFn; userId:string }) {
  return (
    <div className="space-y-6">
      <UploadTile label="Logo / profile image" value={form.logo_url} userId={userId} onChange={p => set("logo_url",p)} aspect="aspect-square max-w-40" />
      <UploadTile label="Cover photo / banner" value={form.cover_url} userId={userId} onChange={p => set("cover_url",p)} aspect="aspect-[16/7]" />
      <Field label="Intro video URL (optional)">
        <input className={inputCls} value={form.video_url} placeholder="https://youtube.com/watch?v=..."
          onChange={e => set("video_url", e.target.value)} />
      </Field>
    </div>
  );
}

function UploadTile({ label, value, userId, onChange, aspect }: { label:string; value:string; userId:string; onChange:(p:string)=>void; aspect:string }) {
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const preview = value ? getPublicUrl(value) : null;

  const handle = async (file: File) => {
    if (!userId) return;
    setBusy(true);
    try { const path = await uploadMedia(userId, file); onChange(path); }
    catch { toast.error("Upload failed. Try a smaller image."); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">{label}</label>
      <button type="button" onClick={() => ref.current?.click()}
        className={`${aspect} grid w-full place-items-center overflow-hidden rounded-2xl border border-dashed bg-muted/40 transition hover:border-primary`}>
        {busy ? <Loader2 className="size-5 animate-spin text-primary" />
          : preview ? <img src={preview} alt={label} className="size-full object-cover" />
          : <span className="flex flex-col items-center gap-1 text-sm text-muted-foreground"><ImagePlus className="size-5" /> Click to upload</span>}
      </button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={e => { const f=e.target.files?.[0]; if(f) void handle(f); }} />
    </div>
  );
}

function StepLinks({ form, set }: { form:Form; set:SetFn }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Website"><input className={inputCls} value={form.website} placeholder="https://yourbrand.com" onChange={e => set("website",e.target.value)} /></Field>
        <Field label="Email"><input className={inputCls} value={form.email} placeholder="hello@yourbrand.com" onChange={e => set("email",e.target.value)} /></Field>
        <Field label="Phone"><input className={inputCls} value={form.phone} placeholder="+1 555 123 4567" onChange={e => set("phone",e.target.value)} /></Field>
      </div>
      <div className="pt-2">
        <p className="mb-3 text-sm font-semibold">Social media (all optional)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {(SOCIAL_PLATFORMS || []).map(p => (
            <Field key={p.key} label={p.label}>
              <input className={inputCls} value={form.socials[p.key]??""} placeholder={p.placeholder}
                onChange={e => set("socials", { ...form.socials, [p.key]:e.target.value })} />
            </Field>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepColors({ form, set }: { form:Form; set:SetFn }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-semibold">Quick palettes</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(PRESET_PALETTES || []).map(p => {
            const active = p.primary===form.color_primary && p.accent===form.color_accent;
            return (
              <button key={p.name} type="button" onClick={() => { set("color_primary",p.primary); set("color_accent",p.accent); }}
                className={`hover-lift flex items-center gap-3 rounded-xl border p-3 text-left ${active?"border-primary shadow-glow":"bg-card"}`}>
                <span className="flex -space-x-2">
                  <span className="size-6 rounded-full border-2 border-card" style={{ background:p.primary }} />
                  <span className="size-6 rounded-full border-2 border-card" style={{ background:p.accent }} />
                </span>
                <span className="text-sm font-semibold">{p.name}</span>
                {active && <Check className="ml-auto size-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold">Primary colour</label>
          <HexColorPicker color={form.color_primary} onChange={c => set("color_primary",c)} style={{ width:"100%" }} />
          <input className={`${inputCls} mt-2`} value={form.color_primary} onChange={e => set("color_primary",e.target.value)} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Accent colour</label>
          <HexColorPicker color={form.color_accent} onChange={c => set("color_accent",c)} style={{ width:"100%" }} />
          <input className={`${inputCls} mt-2`} value={form.color_accent} onChange={e => set("color_accent",e.target.value)} />
        </div>
      </div>
      <div className="rounded-2xl p-6 text-center" style={{ background:`linear-gradient(135deg,${form.color_primary},${form.color_accent})`, color:readableOn(form.color_primary) }}>
        <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Live preview</p>
        <p className="mt-2 text-2xl font-extrabold">{form.name||"Your Business"}</p>
        <span className="mt-4 inline-block rounded-full px-5 py-2 text-sm font-bold" style={{ background:readableOn(form.color_primary), color:form.color_primary }}>Book Now</span>
      </div>
    </div>
  );
}

function StepBooking({ form, set }: { form:Form; set:SetFn }) {
  const slots = buildTimeSlots(form.start_time, form.end_time, form.slot_duration_mins);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border bg-card p-4">
        <div>
          <p className="font-semibold">Enable bookings or reservations?</p>
          <p className="text-sm text-muted-foreground">Add a booking section to your public page.</p>
        </div>
        <button type="button" onClick={() => set("bookingEnabled",!form.bookingEnabled)}
          className={`relative h-6 w-10 rounded-full transition ${form.bookingEnabled?"bg-primary":"bg-muted-foreground/30"}`}>
          <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition ${form.bookingEnabled?"left-4.5":"left-0.5"}`} style={{ left:form.bookingEnabled?'calc(100% - 22px)':'2px' }} />
        </button>
      </div>
      {form.bookingEnabled && (
        <div className="space-y-5">
          <Field label="Booking type">
            <div className="grid gap-3 sm:grid-cols-2">
              {[{ id:"appointment",label:"Appointment slots",hint:"Massage, salon, clinic"},{ id:"reservation",label:"Table reservation",hint:"Restaurant, café, bar"}].map(t => (
                <button key={t.id} type="button" onClick={() => set("booking_type",t.id)}
                  className={`rounded-xl border p-4 text-left ${form.booking_type===t.id?"border-primary shadow-glow":"bg-card"}`}>
                  <p className="font-semibold">{t.label}</p><p className="text-xs text-muted-foreground">{t.hint}</p>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Available days">
            <div className="flex flex-wrap gap-2">
              {(DAYS || []).map(d => { const on=form.available_days.includes(d);
                return <button key={d} type="button" onClick={() => set("available_days", on?form.available_days.filter(x=>x!==d):[...form.available_days,d])}
                  className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${on?"bg-primary text-white":"bg-card text-muted-foreground"}`}>{d}</button>; })}
            </div>
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Opens at"><input type="time" className={inputCls} value={form.start_time} onChange={e => set("start_time",e.target.value)} /></Field>
            <Field label="Closes at"><input type="time" className={inputCls} value={form.end_time} onChange={e => set("end_time",e.target.value)} /></Field>
            <Field label="Slot length (mins)"><input type="number" min={15} step={15} className={inputCls} value={form.slot_duration_mins} onChange={e => set("slot_duration_mins",Number(e.target.value)||60)} /></Field>
            <Field label="Max capacity per slot"><input type="number" min={1} className={inputCls} value={form.max_capacity} onChange={e => set("max_capacity",Number(e.target.value)||1)} /></Field>
          </div>
          <div className="rounded-xl border bg-muted/40 p-4">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">{slots.length} slots per day</p>
            <div className="flex flex-wrap gap-1.5">{slots.slice(0,12).map(s => <span key={s} className="rounded-md bg-card px-2 py-1 text-xs">{s}</span>)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepAi({ ai, setAi, generating, onGenerate, businessName }: { ai:AiContent|null; setAi:(v:AiContent)=>void; generating:boolean; onGenerate:()=>void; businessName:string }) {
  return (
    <div className="space-y-6">
      {!ai && !generating && (
        <div className="py-8 text-center">
          <div className="bg-brand-gradient mx-auto grid size-16 place-items-center rounded-2xl text-white"><Wand2 className="size-7" /></div>
          <h2 className="mt-5 text-xl font-extrabold">Let AI write your page</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">We'll craft a headline, tagline, bio and services for {businessName||"your business"}.</p>
          <button onClick={onGenerate} className="hover-lift shadow-glow mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white">
            <Sparkles className="size-4" /> Generate My Business Page
          </button>
        </div>
      )}
      {generating && (
        <div className="py-16 text-center">
          <motion.div animate={{ rotate:360 }} transition={{ duration:2.4, repeat:Infinity, ease:"linear" }}
            className="bg-brand-gradient mx-auto grid size-16 place-items-center rounded-2xl text-white"><Sparkles className="size-7" /></motion.div>
          <p className="mt-6 font-semibold">AI is building your page...</p>
          <div className="mx-auto mt-4 h-1.5 w-52 overflow-hidden rounded-full bg-muted">
            <motion.div className="bg-brand-gradient h-full w-1/3" animate={{ x:["-100%","300%"] }} transition={{ duration:1.5, repeat:Infinity, ease:"easeInOut" }} />
          </div>
        </div>
      )}
      {ai && !generating && (
        <div className="space-y-5">
          <Field label="Hero headline"><input className={inputCls} value={ai.headline} onChange={e => setAi({ ...ai, headline:e.target.value })} /></Field>
          <Field label="Tagline"><input className={inputCls} value={ai.tagline} onChange={e => setAi({ ...ai, tagline:e.target.value })} /></Field>
          <Field label="Business bio"><textarea className={textareaCls} rows={6} value={ai.bio} onChange={e => setAi({ ...ai, bio:e.target.value })} /></Field>
          <div>
            <p className="mb-3 text-sm font-semibold">Services</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {(ai.services ?? []).map((s,i) => (
                <div key={i} className="rounded-xl border bg-card p-4">
                  <input className={`${inputCls} mb-2 font-semibold`} value={s.title} onChange={e => { const n=[...ai.services]; n[i]={...s,title:e.target.value}; setAi({...ai,services:n}); }} />
                  <textarea className={textareaCls} rows={2} value={s.description} onChange={e => { const n=[...ai.services]; n[i]={...s,description:e.target.value}; setAi({...ai,services:n}); }} />
                </div>
              ))}
            </div>
          </div>
          <button onClick={onGenerate} className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted">
            <Wand2 className="size-4" /> Regenerate
          </button>
        </div>
      )}
    </div>
  );
}

function StepPreview({ form, ai }: { form:Form; ai:AiContent|null }) {
  const cover = form.cover_url ? getPublicUrl(form.cover_url) : null;
  const logo = form.logo_url ? getPublicUrl(form.logo_url) : null;
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">This is how your page opens. Publish to make it live at bizcard.ai/{form.slug}.</p>
      <div className="shadow-elevated overflow-hidden rounded-2xl border">
        <div className="relative flex min-h-56 flex-col justify-end p-6" style={{
          background: cover ? `linear-gradient(0deg,${hexToRgba(form.color_primary,0.85)},${hexToRgba(form.color_accent,0.45)}),url(${cover}) center/cover` : `linear-gradient(135deg,${form.color_primary},${form.color_accent})`,
          color: readableOn(form.color_primary),
        }}>
          {logo && <img src={logo} alt="Logo" className="mb-3 size-14 rounded-2xl border-2 border-white/60 object-cover" />}
          <h3 className="text-2xl font-extrabold">{ai?.headline||form.name||"Your Business"}</h3>
          <p className="mt-1 text-sm opacity-90">{ai?.tagline||form.short_desc}</p>
        </div>
        <div className="space-y-3 bg-card p-6">
          <p className="whitespace-pre-line text-sm text-muted-foreground">{ai?.bio||form.long_desc||form.short_desc}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(ai?.services??[]).map(s => (
              <div key={s.title} className="rounded-xl border p-3">
                <p className="text-sm font-bold">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
