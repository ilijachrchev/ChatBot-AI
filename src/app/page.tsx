import NavBar from "@/components/navbar";
import { Hero } from "@/components/landing/hero";
import { ProductIntro } from "@/components/landing/product-intro";
import { ProductShowcase } from "@/components/landing/prodcut-showcase";
import { PricingSection } from "@/components/landing/pricing-section";
import { FinalCTA } from "@/components/landing/final-cta";
import { LandingNavbar } from "@/components/landing/landing-navbar";

export default function Home() {
  return (
     <main className="min-h-screen bg-[#020617] text-slate-50">
      <LandingNavbar />
      <div className="pt-20">
        <Hero />
        <section id="how-it-works">
          <ProductIntro />
        </section>
        <section id="pricing">
          <PricingSection />
        </section>
        <section id="features">
          <ProductShowcase />
        </section>
        <FinalCTA />
      </div>
    </main>
  );
}
