import { HeroSection } from "@/components/landing/improved-landing/hero-section";
import { BentoFeatures } from "@/components/landing/improved-landing/bento-features";
import { TrustedBy } from "@/components/landing/improved-landing/trusted-by";
import { HowItWorks } from "@/components/landing/improved-landing/how-it-works";
import { PricingSection } from "@/components/landing/pricing-section"; 
import { FaqsSection } from "@/components/landing/improved-landing/faqs-section";
import { FinalCTA } from "@/components/landing/final-cta"; 
import { Footer } from "@/components/landing/improved-landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)]">
      <HeroSection />
      <BentoFeatures />
      <TrustedBy />
      <HowItWorks />
      <PricingSection />
      <FaqsSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}