"use client";
import { HyperText } from "@/components/ui/hyper-text"

// ─── MARQUEE ANIMATION TODO ────────────────────────────────────────────────────
// When ready to implement scrolling logos:
//
// 1. Add to tailwind.config.ts → theme.extend:
//    keyframes: {
//      marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } }
//    },
//    animation: { marquee: "marquee 28s linear infinite" }
//
// 2. Replace the static strip below with:
//    <div className="flex w-[200%] animate-marquee">
//      {[...logos, ...logos].map((logo, i) => (
//        <div key={i} className="flex shrink-0 items-center justify-center px-12 opacity-25 grayscale">
//          <img src={logo.src} alt={logo.name} className="h-5 w-auto" />
//        </div>
//      ))}
//    </div>
//
// 3. Add SVG logos to /public/logos/ and define:
//    const logos = [
//      { name: "GitHub",   src: "/logos/github.svg" },
//      { name: "Vercel",   src: "/logos/vercel.svg" },
//      ...
//    ]
// ──────────────────────────────────────────────────────────────────────────────

export function TrustedBy() {
  return (
    <section className="relative bg-[#080808] py-14 overflow-hidden">

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Side fade masks */}
      <div className="absolute inset-y-0 left-0 w-48 pointer-events-none z-20"
        style={{ background: "linear-gradient(to right, #080808, transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-48 pointer-events-none z-20"
        style={{ background: "linear-gradient(to left, #080808, transparent)" }} />

      {/* Notch label */}
      <div className="relative z-10 flex justify-center mb-10">
        <div
          className="px-8 py-2.5 text-sm text-white/40 border border-white/8 bg-[#080808] font-medium"
          style={{ clipPath: "polygon(16px 0%, calc(100% - 16px) 0%, 100% 100%, 0% 100%)" }}
        >
          {/*
            ── TEXT ANIMATION TODO ────────────────────────────────────────────
            Framer Motion entrance:
              <motion.p initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>

            Pure CSS — add to globals.css:
              @keyframes fadeSlideUp {
                from { opacity:0; transform:translateY(6px) }
                to   { opacity:1; transform:translateY(0) }
              }
              .animate-fade-slide-up { animation: fadeSlideUp 0.5s ease forwards }
            ──────────────────────────────────────────────────────────────────
          */}
            <HyperText>Be among the first to trust us</HyperText>
        </div>
      </div>

      {/* Static logo strip — swap for marquee above when ready */}
      <div className="relative z-10 flex items-center justify-center gap-10 px-8">
        <div className="flex flex-wrap items-center justify-center gap-10 opacity-25 grayscale select-none">
          <span className="text-white font-semibold text-sm tracking-wide">GitHub</span>
          <span className="text-white font-semibold text-sm tracking-wide">Claude</span>
          <span className="text-white font-semibold text-sm tracking-wide">Clerk</span>
          <span className="text-white font-semibold text-sm tracking-wide">Stripe</span>
          <span className="text-white font-semibold text-sm tracking-wide">Vercel</span>
          <span className="text-white font-semibold text-sm tracking-wide">OpenAI</span>
          <span className="text-white font-semibold text-sm tracking-wide">Supabase</span>
        </div>
      </div>

    </section>
  );
}
        