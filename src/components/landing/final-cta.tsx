"use client";

import Link from "next/link";
import { LandingButton } from "@/components/ui/button-landing";

export const FinalCTA = () => {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-[#020617] to-violet-500/10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/30 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/30 rounded-full blur-[150px] animate-pulse delay-1000" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="mb-8 animate-fade-in-up">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-50 via-sky-400 to-violet-400 bg-clip-text text-transparent">
            Ready to automate your customer service?
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Join businesses already using SendWise AI to handle support, book
            appointments, and grow — on autopilot.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 animate-fade-in delay-300">
          <LandingButton variant="neon" size="xl" asChild>
            <Link href="/auth/sign-up">Start for free →</Link>
          </LandingButton>

          <p className="text-sm text-slate-400">
            No credit card required • Cancel anytime • Live in 5 minutes
          </p>
        </div>
      </div>
    </section>
  );
};
