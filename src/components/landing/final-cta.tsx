"use client";

import { ArrowRight } from "lucide-react";
import { LandingButton } from "@/components/ui/button-landing";
import Link from "next/link";

export const FinalCTA = () => {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-[150px] animate-pulse delay-1000" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="mb-8 animate-fade-in-up">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Ready to scale your marketing with AI?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of founders who've automated their email marketing
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 animate-fade-in delay-300">
          <LandingButton
            variant="neon"
            size="xl"
            className="group"
          >
            <Link href="/auth/sign-up">
              Start Now
            </Link>
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </LandingButton>

          <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300" />
              5-minute setup
            </span>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/50 animate-fade-in delay-500">
          <p className="text-muted-foreground mb-6">
            Trusted by innovative companies
          </p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-50">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-24 bg-muted/30 rounded"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
