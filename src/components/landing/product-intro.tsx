"use client";

import { CheckCircle2, Target, Palette, Rocket } from "lucide-react";
import { LandingButton } from "../ui/button-landing";
import Link from "next/link";

export const ProductIntro = () => {
  const steps = [
    {
      icon: Target,
      title: "Define your goal",
      description: "Sales, onboarding, newsletters, reminders",
    },
    {
      icon: Palette,
      title: "Show your style",
      description: "Let AI learn from your website or past emails",
    },
    {
      icon: Rocket,
      title: "Launch & optimize",
      description: "AI improves your campaigns automatically",
    },
  ];

  return (
    <section className="relative px-4 py-16 md:py-24 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#020617] via-slate-900/60 to-[#020617]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-16 md:mb-20 text-center animate-fade-in-up">
          <div className="mb-6 inline-block">
            <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-300">
              Introducing SendWise-AI
            </span>
          </div>
          <h2 className="mb-6 text-3xl md:text-5xl font-bold text-slate-50">
            Your All-in-One AI Email Assistant
          </h2>
          <p className="mx-auto max-w-3xl text-base md:text-xl text-slate-400">
            SendWise-AI generates sequences, writes persuasive copy, automates
            sending, and adapts to customer behavior.
          </p>
        </div>

        <div className="mb-16 md:mb-20">
          <h3 className="mb-10 md:mb-12 text-center text-2xl md:text-3xl font-bold text-slate-50 animate-fade-in">
            3-Step How It Works
          </h3>

          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="group relative animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {i < steps.length - 1 && (
                    <div className="pointer-events-none absolute top-12 left-[60%] hidden h-0.5 w-full bg-gradient-to-r from-sky-500 to-violet-500 opacity-30 md:block" />
                  )}

                  <div className="relative rounded-2xl border-2 border-slate-700 bg-slate-950/60 p-6 md:p-8 transition-all duration-300 hover:border-sky-500/70 hover:shadow-[0_0_30px_rgba(59,130,246,0.35)]">
                    <div className="mb-4 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/15 transition-transform group-hover:scale-110">
                        <Icon className="h-6 w-6 text-sky-400" />
                      </div>
                      <span className="text-4xl md:text-5xl font-bold text-sky-500/20">
                        {i + 1}
                      </span>
                    </div>
                    <h4 className="mb-2 md:mb-3 text-lg md:text-xl font-semibold text-slate-50">
                      {step.title}
                    </h4>
                    <p className="text-sm md:text-base text-slate-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-10 md:mb-12 animate-fade-in delay-300 rounded-2xl border-2 border-sky-500/20 bg-gradient-to-br from-slate-950/70 to-slate-900/70 p-6 md:p-10">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sky-500/15">
              <CheckCircle2 className="h-8 w-8 text-sky-400" />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-sky-300">
                Founder's Message
              </p>
              <blockquote className="text-base md:text-lg italic text-slate-100">
                "I built SendWise-AI because manual email writing destroys
                productivity. AI should do the repetitive work, so you can focus
                on growth, not your inbox."
              </blockquote>
            </div>
          </div>
        </div>

        <div className="text-center animate-fade-in delay-500">
          <div className="rounded-2xl border-2 border-sky-500/40 bg-gradient-to-r from-sky-500/10 to-violet-500/10 p-6 md:p-10">
            <LandingButton variant="neon" size="xl" className="mb-4 w-full max-w-xs sm:msx-w-none mx-auto md:whitespace-nowrap">
              <Link href="/auth/sign-up">
                Start Using SendWise-AI Today
              </Link>
            </LandingButton>
            <p className="text-sm md:text-base font-semibold text-sky-200">
              Launch your first AI-optimized sequence in 5 minutes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
