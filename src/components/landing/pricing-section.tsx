"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PLAN_FEATURES, PLAN_PRICES } from "@/constants/pricing";
import { LandingButton } from "../ui/button-landing";

const pricingCards = [
  {
    title: "Standard",
    description: PLAN_FEATURES.STANDARD.description,
    price: PLAN_PRICES.STANDARD.amountDisplay,
    features: PLAN_FEATURES.STANDARD.included,
  },
  {
    title: "Pro",
    description: PLAN_FEATURES.PRO.description,
    price: PLAN_PRICES.PRO.amountDisplay,
    features: PLAN_FEATURES.PRO.included,
  },
  {
    title: "Ultimate",
    description: PLAN_FEATURES.ULTIMATE.description,
    price: PLAN_PRICES.ULTIMATE.amountDisplay,
    features: PLAN_FEATURES.ULTIMATE.included,
  },
];

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your dashboard at any time. No contracts.",
  },
  {
    q: "Do I need to enter a credit card to start?",
    a: "No. The Standard plan is completely free with no card required.",
  },
  {
    q: "What happens when I hit my conversation limit?",
    a: "Your chatbot will politely inform visitors the limit has been reached. Upgrade anytime to restore service immediately.",
  },
];

export const PricingSection = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-slate-900/80 to-[#020617]" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-50 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-slate-400">
            Start free. Upgrade when you need more. Cancel anytime — no
            questions asked.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingCards.map((card) => (
            <Card
              key={card.title}
              className={cn(
                "relative bg-slate-950/80 border border-slate-700 rounded-3xl flex flex-col justify-between p-6",
                card.title === "Pro" &&
                  "border-sky-500 shadow-[0_0_40px_rgba(56,189,248,0.45)]",
                card.title === "Ultimate" &&
                  "border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.3)]"
              )}
            >
              {card.title === "Pro" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-sky-500 text-xs font-semibold text-slate-950">
                  Most Popular
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-slate-50">{card.title}</CardTitle>
                <CardDescription className="text-slate-400">
                  {card.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-slate-50">
                    {card.price}
                  </span>
                  <span className="text-slate-500">/ month</span>
                </div>

                <div className="space-y-2 text-sm text-slate-300">
                  {card.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-sky-400 shrink-0" />
                      <p>{feature}</p>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="mt-6">
                <LandingButton
                  asChild
                  className="w-full"
                  variant={card.title === "Pro" ? "neon" : "neonOutline"}
                  size="lg"
                >
                  <Link href="/auth/sign-up">Get Started</Link>
                </LandingButton>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-slate-50 text-center mb-8">
            Frequently asked questions
          </h3>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-slate-700 rounded-xl overflow-hidden bg-slate-950/50"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-100">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ml-4",
                      openFaq === i && "rotate-180"
                    )}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm text-slate-400 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
