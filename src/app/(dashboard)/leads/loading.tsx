export default function LeadsLoading() {
  return (
    <div className="flex flex-col h-full p-6 gap-4 animate-pulse">
      <div className="h-10 w-32 bg-[var(--bg-card)] rounded-lg" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-16 bg-[var(--bg-card)] rounded-xl" />
      ))}
    </div>
  )
}
