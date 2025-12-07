"use client"

import { Lock } from "lucide-react"

export const DomainLockedOverlay = () => {
  const handleScrollToTop = () => {
    const container = document.querySelector(".chat-window") as HTMLElement | null

    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center">
      <div className="pointer-events-auto max-w-md mx-auto rounded-xl border border-slate-700 bg-slate-950/90 px-6 py-5 shadow-2xl flex flex-col items-center text-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800">
          <Lock className="h-5 w-5 text-slate-100" />
        </div>
        <h3 className="text-sm font-semibold text-slate-50">
          Verify your domain to unlock settings
        </h3>
        <p className="text-xs text-slate-400">
          Complete the domain verification step at the top of this page to configure embed code,
          chatbot appearance, training data and products for this domain.
        </p>
        <button
          type="button"
          onClick={handleScrollToTop}
          className="mt-1 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Go to verification
        </button>
      </div>
    </div>
  )
}
