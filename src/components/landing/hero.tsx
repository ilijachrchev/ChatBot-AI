"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { LandingButton } from "../ui/button-landing";
import Link from "next/link";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-24 pb-24">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#020617] to-slate-950" />

      <div className="pointer-events-none absolute -top-40 -left-20 h-72 w-72 rounded-full bg-sky-500/30 blur-3xl opacity-70" />
      <div className="pointer-events-none absolute top-0 right-[-80px] h-72 w-72 rounded-full bg-violet-500/30 blur-3xl opacity-70" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 text-center lg:text-left space-y-6">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-sky-300 bg-sky-500/10 border border-sky-500/40 px-3 py-1 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            AI-powered sales & email assistant
          </span>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-50">
            Stop guessing your marketing.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">
              Let AI do the heavy lifting.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0">
            SendWise-AI writes, schedules, and optimizes your emails automatically,
            so you close more deals with less manual work.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <LandingButton variant="neon" size="xl">
              <Link href="/auth/sign-up">
                Start Using SendWise-AI
              </Link>
            </LandingButton>

            <LandingButton variant="neonOutline" size="lg" asChild>
                <a href="#demo">Watch product demo</a>
            </LandingButton>
        </div>

          <p className="text-xs text-slate-500">
            No credit card required • 5-minute setup • Cancel anytime
          </p>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="relative w-[320px] sm:w-[380px]">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-sky-500/40 via-transparent to-violet-500/40 blur-2xl" />
            <div className="relative rounded-[2rem] border border-slate-700/70 bg-slate-900/70 shadow-2xl overflow-hidden">
              <Image
                src="/images/iphonecorinna.png"
                alt="SendWise-AI assistant UI"
                width={400}
                height={800}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
