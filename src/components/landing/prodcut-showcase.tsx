"use client";

import { BarChart3, MessageSquare, Users, BookOpen, Code, Calendar } from "lucide-react";

export const ProductShowcase = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "AI Chatbot",
      description:
        "Answers customer questions instantly, 24/7. Trained on your docs, FAQs, and website content.",
      mockupContent: (
        <div className="space-y-2">
          <div className="flex">
            <div className="bg-sky-500/20 text-sky-300 rounded-2xl p-2 text-[9px] max-w-[70%]">
              Hi! How can I help you today?
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-violet-500/20 text-violet-300 rounded-2xl p-2 text-[9px] max-w-[60%]">
              What&apos;s the price?
            </div>
          </div>
          <div className="flex">
            <div className="bg-sky-500/20 text-sky-300 rounded-2xl p-2 text-[9px] max-w-[70%]">
              Starting from $0/mo!
            </div>
          </div>
          <div className="flex justify-center pt-1">
            <span className="text-[8px] text-[var(--success)] font-medium">
              AI Resolved ✓
            </span>
          </div>
        </div>
      ),
    },
    {
      icon: Users,
      title: "Human Handoff",
      description:
        "When AI can't help, escalate to your team instantly. Real-time chat with full conversation history.",
      mockupContent: (
        <div className="space-y-2">
          <div className="flex">
            <div className="bg-sky-500/20 text-sky-300 rounded-2xl p-2 text-[9px] max-w-[85%]">
              Let me connect you with a team member...
            </div>
          </div>
          <div className="flex items-center gap-2 py-1">
            <div className="flex-1 h-px bg-[var(--bg-active)]" />
            <span className="text-[8px] text-[var(--success)] shrink-0">
              👤 Agent joined
            </span>
            <div className="flex-1 h-px bg-[var(--bg-active)]" />
          </div>
          <div className="flex">
            <div className="bg-[var(--success)] text-[var(--success)] rounded-2xl p-2 text-[9px] max-w-[70%]">
              Hi! I&apos;m here to help you.
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: BookOpen,
      title: "Knowledge Base",
      description:
        "Upload PDFs, docs, and FAQs. Your chatbot learns your content and answers with precision.",
      mockupContent: (
        <div className="space-y-2">
          {["pricing-faq.pdf", "product-guide.pdf", "returns.pdf"].map(
            (file) => (
              <div
                key={file}
                className="h-8 bg-[var(--bg-surface)] rounded flex items-center gap-2 px-2"
              >
                <div className="w-4 h-4 rounded bg-sky-500/30 shrink-0" />
                <span className="text-[8px] text-[var(--text-muted)] truncate">
                  {file}
                </span>
              </div>
            )
          )}
          <div className="bg-sky-500/20 text-sky-300 rounded-2xl p-2 text-[9px]">
            I found the answer in your docs ✓
          </div>
        </div>
      ),
    },
    {
      icon: Code,
      title: "Embed Code",
      description:
        "One line of code. Works on React, Vue, Next.js, PHP, Python, and 10 more frameworks.",
      mockupContent: (
        <div className="space-y-2">
          <div className="bg-[var(--bg-page)] rounded p-3 text-[8px] font-mono space-y-0.5">
            <div>
              <span className="text-violet-400">&lt;script</span>
            </div>
            <div>
              <span className="text-sky-400">{"  src="}</span>
              <span className="text-[var(--success)]">{'"sendwise.js"'}</span>
            </div>
            <div>
              <span className="text-sky-400">{"  data-id="}</span>
              <span className="text-[var(--success)]">{'"your-id"'}</span>
            </div>
            <div>
              <span className="text-violet-400">&gt;&lt;/script&gt;</span>
            </div>
          </div>
          <div className="flex gap-1 flex-wrap">
            {["React", "Vue", "PHP", "JS"].map((lang) => (
              <span
                key={lang}
                className="bg-[var(--bg-active)] rounded px-1.5 py-0.5 text-[7px] text-[var(--text-muted)]"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      icon: Calendar,
      title: "Appointments",
      description:
        "Let customers book meetings directly in the chat. Syncs with your availability and sends confirmations.",
      mockupContent: (
        <div className="space-y-2">
          <p className="text-[8px] text-[var(--text-muted)]">Available slots — Today</p>
          <div className="flex gap-1 flex-wrap">
            <div className="bg-sky-500 text-white rounded px-2 py-1 text-[8px] font-medium">
              9:00 AM
            </div>
            <div className="bg-sky-500/20 text-sky-300 rounded px-2 py-1 text-[8px]">
              2:00 PM
            </div>
            <div className="bg-sky-500/20 text-sky-300 rounded px-2 py-1 text-[8px]">
              4:30 PM
            </div>
          </div>
          <p className="text-[8px] text-sky-400">Book this slot →</p>
        </div>
      ),
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description:
        "Track conversations, resolution rates, and customer satisfaction. Know exactly how your bot performs.",
      mockupContent: (
        <div className="space-y-2">
          <div className="flex gap-1.5 flex-wrap">
            <span className="bg-[var(--success)] text-[var(--success)] rounded-full px-2 py-0.5 text-[8px]">
              94% AI resolved
            </span>
            <span className="bg-sky-500/20 text-sky-400 rounded-full px-2 py-0.5 text-[8px]">
              ↑ 12% this week
            </span>
          </div>
          <div className="flex items-end gap-1 h-12">
            <div className="flex-1 bg-sky-500/40 rounded-sm h-[40%]" />
            <div className="flex-1 bg-sky-500/40 rounded-sm h-[60%]" />
            <div className="flex-1 bg-sky-500/40 rounded-sm h-[80%]" />
            <div className="flex-1 bg-sky-500/40 rounded-sm h-[55%]" />
            <div className="flex-1 bg-sky-500/40 rounded-sm h-[90%]" />
          </div>
          <div className="flex justify-around">
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
              <span key={day} className="text-[7px] text-[var(--text-muted)]">
                {day}
              </span>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[var(--bg-card)] to-[#020617]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--text-primary)]">
            Everything your customer service needs
          </h2>
          <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto">
            Built for businesses that want to automate support without losing
            the human touch.
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

                <div className="relative bg-[var(--bg-page)]/70 border border-[var(--border-strong)] rounded-2xl p-6 hover:border-sky-500 transition-all duration-300 hover:shadow-[0_0_40px_rgba(56,189,248,0.45)] h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-sky-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-sky-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                      {feature.title}
                    </h3>
                  </div>

                  <p className="text-[var(--text-muted)] mb-6 flex-grow">
                    {feature.description}
                  </p>

                  <div className="relative aspect-video bg-gradient-to-br from-[var(--bg-page)] to-[var(--bg-page)] rounded-lg overflow-hidden border border-[var(--border-strong)]/80">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full p-4">
                        {feature.mockupContent}
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
