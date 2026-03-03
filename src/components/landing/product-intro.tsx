"use client";

import { Globe, BookOpen, Code } from "lucide-react";

const steps = [
  {
    icon: Globe,
    title: "Add your domain",
    description:
      "Enter your website domain and upload your logo. SendWise AI creates a dedicated chatbot for your business.",
  },
  {
    icon: BookOpen,
    title: "Train your chatbot",
    description:
      "Upload FAQs, docs, or let AI scrape your website. Your bot learns your business inside out.",
  },
  {
    icon: Code,
    title: "Embed and go live",
    description:
      "Copy one line of code into your website. Available in 15 languages including React, Vue, and plain JS.",
  },
];

export const ProductIntro = () => {
  return (
    <section className="relative px-4 py-16 md:py-24 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#020617] via-slate-900/60 to-[#020617]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-16 md:mb-20 text-center animate-fade-in-up">
          <div className="mb-4 inline-block">
            <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-300">
              How it works
            </span>
          </div>
          <h2 className="mb-4 text-3xl md:text-5xl font-bold text-slate-50">
            Set up your AI chatbot in minutes
          </h2>
          <p className="mx-auto max-w-2xl text-base md:text-xl text-slate-400">
            No technical knowledge required. If you can copy and paste, you can
            deploy SendWise AI.
          </p>
        </div>

        <div className="mb-10 text-center animate-fade-in">
          <div className="mb-3 inline-block">
            <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
              Simple setup
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-50">
            From sign-up to live chatbot in 3 steps
          </h3>
          <p className="mt-2 text-base text-slate-400">
            No developers needed. No complex configuration.
          </p>
        </div>

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
    </section>
  );
};
