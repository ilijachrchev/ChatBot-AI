import NavBar from "@/components/navbar";
import { Hero } from "@/components/landing/hero";
import { ProductIntro } from "@/components/landing/product-intro";
import { ProductShowcase } from "@/components/landing/prodcut-showcase";
import { PricingSection } from "@/components/landing/pricing-section";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-50">
      <NavBar />
      <Hero />
      <ProductIntro />
      <ProductShowcase />
      <PricingSection />
    </main>
  );
}
