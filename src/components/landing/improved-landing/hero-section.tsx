"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed z-50 flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? "rounded-2xl border border-white/10 bg-black/80 px-6 py-3 shadow-2xl backdrop-blur-xl"
            : "left-0 right-0 top-0 px-8 py-5 bg-transparent"
        }`}
        style={
          scrolled
            ? {
                top: "12px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "min(700px, calc(100vw - 32px))",
              }
            : {}
        }
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-white/10">
            <Sparkles className="size-3.5 text-white" />
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">
            SendWise AI
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features"     className="text-sm text-white/50 hover:text-white transition-colors">Features</Link>
          <Link href="#how-it-works" className="text-sm text-white/50 hover:text-white transition-colors">How it works</Link>
          <Link href="#pricing"      className="text-sm text-white/50 hover:text-white transition-colors">Pricing</Link>
          <Link href="#faq"          className="text-sm text-white/50 hover:text-white transition-colors">FAQ</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/sign-in"
            className="hidden md:block text-sm text-white/50 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            href="/auth/sign-up"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </header>

      <section className="relative min-h-screen bg-[var(--bg-page)] overflow-hidden flex flex-col items-center justify-start px-4 pt-32 pb-0">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px]"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(255,255,255,0.08) 0%, transparent 70%)",
            }}
          />
        </div>

        <Link
          href="/auth/sign-up"
          className="relative z-10 mb-8 flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-sm hover:border-white/20 transition-colors"
        >
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
            NOW
          </span>
          <span className="text-xs text-white/45">
            accepting new businesses — Start free, no credit card needed
          </span>
          <ArrowRight className="size-3 text-white/50" />
        </Link>

        <div className="relative z-10 text-center max-w-4xl">
          <h1 className="text-5xl md:text-[72px] font-bold text-white leading-[1.05] tracking-tight">
            Your Website Deserves
            <br />
            <span className="text-white/30">a Smarter Chatbot</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-white/35 max-w-xl mx-auto leading-relaxed">
            Deploy an AI chatbot on any website in minutes. It answers
            questions, books appointments, and hands off to your team —
            automatically.
          </p>
        </div>

        <div className="relative z-10 mt-10 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="#how-it-works"
            className="flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-6 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all backdrop-blur-sm"
          >
            <span className="size-1.5 rounded-full bg-white/30" />
            See how it works
          </Link>
          <Link
            href="/auth/sign-up"
            className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-white/90 transition-all"
          >
            Get started <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="relative z-10 mt-20 w-full max-w-5xl px-4 md:px-0">
          <div
            className="absolute -top-8 left-1/2 -translate-x-1/2 w-2/3 h-16 blur-3xl rounded-full pointer-events-none"
            style={{ background: "rgba(255,255,255,0.03)" }}
          />
          <div className="relative rounded-t-2xl border border-b-0 border-white/8 bg-white/[0.015]">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
              <div className="size-2.5 rounded-full bg-white/10" />
              <div className="size-2.5 rounded-full bg-white/10" />
              <div className="size-2.5 rounded-full bg-white/10" />
              <div className="ml-3 flex-1 max-w-xs rounded-md bg-white/[0.04] px-3 py-1 text-[11px] text-white/20">
                app.sendwiseai.com/dashboard
              </div>
            </div>
            <img
              src="/images/dashboard_image.png"
              alt="SendWise AI Dashboard"
              className="w-full object-cover object-top block"
              style={{ aspectRatio: "16/9" }}
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
              style={{ background: "linear-gradient(to bottom, transparent 0%, #080808 100%)" }}
            />
          </div>
        </div>
      </section>
    </>
  );
}