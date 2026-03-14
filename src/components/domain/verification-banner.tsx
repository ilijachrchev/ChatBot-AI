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
      <div className='rounded-xl border border-[var(--success)] dark:border-[var(--success)] bg-[var(--success)] dark:bg-[var(--success)] p-4'>
        <div className='flex items-start gap-3'>
          <ShieldCheck className='w-5 h-5 text-[var(--success)] dark:text-[var(--success)] shrink-0 mt-0.5' />
          <div className='flex-1'>
            <h3 className='font-semibold text-[var(--success)] dark:text-[var(--success)]'>
              Domain Verified
            </h3>
            <p className='text-sm text-[var(--success)] dark:text-[var(--success)] mt-1'>
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
      <div className='rounded-xl border border-[var(--danger)] dark:border-[var(--danger)] bg-[var(--danger)] dark:bg-[var(--danger)] p-4'>
        <div className='flex items-start gap-3'>
          <XCircle className='w-5 h-5 text-[var(--danger)] dark:text-[var(--danger)] shrink-0 mt-0.5' />
          <div className='flex-1'>
            <h3 className='font-semibold text-[var(--danger)] dark:text-[var(--danger)]'>
              Verification Failed
            </h3>
            <p className='text-sm text-[var(--danger)] dark:text-[var(--danger)] mt-1'>
              We couldn't verify ownership of this domain. Some features may be limited.
            </p>
          </div>
          <Link href={`/settings/${domainName.split('.')[0]}/verify`}>
            <Button variant='outline' size='sm' className='shrink-0 border-[var(--danger)] dark:border-[var(--danger)] text-[var(--danger)] dark:text-[var(--danger)] hover:bg-[var(--danger)] dark:hover:bg-[var(--danger)]'>
              Try Again
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='rounded-xl border border-[var(--warning)] dark:border-[var(--warning)] bg-[var(--warning)] dark:bg-[var(--warning)] p-4'>
      <div className='flex items-start gap-3'>
        <AlertCircle className='w-5 h-5 text-[var(--warning)] dark:text-[var(--warning)] shrink-0 mt-0.5' />
        <div className='flex-1'>
          <h3 className='font-semibold text-[var(--warning)] dark:text-[var(--warning)]'>
            Domain Verification Required
          </h3>
          <p className='text-sm text-[var(--warning)] dark:text-[var(--warning)] mt-1'>
            To enable all features, please verify that you own this domain. This only takes a few minutes.
          </p>
        </div>
        <Link href={`/settings/${domainName.split('.')[0]}/verify`}>
          <Button size='sm' className='shrink-0 bg-[var(--warning)] hover:bg-[var(--warning)] text-white'>
            Verify Now
          </Button>
        </Link>
      </div>
    </div>
  )
}