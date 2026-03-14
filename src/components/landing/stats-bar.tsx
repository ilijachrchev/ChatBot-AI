const stats = [
  { value: "2 min", label: "Average setup time" },
  { value: "15+", label: "Embed languages supported" },
  { value: "24/7", label: "Automated support coverage" },
  { value: "100%", label: "Customizable to your brand" },
];

export const StatsBar = () => {
  return (
    <section className="bg-[var(--bg-page)]/50 border-y border-[var(--border-strong)] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          {stats.map((stat, i) => (
            <div
              key={stat.value}
              className="relative flex flex-col items-center flex-1 py-6 md:py-0"
            >
              {i > 0 && (
                <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 h-12 w-px bg-[var(--bg-active)]" />
              )}
              <span className="text-3xl md:text-4xl font-bold text-sky-400">
                {stat.value}
              </span>
              <span className="text-sm text-[var(--text-muted)] mt-1 text-center">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
