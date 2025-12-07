"use client"

import { Lock } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export const DomainLockedOverlay = () => {
  const params = useParams()
  const domain = params?.domain as string

  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center px-4">
      <div className="pointer-events-auto lg:hidden w-50 rounded-lg border border-yellow-600/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm p-4 shadow-xl">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
            <Lock className="h-5 w-5 text-yellow-500" />
          </div>
          <h3 className="text-sm font-semibold text-white">
            Verify domain to unlock settings
          </h3>
          <Link
            href={`/settings/${domain}/verify`}
            className="mt-1 w-full rounded-md bg-yellow-600 px-4 py-2 text-xs font-medium text-white hover:bg-yellow-700 transition-colors"
          >
            Verify Now
          </Link>
        </div>
      </div>

      <div className="pointer-events-auto hidden lg:flex max-w-md mx-auto rounded-xl border border-slate-700 bg-slate-950/95 backdrop-blur-sm px-6 py-5 shadow-2xl flex-col items-center text-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
          <Lock className="h-5 w-5 text-yellow-500" />
        </div>
        <h3 className="text-sm font-semibold text-slate-50">
          Verify your domain to unlock settings
        </h3>
        <p className="text-xs text-slate-400">
          Complete the domain verification step at the top of this page to configure embed code,
          chatbot appearance, training data and products for this domain.
        </p>
        <Link
          href={`/settings/${domain}/verify`}
          className="mt-1 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Go to verification
        </Link>
      </div>
    </div>
  )
}
