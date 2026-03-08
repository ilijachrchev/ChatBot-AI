import { HeroSection } from "@/components/landing/improved-landing/hero-section";
import { BentoFeatures } from "@/components/landing/improved-landing/bento-features";
import { HowItWorks } from "@/components/landing/improved-landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { PricingSection } from "@/components/landing/pricing-section";
import { FinalCTA } from "@/components/landing/final-cta";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080808] text-slate-50">
      <HeroSection />
      <BentoFeatures />
      <section id="how-it-works">
        <HowItWorks />
      </section>
      <Testimonials />
      <section id="pricing">
        <PricingSection />
      </section>
      <FinalCTA />
    </main>
  );
}