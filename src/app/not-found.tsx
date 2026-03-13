"use client"

import Link from "next/link"
import { Cancel01Icon, Home01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
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
              <Button
                asChild
                className="flex-1 bg-white text-black hover:bg-white/90"
              >
                <Link href="/dashboard">
                  <HugeiconsIcon icon={Home01Icon} className="mr-2 size-4" />
                  Go Home
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/">
                  <HugeiconsIcon icon={Search01Icon} className="mr-2 size-4" />
                  Explore
                </Link>
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  )
}
