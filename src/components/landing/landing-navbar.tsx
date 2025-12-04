"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { LandingButton as Button } from "../ui/button-landing";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

export function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/minilogo.png"
            alt="SendWise-AI logo"
            width={28}
            height={28}
            className="rounded-lg"
          />
          <span className="text-lg font-semibold bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
            SendWise-AI
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 hover:text-sky-300 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/auth/sign-in"
            className="text-sm text-slate-300 hover:text-sky-300 transition-colors"
          >
            Log in
          </Link>

          <Button variant="neon" size="sm" asChild>
            <Link href="/auth/sign-up">
              Start for free
            </Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-slate-100 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div
        className={cn(
          "md:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl shadow-lg transition-[max-height,opacity] duration-200 overflow-hidden",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 pb-4 pt-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/80"
            >
              {link.label}
            </a>
          ))}

          <div className="mt-2 flex items-center gap-3">
            <Link
              href="/auth/sign-in"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-md px-2 py-2 text-center text-sm font-medium text-slate-200 hover:bg-slate-800/80"
            >
              Log in
            </Link>

            <Button
              variant="neon"
              size="sm"
              className="flex-1"
              asChild
            >
              <Link
                href="/auth/sign-up"
                onClick={() => setOpen(false)}
              >
                Start for free
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
