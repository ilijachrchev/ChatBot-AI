"use client";

import {
  BarChart3,
  MessageSquare,
  Plug,
  Settings,
  Calendar,
  Mail,
} from "lucide-react";

export const ProductShowcase = () => {
  const features = [
    {
      icon: BarChart3,
      title: "Dashboard",
      description:
        "KPI widgets, email performance graphs, and quick actions in a clean, futuristic layout",
      mockup: "dashboard",
    },
    {
      icon: MessageSquare,
      title: "Conversations",
      description:
        "Real chat-like view with AI vs customer messages, avatar bubbles, and AI suggestions",
      mockup: "chat",
    },
    {
      icon: Plug,
      title: "Integrations",
      description:
        "Connect with Stripe, Zapier, Google, Meta, Slack, and more with neon outlines",
      mockup: "integrations",
    },
    {
      icon: Settings,
      title: "Settings",
      description:
        "Clean forms with toggle switches, input fields, and neon focus states",
      mockup: "settings",
    },
    {
      icon: Calendar,
      title: "Appointments",
      description:
        "Calendar UI with booking cards, time slot selection, and smooth gradients",
      mockup: "calendar",
    },
    {
      icon: Mail,
      title: "Email Marketing",
      description:
        "Sequence builder with email preview, drag-and-drop steps, and metrics sidebar",
      mockup: "email",
    },
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-slate-900/70 to-[#020617]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-50">
            Powerful Features, Beautiful Interface
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Every part of SendWise-AI is designed for clarity, speed and
            conversions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/25 to-violet-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative bg-slate-950/70 border border-slate-700 rounded-2xl p-6 hover:border-sky-500 transition-all duration-300 hover:shadow-[0_0_40px_rgba(56,189,248,0.45)] h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-sky-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-sky-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-50">
                      {feature.title}
                    </h3>
                  </div>

                  <p className="text-slate-400 mb-6 flex-grow">
                    {feature.description}
                  </p>

                  <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-950 rounded-lg overflow-hidden border border-slate-700/80">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full p-4 space-y-2 text-[10px]">
                        {feature.mockup === "dashboard" && (
                          <>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div className="h-8 bg-sky-500/25 rounded" />
                              <div className="h-8 bg-violet-500/25 rounded" />
                            </div>
                            <div className="h-20 bg-slate-900 border border-sky-500/30 rounded" />
                          </>
                        )}

                        {feature.mockup === "chat" && (
                          <>
                            <div className="flex gap-2 justify-end">
                              <div className="h-8 w-3/4 bg-sky-500/25 rounded-lg" />
                            </div>
                            <div className="flex gap-2">
                              <div className="h-8 w-2/3 bg-violet-500/25 rounded-lg" />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <div className="h-8 w-1/2 bg-sky-500/25 rounded-lg" />
                            </div>
                          </>
                        )}

                        {feature.mockup === "integrations" && (
                          <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <div
                                key={i}
                                className="aspect-square bg-slate-900 rounded-lg border border-sky-500/40"
                              />
                            ))}
                          </div>
                        )}

                        {feature.mockup === "settings" && (
                          <>
                            <div className="h-6 bg-sky-500/25 rounded w-1/3 mb-3" />
                            <div className="space-y-2">
                              <div className="h-8 bg-slate-900 rounded border border-slate-700" />
                              <div className="h-8 bg-slate-900 rounded border border-slate-700" />
                              <div className="flex justify-between items-center h-8">
                                <div className="h-4 bg-sky-500/25 rounded w-1/2" />
                                <div className="h-6 w-12 bg-sky-500 rounded-full" />
                              </div>
                            </div>
                          </>
                        )}

                        {feature.mockup === "calendar" && (
                          <>
                            <div className="grid grid-cols-7 gap-1 mb-2">
                              {Array.from({ length: 7 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="aspect-square bg-slate-900 rounded text-[6px] flex items-center justify-center text-slate-500"
                                >
                                  {i + 1}
                                </div>
                              ))}
                            </div>
                            <div className="h-12 bg-sky-500/20 rounded border border-sky-500/40" />
                          </>
                        )}

                        {feature.mockup === "email" && (
                          <div className="grid grid-cols-3 gap-2 h-full">
                            <div className="col-span-2 bg-slate-900 rounded border border-slate-700 p-2 space-y-1">
                              <div className="h-3 bg-sky-500/25 rounded w-3/4" />
                              <div className="h-2 bg-slate-800 rounded w-full" />
                              <div className="h-2 bg-slate-800 rounded w-5/6" />
                            </div>
                            <div className="space-y-1">
                              <div className="h-6 bg-sky-500/30 rounded" />
                              <div className="h-6 bg-violet-500/30 rounded" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
