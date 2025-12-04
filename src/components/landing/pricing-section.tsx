"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { pricingCards } from "@/constants/landing-page";
import { LandingButton } from "../ui/button-landing";

export const PricingSection = () => {
  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-slate-900/80 to-[#020617]" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-50 mb-4">
            Choose the plan that fits you
          </h2>
          <p className="text-lg text-slate-400">
            Simple pricing to grow from your first campaign to fully automated email marketing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingCards.map((card) => (
            <Card
              key={card.title}
              className={clsx(
                "relative bg-slate-950/80 border border-slate-700 rounded-3xl flex flex-col justify-between p-6",
                card.title === "Ultimate" &&
                  "border-sky-500 shadow-[0_0_40px_rgba(56,189,248,0.45)]"
              )}
            >
              {card.title === "Ultimate" && (
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
                      <Check className="h-4 w-4 text-sky-400" />
                      <p>{feature}</p>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="mt-6">
                <LandingButton
                    asChild
                    className="w-full"
                    variant={card.title === "Ultimate" ? "neon" : "neonOutline"}
                    size="lg"
                >
                    <Link href={`/auth/sign-up`}>
                        Get Started
                    </Link>
                </LandingButton>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
