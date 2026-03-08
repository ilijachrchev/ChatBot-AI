"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { FullWidthDivider } from "@/components/ui/divider"; 
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, SearchRemoveIcon } from "@hugeicons/core-free-icons";

export function FaqsSection() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("all");

  const categories = [
    { id: "all", label: "All" },
    { id: "getting-started", label: "Getting Started" },
    { id: "features", label: "Features" },
    { id: "billing", label: "Billing" },
    { id: "support", label: "Support" },
  ];

  const filtered = faqs.filter((faq) => {
    const matchesCategory =
      activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="faq" className="relative bg-[#080808]">
      <div className="mx-auto min-h-screen w-full max-w-3xl md:border-x md:border-white/[0.06]">

        <div className="px-4 py-16 lg:px-6">
          <h2 className="mb-4 font-bold text-3xl text-white md:text-4xl tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mb-8 max-w-2xl text-white/40 text-sm leading-relaxed">
            Find answers to common questions about SendWise AI. Can&apos;t find
            what you&apos;re looking for? Our support team is here to help.
          </p>

          <InputGroup className="max-w-sm">
            <InputGroupInput
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search FAQs..."
              value={searchTerm}
              className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/25 focus:border-white/20"
            />
            <InputGroupAddon align="inline-start">
              <HugeiconsIcon
                icon={Search01Icon}
                strokeWidth={2}
                className="text-white/30"
              />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <FullWidthDivider contained className="bg-white/[0.06]" />

        <div className="flex flex-wrap gap-1 border-b border-white/[0.06] px-4 md:gap-3">
          {categories.map((cat) => (
            <button
              className="flex flex-col"
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              type="button"
            >
              <span
                className={cn(
                  "p-1 text-sm transition-colors hover:text-white md:p-2 md:text-base",
                  activeCategory === cat.id
                    ? "text-white"
                    : "text-white/35"
                )}
              >
                {cat.label}
              </span>
              {activeCategory === cat.id && (
                <span className="h-0.5 w-full rounded-full bg-white/60" />
              )}
            </button>
          ))}
        </div>

        <Accordion
          className="space-y-2 px-4 py-12 lg:px-6"
          collapsible
          defaultValue="item-1"
          type="single"
        >
          {filtered.map((faq) => (
            <AccordionItem
              className="rounded-md border border-white/[0.07] bg-white/[0.02] shadow outline-none last:border-b has-focus-visible:border-white/20 data-[state=open]:bg-white/[0.04]"
              key={faq.id}
              value={faq.id.toString()}
            >
              <AccordionTrigger className="px-4 text-white/80 hover:text-white hover:no-underline focus-visible:ring-0 text-sm">
                {faq.title}
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4 text-white/40 text-sm leading-relaxed">
                {faq.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {filtered.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="text-white/30" />
              </EmptyMedia>
              <EmptyTitle className="text-white/50">
                No FAQs found matching your search.
              </EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
              <Button
                onClick={() => setSearchTerm("")}
                variant="outline"
                className="border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/8 hover:text-white"
              >
                <HugeiconsIcon icon={SearchRemoveIcon} strokeWidth={2} />
                Clear search
              </Button>
            </EmptyContent>
          </Empty>
        )}

        <div className="flex items-center px-4 py-6 lg:px-6">
          <p className="text-white/30 text-sm">
            Can&apos;t find what you&apos;re looking for?{" "}
            <a
              className="text-white/60 hover:text-white underline underline-offset-2 transition-colors"
              href="mailto:support@sendwiseai.com"
            >
              Contact Us
            </a>
          </p>
        </div>

      </div>
    </section>
  );
}

const faqs = [
  {
    id: 1,
    category: "getting-started",
    title: "How do I add my chatbot to my website?",
    content:
      "After signing up, go to your dashboard and create a domain. Once created, navigate to the Embed section to get your one-line code snippet. Copy and paste it into your website's HTML — before the closing </body> tag. The chatbot will appear live within seconds. No developer needed.",
  },
  {
    id: 2,
    category: "getting-started",
    title: "Do I need technical knowledge to set up SendWise AI?",
    content:
      "Not at all. If you can copy and paste, you can deploy SendWise AI. The entire setup — from creating your domain to embedding the widget — takes under 5 minutes. No coding, no configuration files, no servers to manage.",
  },
  {
    id: 3,
    category: "getting-started",
    title: "How do I train my chatbot on my business content?",
    content:
      "Go to your domain's Knowledge Base section. You can upload files (PDFs, Word docs, text files), paste raw text, or — on the Ultimate plan — enter your website URL and let the AI scrape and learn from your pages automatically. The chatbot will start using that content to answer visitor questions immediately.",
  },
  {
    id: 4,
    category: "features",
    title: "What is human handoff and how does it work?",
    content:
      "Human handoff lets your team take over a live conversation from the AI at any moment. When a visitor's question is too complex or sensitive, you can click 'Take Over' in your dashboard's live chat panel. The visitor sees a seamless transition and can continue the conversation with a real person. You can hand back to AI at any time.",
  },
  {
    id: 5,
    category: "features",
    title: "Can I customize how the chatbot looks on my website?",
    content:
      "Yes. From the Appearance settings in your domain dashboard, you can change the chatbot's name, avatar, accent color, bubble style, widget position, welcome message, and operating hours. On the Pro and Ultimate plans you can also remove SendWise AI branding and apply a fully custom persona.",
  },
  {
    id: 6,
    category: "features",
    title: "What embed languages and frameworks are supported?",
    content:
      "SendWise AI supports 15+ languages and frameworks including plain HTML/JS, React, Next.js, Vue, Angular, Svelte, Nuxt, Remix, Astro, and more. Each has a dedicated code snippet generated automatically in your dashboard.",
  },
  {
    id: 7,
    category: "features",
    title: "What happens when I reach my monthly conversation limit?",
    content:
      "When your domain hits its monthly conversation limit, the chatbot will politely inform visitors that live support is temporarily unavailable. No conversations are lost — you'll receive a notification to upgrade. Upgrading your plan restores service immediately.",
  },
  {
    id: 8,
    category: "billing",
    title: "Is the Standard plan really free? Do I need a credit card?",
    content:
      "Yes — the Standard plan is completely free, forever. No credit card required to sign up or use it. You get 1 domain, 1 chatbot, and 10 conversations per month at no cost. You only need to enter payment details when upgrading to Pro or Ultimate.",
  },
  {
    id: 9,
    category: "billing",
    title: "Can I upgrade or cancel my plan at any time?",
    content:
      "Absolutely. You can upgrade, downgrade, or cancel your subscription at any time directly from your account's Billing settings. If you cancel, you keep access until the end of your current billing period. No contracts, no cancellation fees.",
  },
  {
    id: 10,
    category: "billing",
    title: "What is the difference between Pro and Ultimate?",
    content:
      "Pro gives you 2 domains, 2 chatbots, 2,000 conversations/month, knowledge base file uploads, human handoff, email marketing (5 campaigns), appointment booking, and custom branding. Ultimate removes all limits — unlimited domains, chatbots, and conversations — and adds website scraping for the knowledge base, unlimited email campaigns, and early access to integrations.",
  },
  {
    id: 11,
    category: "support",
    title: "How do I get support if something isn't working?",
    content:
      "You can reach us at support@sendwiseai.com. Standard plan users receive community support with responses typically within 48 hours. Pro users get priority email support. Ultimate users receive dedicated priority support with faster response times.",
  },
  {
    id: 12,
    category: "support",
    title: "Is my data and my visitors' conversation data secure?",
    content:
      "Yes. All data is encrypted in transit (TLS) and at rest. Conversations are isolated per domain and never shared between accounts. We do not use your visitors' conversation data to train AI models. You can request data deletion at any time from your account settings.",
  },
];