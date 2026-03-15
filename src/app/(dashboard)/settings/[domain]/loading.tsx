export default function SettingsLoading() {
  return (
    <div className="flex flex-col h-full p-6 gap-6 animate-pulse">
      <div className="h-10 w-48 bg-[var(--bg-card)] rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-96 bg-[var(--bg-card)] rounded-xl" />
        <div className="lg:col-span-2 h-96 bg-[var(--bg-card)] rounded-xl" />
      </div>
    </div>
  )
}
