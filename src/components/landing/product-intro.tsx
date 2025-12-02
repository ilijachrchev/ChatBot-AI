"use client";

import { CheckCircle2, Target, Palette, Rocket } from "lucide-react";
import { LandingButton } from "../ui/button-landing";

export const ProductIntro = () => {
  const steps = [
    {
      icon: Target,
      title: "Define your goal",
      description: "Sales, onboarding, newsletters, reminders"
    },
    {
      icon: Palette,
      title: "Show your style",
      description: "Let AI learn from your website or past emails"
    },
    {
      icon: Rocket,
      title: "Launch & optimize",
      description: "AI improves your campaigns automatically"
    }
  ];

  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-slate-900/60 to-[#020617]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Product description */}
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="inline-block mb-6">
            <span className="text-sm font-semibold text-sky-300 bg-sky-500/10 px-4 py-2 rounded-full border border-sky-500/40">
              Introducing SendWise-AI
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-50">
            Your All-in-One AI Email Assistant
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            SendWise-AI generates sequences, writes persuasive copy, automates sending, and adapts to customer behavior.
          </p>
        </div>

        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center mb-12 text-slate-50 animate-fade-in">
            3-Step How It Works
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="relative group animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-sky-500 to-violet-500 opacity-30" />
                  )}

                  <div className="relative bg-slate-950/60 border-2 border-slate-700 rounded-2xl p-8 hover:border-sky-500/70 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.35)]">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-sky-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6 text-sky-400" />
                      </div>
                      <span className="text-5xl font-bold text-sky-500/20">
                        {i + 1}
                      </span>
                    </div>
                    <h4 className="text-xl font-semibold mb-3 text-slate-50">
                      {step.title}
                    </h4>
                    <p className="text-slate-400">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-950/70 to-slate-900/70 border-2 border-sky-500/20 rounded-2xl p-10 mb-12 animate-fade-in delay-300">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-sky-500/15 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-8 h-8 text-sky-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-sky-300 mb-2">
                Founder's Message
              </p>
              <blockquote className="text-lg text-slate-100 italic">
                "I built SendWise-AI because manual email writing destroys productivity.
                AI should do the repetitive work, so you can focus on growth, not your inbox."
              </blockquote>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center animate-fade-in delay-500">
          <div className="bg-gradient-to-r from-sky-500/10 to-violet-500/10 border-2 border-sky-500/40 rounded-2xl p-12">
            <LandingButton variant="neon" size="xl" className="mb-4">
                Start Using SendWise-AI Today
            </LandingButton>
            <p className="text-sky-200 font-semibold">
              Launch your first AI-optimized sequence in 5 minutes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
