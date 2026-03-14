"use client"

import Link from "next/link"
import { Cancel01Icon, Home01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { FullWidthDivider } from "@/components/ui/full-width-divider"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        <Empty className="border border-white/10 bg-white/5 backdrop-blur-sm">
          <EmptyHeader>
            <EmptyMedia>
              <div className="flex size-16 items-center justify-center rounded-2xl bg-white/10">
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  className="size-8 text-white/60"
                />
              </div>
            </EmptyMedia>
            <EmptyTitle className="text-2xl font-semibold text-white">
              404 — Page not found
            </EmptyTitle>
            <EmptyDescription className="text-white/50">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </EmptyDescription>
          </EmptyHeader>

          <FullWidthDivider className="border-white/10" />

          <EmptyContent>
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 transition-colors"
              >
                <HugeiconsIcon icon={Home01Icon} className="size-4" />
                Go Home
              </Link>
              <Link
                href="/"
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-white/20 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                <HugeiconsIcon icon={Search01Icon} className="size-4" />
                Explore
              </Link>
            </div>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  )
}
