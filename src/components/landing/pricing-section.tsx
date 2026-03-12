import { cn } from "@/lib/utils";
import * as PricingCard from "@/components/ui/pricing-card";
import { CheckmarkCircle04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

export function PricingSection() {
  return (
    <section id="pricing" className="relative bg-[var(--bg-page)] py-28 px-4">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] pointer-events-none blur-[120px]"
        style={{ background: "radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)" }}
      />

      <div className="mx-auto mb-12 max-w-xl space-y-4 text-center relative z-10">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/50">
          Pricing
        </div>
        <h2 className="font-bold text-3xl text-white tracking-tight md:text-5xl">
          Plans that Scale with You
        </h2>
        <p className="text-white/35 text-sm leading-relaxed md:text-base">
          Whether you&apos;re just starting out or growing fast, our flexible
          pricing has you covered.
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-4xl gap-4 px-4 md:grid-cols-3 relative z-10">
        {plans.map((plan, index) => (
          <PricingCard.Card
            className={cn(
              "w-full max-w-full border-white/[0.07] bg-white/[0.02]",
              index === 1 && "md:scale-105 border-white/15 bg-white/[0.04]"
            )}
            key={plan.name}
          >
            <PricingCard.Header
              isPopular={index === 1}
              className={cn(
                "border-white/[0.06]",
                index === 1 ? "bg-white/[0.05]" : "bg-transparent"
              )}
            >
              <PricingCard.Plan>
                <PricingCard.PlanName className="text-white/80 text-sm font-semibold">
                  <span>{plan.name}</span>
                </PricingCard.PlanName>
                {plan.badge && (
                  <PricingCard.Badge className="border-white/10 bg-white/10 text-white/70 text-[10px]">
                    {plan.badge}
                  </PricingCard.Badge>
                )}
              </PricingCard.Plan>

              <PricingCard.Price>
                <PricingCard.MainPrice className="text-white">
                  {plan.price}
                </PricingCard.MainPrice>
                {plan.period && (
                  <PricingCard.Period className="text-white/35 text-sm pb-1">
                    {plan.period}
                  </PricingCard.Period>
                )}
                {plan.original && (
                  <PricingCard.OriginalPrice className="text-white/20 text-base ml-auto line-through">
                    {plan.original}
                  </PricingCard.OriginalPrice>
                )}
              </PricingCard.Price>

              <Link
                href="/auth/sign-up"
                className={cn(
                  "mt-1 flex w-full items-center justify-center rounded-lg border py-2 text-sm font-semibold transition-all",
                  index === 1
                    ? "border-white bg-white text-black hover:bg-white/90"
                    : "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/8 hover:text-white"
                )}
              >
                Get Started
              </Link>
            </PricingCard.Header>

            <PricingCard.Body>
              <PricingCard.Description className="text-white/30 text-xs">
                {plan.description}
              </PricingCard.Description>
              <PricingCard.List>
                {plan.features.map((item) => (
                  <PricingCard.ListItem className="text-white/45 text-xs" key={item}>
                    <HugeiconsIcon
                      icon={CheckmarkCircle04Icon}
                      strokeWidth={2}
                      aria-hidden="true"
                      className="size-3.5 text-white/50 shrink-0 mt-px"
                    />
                    <span>{item}</span>
                  </PricingCard.ListItem>
                ))}
              </PricingCard.List>
            </PricingCard.Body>
          </PricingCard.Card>
        ))}
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Standard",
    description: "Get started for free — no card required",
    price: "Free",
    original: undefined,
    period: "forever",
    badge: undefined,
    features: [
      "1 domain & 1 chatbot",
      "10 conversations / month",
      "Basic AI responses",
      "Embed code (15 languages)",
      "1 email campaign / month",
      "Community support",
    ],
  },
  {
    name: "Pro",
    description: "For growing businesses that need real automation",
    price: "$35",
    original: "$49",
    period: "/month",
    badge: "Popular",
    features: [
      "2 domains & 2 chatbots",
      "2,000 conversations / month",
      "Knowledge base (file uploads)",
      "Human handoff & live chat",
      "Custom AI persona & branding",
      "5 email campaigns / month",
      "Appointment booking",
      "Working hours & availability",
      "All 15 embed languages",
      "Priority email support",
    ],
  },
  {
    name: "Ultimate",
    description: "For agencies and power users — no limits",
    price: "$55",
    original: "$79",
    period: "/month",
    badge: undefined,
    features: [
      "Unlimited domains & chatbots",
      "Unlimited conversations",
      "Everything in Pro",
      "Website scraping for knowledge base",
      "Unlimited email campaigns",
      "Integrations (coming soon)",
      "Priority support",
    ],
  },
];