export default function ConversationLoading() {
  return (
    <div className="flex h-full animate-pulse">
      <div className="w-80 h-full bg-[var(--bg-card)] border-r border-[var(--border-default)]" />
      <div className="flex-1 h-full bg-[var(--bg-page)]" />
    </div>
  )
}
