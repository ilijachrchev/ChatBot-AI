"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  NewTwitterIcon,   
  InstagramIcon,
  YoutubeIcon,
  Linkedin01Icon,
} from "@hugeicons/core-free-icons";

type FooterLink = {
  title: string;
  href: string;
  external?: boolean;
  icon?: ReactNode;
};

type FooterSection = {
  label: string;
  links: FooterLink[];
};

const footerLinks: FooterSection[] = [
  {
    label: "Product",
    links: [
      { title: "Features",    href: "#features" },
      { title: "How it works", href: "#how-it-works" },
      { title: "Pricing",     href: "#pricing" },
      { title: "FAQ",         href: "#faq" },
    ],
  },
  {
    label: "Company",
    links: [
      { title: "About Us",        href: "#" },
      { title: "Privacy Policy",  href: "/privacy" },
      { title: "Terms of Service", href: "/terms" },
      { title: "Contact",         href: "mailto:support@sendwiseai.com", external: true },
    ],
  },
  {
    label: "Account",
    links: [
      { title: "Sign In",  href: "/auth/sign-in" },
      { title: "Sign Up",  href: "/auth/sign-up" },
      { title: "Dashboard", href: "/dashboard" },
      { title: "Help Center", href: "#faq" },
    ],
  },
  {
    label: "Social",
    links: [
      {
        title: "Twitter / X",
        href: "#",
        icon: <HugeiconsIcon icon={NewTwitterIcon} strokeWidth={2} />,
      },
      {
        title: "Instagram",
        href: "#",
        icon: <HugeiconsIcon icon={InstagramIcon} strokeWidth={2} />,
      },
      {
        title: "YouTube",
        href: "#",
        icon: <HugeiconsIcon icon={YoutubeIcon} strokeWidth={2} />,
      },
      {
        title: "LinkedIn",
        href: "#",
        icon: <HugeiconsIcon icon={Linkedin01Icon} strokeWidth={2} />,
      },
    ],
  },
];

export function Footer() {
  return (
    <footer
      className={cn(
        "relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center",
        "rounded-t-[2rem] border-t border-x border-white/[0.07] px-6 md:rounded-t-[3rem] md:px-8",
        "bg-[radial-gradient(35%_128px_at_50%_0%,rgba(255,255,255,0.06),transparent)]"
      )}
    >
      <div className="absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-sm" />

      <div className="grid w-full gap-8 py-8 lg:grid-cols-3 lg:gap-8">

        <AnimatedContainer className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-white/10">
              <Sparkles className="size-3.5 text-white" />
            </div>
            <span className="font-semibold text-white text-sm tracking-tight">
              SendWise AI
            </span>
          </Link>
          <p className="text-white/35 text-sm leading-relaxed max-w-xs">
            Deploy an AI chatbot on any website in minutes. Automate support,
            book appointments, and hand off to your team — effortlessly.
          </p>
          {/* Quick auth links */}
          <div className="flex gap-3 pt-1">
            <Link
              href="/auth/sign-up"
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/60 hover:bg-white/8 hover:text-white transition-colors"
            >
              Get started free
            </Link>
            <Link
              href="/auth/sign-in"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/35 hover:text-white transition-colors"
            >
              Sign in →
            </Link>
          </div>
        </AnimatedContainer>

        <div className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-4 lg:col-span-2 lg:mt-0">
          {footerLinks.map((section, index) => (
            <AnimatedContainer delay={0.1 + index * 0.08} key={section.label}>
              <div>
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">
                  {section.label}
                </h3>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      {link.external ? (
                        <a
                          href={link.href}
                          className="inline-flex items-center gap-1.5 text-sm text-white/35 hover:text-white transition-colors duration-200 [&_svg]:size-4"
                        >
                          {link.icon}
                          {link.title}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="inline-flex items-center gap-1.5 text-sm text-white/35 hover:text-white transition-colors duration-200 [&_svg]:size-4"
                        >
                          {link.icon}
                          {link.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="flex w-full items-center justify-between py-5 gap-4 flex-wrap">
        <p className="text-white/25 text-sm">
          &copy; {new Date().getFullYear()} SendWise AI, All rights reserved
        </p>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-xs text-white/20 hover:text-white/50 transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="text-xs text-white/20 hover:text-white/50 transition-colors">
            Terms
          </Link>
          <a href="mailto:support@sendwiseai.com" className="text-xs text-white/20 hover:text-white/50 transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

function AnimatedContainer({
  className,
  delay = 0.1,
  children,
}: {
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      transition={{ delay, duration: 0.8 }}
      viewport={{ once: true }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
    >
      {children}
    </motion.div>
  );
}