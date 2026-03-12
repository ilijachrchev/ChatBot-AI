import { cn } from "@/lib/utils";
import { GlobeIcon, BookOpenIcon, CodeIcon, ZapIcon } from "lucide-react";
import type React from "react";

type StepType = {
  number: string;
  title: string;
  icon: React.ReactNode;
  description: string;
};

const steps: StepType[] = [
  {
    number: "01",
    title: "Add your domain",
    icon: <GlobeIcon />,
    description:
      "Enter your website domain and upload your logo. SendWise AI creates a dedicated chatbot for your business.",
  },
  {
    number: "02",
    title: "Train your chatbot",
    icon: <BookOpenIcon />,
    description:
      "Upload FAQs, docs, or let AI scrape your website. Your bot learns your business inside out.",
  },
  {
    number: "03",
    title: "Embed and go live",
    icon: <CodeIcon />,
    description:
      "Copy one line of code into your website. Available in 15 languages including React, Vue, and plain JS.",
  },
  {
    number: "04",
    title: "Sit back & scale",
    icon: <ZapIcon />,
    description:
      "Your AI handles questions around the clock and escalates to your team exactly when needed.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-[var(--bg-page)] py-28 px-4">
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] pointer-events-none blur-[100px]"
        style={{ background: "radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%)" }}
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-4 md:px-8">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/50">
            How it works
          </div>
          <h2 className="font-bold text-3xl text-white tracking-tight md:text-5xl">
            Set up your AI chatbot
            <br />
            <span className="text-white/25">in minutes</span>
          </h2>
          <p className="text-white/35 text-sm leading-relaxed md:text-base">
            No technical knowledge required. If you can copy and paste,
            you can deploy SendWise AI.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <StepCard step={step} key={step.number} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  className,
  ...props
}: React.ComponentProps<"div"> & { step: StepType }) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between gap-6 bg-[var(--bg-page)] px-6 pt-8 pb-6",
        "hover:bg-white/[0.015] transition-colors duration-300",
        className
      )}
      {...props}
    >
      <div className="absolute -inset-y-4 -left-px w-px bg-white/[0.06]" />
      <div className="absolute -inset-y-4 -right-px w-px bg-white/[0.06]" />
      <div className="absolute -inset-x-4 -top-px h-px bg-white/[0.06]" />
      <div className="absolute -right-4 -bottom-px -left-4 h-px bg-white/[0.06]" />

      <CrosshairDecor position="top-left" />
      <CrosshairDecor position="top-right" />
      <CrosshairDecor position="bottom-left" />
      <CrosshairDecor position="bottom-right" />

      <div className="absolute top-3 right-4 font-mono text-xs text-white/12 select-none">
        {step.number}
      </div>

      <div className="relative z-10 flex w-fit items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] p-3 [&_svg]:size-5 [&_svg]:stroke-[1.5] [&_svg]:text-white/50">
        {step.icon}
      </div>

      <div className="relative z-10 space-y-2">
        <h3 className="font-semibold text-base text-white">{step.title}</h3>
        <p className="text-white/35 text-xs leading-relaxed">{step.description}</p>
      </div>
    </div>
  );
}

function CrosshairDecor({ position }: { position: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) {
  const pos = {
    "top-left":     "top-0 left-0 -translate-x-[calc(50%+0.5px)] -translate-y-[calc(50%+0.5px)]",
    "top-right":    "top-0 right-0 translate-x-[calc(50%+0.5px)] -translate-y-[calc(50%+0.5px)]",
    "bottom-right": "right-0 bottom-0 translate-x-[calc(50%+0.5px)] translate-y-[calc(50%+0.5px)]",
    "bottom-left":  "bottom-0 left-0 -translate-x-[calc(50%+0.5px)] translate-y-[calc(50%+0.5px)]",
  };
  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute z-10 size-3.5 shrink-0 text-white/15", pos[position])}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}