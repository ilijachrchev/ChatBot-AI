"use client";

import Link from "next/link";
import { LandingButton } from "../ui/button-landing";
import { Bot, Send, CheckCircle2 } from "lucide-react";

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
            AI-powered customer service platform
          </span>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-50">
            Your website deserves
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">
              a smarter chatbot.
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-lg mx-auto lg:mx-0">
            Deploy an AI chatbot on any website in minutes. It answers
            questions, books appointments, and hands off to your team —
            automatically.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <LandingButton variant="neon" size="xl" asChild>
              <Link href="/auth/sign-up">Start for free →</Link>
            </LandingButton>
            <LandingButton variant="neonOutline" size="lg" asChild>
              <a href="#how-it-works">See how it works</a>
            </LandingButton>
          </div>

          <p className="text-xs text-slate-500">
            No credit card required • Works on any website • 5-minute setup
          </p>
        </div>

        <div className="flex-1 flex justify-center lg:justify-end animate-fade-in-up delay-300">
          <div className="relative w-[320px] sm:w-[360px]">
            <div className="absolute -inset-6 bg-sky-500/20 blur-3xl rounded-full pointer-events-none" />

            <div className="relative rounded-2xl shadow-2xl ring-1 ring-sky-500/30 overflow-hidden">
              <div className="bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white leading-tight">
                      SendWise AI
                    </p>
                    <p className="text-[10px] text-white/70">Your assistant</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-white/80">Online</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 space-y-3">
                <div className="flex gap-2 items-end">
                  <div className="w-6 h-6 rounded-full bg-sky-500/30 flex items-center justify-center shrink-0">
                    <Bot className="h-3 w-3 text-sky-400" />
                  </div>
                  <div>
                    <div className="bg-slate-800 text-slate-100 rounded-2xl rounded-tl-sm p-3 text-sm max-w-[80%]">
                      Hi! 👋 How can I help you today?
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">just now</p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="bg-sky-500 text-white rounded-2xl rounded-tr-sm p-3 text-sm max-w-[75%]">
                    What are your pricing plans?
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">just now</p>
                </div>

                <div className="flex gap-2 items-end">
                  <div className="w-6 h-6 rounded-full bg-sky-500/30 flex items-center justify-center shrink-0">
                    <Bot className="h-3 w-3 text-sky-400" />
                  </div>
                  <div>
                    <div className="bg-slate-800 text-slate-100 rounded-2xl rounded-tl-sm p-3 text-sm max-w-[80%]">
                      We have 3 plans starting from free! Would you like me to
                      walk you through them?
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">just now</p>
                  </div>
                </div>

                <div className="flex gap-2 items-end">
                  <div className="w-6 h-6 rounded-full bg-sky-500/30 flex items-center justify-center shrink-0">
                    <Bot className="h-3 w-3 text-sky-400" />
                  </div>
                  <div className="bg-slate-800 rounded-2xl p-3">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-300" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border-t border-slate-800 px-4 py-3 flex items-center gap-2">
                <div className="flex-1 bg-slate-800 rounded-full px-4 py-2 text-sm text-slate-500">
                  Type a message...
                </div>
                <div className="w-9 h-9 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
                  <Send className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-slate-900 border border-slate-700 rounded-xl shadow-lg px-3 py-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-100">
                AI handled
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
