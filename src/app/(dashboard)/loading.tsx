export default function DashboardLoading() {
  return (
    <div className="flex flex-col h-full p-6 gap-6 animate-pulse">
      <div className="h-16 bg-[var(--bg-card)] rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-[var(--bg-card)] rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-64 bg-[var(--bg-card)] rounded-xl" />
        <div className="h-64 bg-[var(--bg-card)] rounded-xl" />
      </div>
    </div>
  )
}
