"use client"

import { useState } from "react"
import { Lock, Trash2 } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { onDeleteDomain } from "@/actions/domain"

type Props = {
  domainId: string
}

export const DomainLockedOverlay = ({ domainId }: Props) => {
  const params = useParams()
  const domain = params?.domain as string
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await onDeleteDomain(domainId)
    router.push('/dashboard')
    router.refresh()
  }

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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full rounded-md border border-red-600/50 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-600/10 transition-colors">
                Delete Domain
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this domain?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The domain and all its settings will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleting ? 'Deleting...' : 'Delete Domain'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="pointer-events-auto hidden lg:flex max-w-md mx-auto rounded-xl border border-[var(--border)] bg-[var(--bg-page)]/95 backdrop-blur-sm px-6 py-5 shadow-2xl flex-col items-center text-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
          <Lock className="h-5 w-5 text-yellow-500" />
        </div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Verify your domain to unlock settings
        </h3>
        <p className="text-xs text-[var(--text-muted)]">
          Complete the domain verification step at the top of this page to configure embed code,
          chatbot appearance, training data and products for this domain.
        </p>
        <Link
          href={`/settings/${domain}/verify`}
          className="mt-1 inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Go to verification
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-red-600/40 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-600/10 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
              Delete Domain
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this domain?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The domain and all its settings will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? 'Deleting...' : 'Delete Domain'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
