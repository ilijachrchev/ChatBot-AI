const testimonials = [
  {
    quote:
      "We went from missing 40% of support requests to handling everything automatically. Setup took less than 10 minutes.",
    author: "Marcus T.",
    role: "Founder, eCommerce Store",
  },
  {
    quote:
      "The human handoff feature is a game changer. Our team only gets involved when it actually matters.",
    author: "Priya S.",
    role: "Head of Support, SaaS Company",
  },
  {
    quote:
      "I embedded it on my agency's site and had it answering client questions the same afternoon. Incredible.",
    author: "James O.",
    role: "Digital Agency Owner",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[var(--bg-card)] to-[#020617]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Trusted by businesses like yours
          </h2>
          <p className="text-lg text-[var(--text-muted)]">
            See what our customers are saying
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="group relative animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-violet-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-[var(--bg-page)]/70 border border-[var(--border-strong)] rounded-2xl p-6 hover:border-sky-500/50 transition-all duration-300 h-full flex flex-col">
                <span className="text-[var(--warning)] text-sm tracking-wide mb-4">
                  ★★★★★
                </span>
                <blockquote className="italic text-[var(--text-muted)] text-sm leading-relaxed flex-grow mb-6">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div>
                  <p className="font-semibold text-[var(--text-primary)] text-sm">
                    {t.author}
                  </p>
                  <p className="text-[var(--text-muted)] text-xs mt-0.5">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
