"use client"

import { Lock, Sparkles } from "lucide-react"
import Link from "next/link"

type Props = {
  currentPlan: 'STANDARD' | 'PRO' | 'ULTIMATE'
  feature: string
}

export const PlanLockedOverlay = ({ currentPlan, feature }: Props) => {
  return (
    <div className="absolute inset-0 flex items-start justify-center px-4 pt-20 pointer-events-none">
      <div className="pointer-events-auto lg:hidden max-w-[280px] w-full rounded-xl border border-purple-600/50 bg-purple-900/95 backdrop-blur-md p-4 shadow-2xl">
        <div className="flex flex-col items-center text-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/30">
            <Sparkles className="h-5 w-5 text-purple-300" />
          </div>
          <h3 className="text-sm font-semibold text-white">
            Upgrade to unlock {feature}
          </h3>
          <p className="text-xs text-purple-200">
            Available on Pro & Ultimate plans
          </p>
          <Link
            href="/settings/billing"
            className="w-full rounded-md bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-medium text-white hover:from-purple-700 hover:to-pink-700 transition-colors"
          >
            Upgrade Now
          </Link>
        </div>
      </div>

      <div className="pointer-events-auto hidden lg:flex max-w-md mx-auto rounded-xl border border-purple-700 bg-gradient-to-br from-purple-950/95 to-pink-950/95 backdrop-blur-sm px-6 py-5 shadow-2xl flex-col items-center text-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30">
          <Sparkles className="h-6 w-6 text-purple-300" />
        </div>
        <h3 className="text-lg font-semibold text-white">
          Upgrade to unlock {feature}
        </h3>
        <p className="text-sm text-purple-200">
          Customize your chatbot appearance with Pro or Ultimate plans. Get access to:
        </p>
        <ul className="text-xs text-purple-300 space-y-1 text-left w-full">
          <li>✨ Custom colors and themes</li>
          <li>✨ Custom welcome messages</li>
          <li>✨ Avatar and icon customization</li>
          <li>✨ Button and bubble styling</li>
        </ul>
        <Link
          href="/settings/billing"
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-700 transition-colors shadow-lg"
        >
          Upgrade to Pro
        </Link>
        <p className="text-xs text-purple-400">
          Current plan: <span className="font-semibold">{currentPlan}</span>
        </p>
      </div>
    </div>
  )
}