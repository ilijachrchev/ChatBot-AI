"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative bg-[#080808] py-32 px-4 overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none blur-[120px]"
        style={{ background: "radial-gradient(ellipse, rgba(255,255,255,0.05) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
        <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.05]">
          Ready to automate your
          <br />
          <span className="text-white/30">customer service?</span>
        </h2>

        <p className="text-white/35 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
          Join businesses already using SendWise AI to handle support, book
          appointments, and grow — on autopilot.
        </p>

        <div className="flex flex-col items-center gap-4">
          <Link
            href="/auth/sign-up"
            className="flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-black hover:bg-white/90 transition-all"
          >
            Start for free <ArrowRight className="size-3.5" />
          </Link>
          <p className="text-xs text-white/25">
            No credit card required · Cancel anytime · Live in 5 minutes
          </p>
        </div>
      </div>
    </section>
  );
}