"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { LandingButton } from "@/components/ui/button-landing";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/newsroom", label: "News Room" },
  { href: "/contact", label: "Contact" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled ? "backdrop-blur-xl bg-background/80 border-b border-border/60 shadow-[0_10px_30px_rgba(0,0,0,0.35)]" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:h-20 md:px-6">
        <Link href="/images/minilogo.png" className="flex items-center gap-2">
          <div className="relative h-8 w-8 md:h-9 md:w-9">
            <Image
              src="/images/favicon.png"
              alt="SendWise-AI logo"
              fill
              className="object-contain drop-shadow-[0_0_12px_rgba(59,130,246,0.7)]"
            />
          </div>
          <span className="bg-gradient-to-r from-sky-300 via-sky-400 to-purple-400 bg-clip-text text-lg font-semibold tracking-tight text-transparent md:text-xl">
            SendWise-AI
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative font-medium transition-colors",
                  "text-muted-foreground hover:text-foreground",
                  active &&
                    "text-foreground after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-gradient-to-r after:from-sky-400 after:to-purple-500"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Log in
          </Link>
          <LandingButton
            variant="neon"
            size="lg"
            asChild
          >
            <Link href="/dashboard">Start Free</Link>
          </LandingButton>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-md border border-border/60 bg-background/70 p-2 text-foreground shadow-sm backdrop-blur-md md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "md:hidden transition-[max-height,opacity] duration-300 overflow-hidden",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-6 pt-2">
          <nav className="flex flex-col gap-2 text-sm">
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-lg px-3 py-2 font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col gap-2">
            <Link
              href="/sign-in"
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors text-center"
            >
              Log in
            </Link>
            <LandingButton
              variant="neon"
              size="lg"
              className="w-full"
              asChild
            >
              <Link href="/dashboard">Start Free</Link>
            </LandingButton>
          </div>
        </div>
      </div>
    </header>
  );
}
