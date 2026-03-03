import { Hero } from "@/components/landing/hero";
import { StatsBar } from "@/components/landing/stats-bar";
import { ProductIntro } from "@/components/landing/product-intro";
import { ProductShowcase } from "@/components/landing/prodcut-showcase";
import { Testimonials } from "@/components/landing/testimonials";
import { PricingSection } from "@/components/landing/pricing-section";
import { FinalCTA } from "@/components/landing/final-cta";
import { LandingNavbar } from "@/components/landing/landing-navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-50">
      <LandingNavbar />
      <div className="pt-24">
        <Hero />
        <StatsBar />
        <section id="how-it-works">
          <ProductIntro />
        </section>
        <section id="features">
          <ProductShowcase />
        </section>
        <Testimonials />
        <section id="pricing">
          <PricingSection />
        </section>
        <FinalCTA />
      </div>
    </main>
  );
}
