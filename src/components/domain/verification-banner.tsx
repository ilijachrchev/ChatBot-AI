'use client'

import { AlertCircle, ShieldCheck, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Props = {
  domainName: string
  verificationStatus: string
  verifiedAt?: Date | null
  verificationMethod?: string | null
}

export function VerificationBanner({
  domainName,
  verificationStatus,
  verifiedAt,
  verificationMethod,
}: Props) {
  if (verificationStatus === 'VERIFIED') {
    return (
      <div className='rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-4'>
        <div className='flex items-start gap-3'>
          <ShieldCheck className='w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5' />
          <div className='flex-1'>
            <h3 className='font-semibold text-green-900 dark:text-green-100'>
              Domain Verified
            </h3>
            <p className='text-sm text-green-700 dark:text-green-300 mt-1'>
              Your domain was verified on{' '}
              {verifiedAt ? new Date(verifiedAt).toLocaleDateString() : 'N/A'} via{' '}
              {verificationMethod || 'unknown method'}. Your chatbot and email features are fully active.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (verificationStatus === 'FAILED') {
    return (
      <div className='rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4'>
        <div className='flex items-start gap-3'>
          <XCircle className='w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5' />
          <div className='flex-1'>
            <h3 className='font-semibold text-red-900 dark:text-red-100'>
              Verification Failed
            </h3>
            <p className='text-sm text-red-700 dark:text-red-300 mt-1'>
              We couldn't verify ownership of this domain. Some features may be limited.
            </p>
          </div>
          <Link href={`/settings/${domainName.split('.')[0]}/verify`}>
            <Button variant='outline' size='sm' className='shrink-0 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'>
              Try Again
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4'>
      <div className='flex items-start gap-3'>
        <AlertCircle className='w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5' />
        <div className='flex-1'>
          <h3 className='font-semibold text-amber-900 dark:text-amber-100'>
            Domain Verification Required
          </h3>
          <p className='text-sm text-amber-700 dark:text-amber-300 mt-1'>
            To enable all features, please verify that you own this domain. This only takes a few minutes.
          </p>
        </div>
        <Link href={`/settings/${domainName.split('.')[0]}/verify`}>
          <Button size='sm' className='shrink-0 bg-amber-600 hover:bg-amber-700 text-white'>
            Verify Now
          </Button>
        </Link>
      </div>
    </div>
  )
}