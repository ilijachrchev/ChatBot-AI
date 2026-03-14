'use client'

import { useState } from 'react'
import {
  Globe,
  ArrowLeft,
  Eye,
  EyeOff,
  Server,
  Code2,
  FileText,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { onVerifyDomain } from '@/actions/domain'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'error'

type Props = {
  domainId: string
  domainName: string
  verificationToken: string
  verificationStatus: string
  verificationMethod?: string | null
  verifiedAt?: Date | null
}

export function DomainVerificationClient({
  domainId,
  domainName,
  verificationToken,
  verificationStatus,
  verificationMethod,
  verifiedAt,
}: Props) {
  const router = useRouter()
  const [showToken, setShowToken] = useState(false)
  const [status, setStatus] = useState<VerificationStatus>(
    verificationStatus === 'VERIFIED' ? 'success' : 'idle'
  )
  const [errorDetails, setErrorDetails] = useState<string>()
  const [copiedField, setCopiedField] = useState<string>()

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedField(undefined), 2000)
  }

  const handleVerify = async () => {
    setStatus('verifying')
    setErrorDetails(undefined)

    const result = await onVerifyDomain(domainId)

    if (result.verified) {
      setStatus('success')
      toast.success(result.message)
      
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } else {
      setStatus('error')
      setErrorDetails(result.details)
      toast.error(result.message)
    }
  }

  const handleRetry = () => {
    setStatus('idle')
    setErrorDetails(undefined)
  }

  const maskedToken = verificationToken.slice(0, 8) + '••••••••' + verificationToken.slice(-4)

  return (
    <div className='w-full max-w-3xl mx-auto space-y-6 animate-fade-in'>
      <Link href={`/settings/${domainName.split('.')[0]}`}>
        <Button
          variant='ghost'
          className='text-muted-foreground hover:text-foreground -ml-2'
        >
          <ArrowLeft className='w-4 h-4' />
          Back to Settings
        </Button>
      </Link>

      <div className='rounded-2xl border border-[var(--border-default)] bg-[var(--bg-page)]/50 p-6 shadow-xl'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <div className='p-3 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] shadow-lg shadow-[var(--primary)]'>
              <Globe className='w-6 h-6 text-white' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-[var(--text-primary)]'>{domainName}</h1>
              <div className='flex items-center gap-2 mt-1'>
                {verificationStatus === 'VERIFIED' ? (
                  <span className='px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 bg-[var(--success)] dark:bg-[var(--success)] text-[var(--success)] dark:text-[var(--success)] border border-[var(--success)] dark:border-[var(--success)]'>
                    <CheckCircle2 className='w-3 h-3' />
                    Verified
                  </span>
                ) : verificationStatus === 'FAILED' ? (
                  <span className='px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 bg-[var(--danger)] dark:bg-[var(--danger)] text-[var(--danger)] dark:text-[var(--danger)] border border-[var(--danger)] dark:border-[var(--danger)]'>
                    <XCircle className='w-3 h-3' />
                    Failed
                  </span>
                ) : (
                  <span className='px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 bg-[var(--warning)] dark:bg-[var(--warning)] text-[var(--warning)] dark:text-[var(--warning)] border border-[var(--warning)] dark:border-[var(--warning)]'>
                    <span className='w-1.5 h-1.5 rounded-full bg-[var(--warning)] animate-pulse' />
                    Pending Verification
                  </span>
                )}
              </div>
              {verifiedAt && (
                <p className='text-xs text-[var(--text-muted)] mt-1'>
                  Verified {new Date(verifiedAt).toLocaleDateString()} via {verificationMethod}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className='mt-6 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)]'>
          <div className='flex items-center justify-between gap-4'>
            <div className='min-w-0 flex-1'>
              <p className='text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1'>
                Verification Token
              </p>
              <code className='text-sm font-mono text-[var(--text-primary)]'>
                {showToken ? verificationToken : maskedToken}
              </code>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowToken(!showToken)}
                className='shrink-0'
              >
                {showToken ? (
                  <>
                    <EyeOff className='w-4 h-4' />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className='w-4 h-4' />
                    Show
                  </>
                )}
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleCopy(verificationToken, 'token')}
                className='shrink-0'
              >
                {copiedField === 'token' ? (
                  <>
                    <Check className='w-4 h-4 text-[var(--success)]' />
                  </>
                ) : (
                  <>
                    <Copy className='w-4 h-4' />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {status !== 'success' && (
        <div className='space-y-4'>
          <h2 className='text-lg font-semibold text-[var(--text-primary)] px-1'>
            Choose a verification method
          </h2>

          <VerificationMethodCard
            icon={Server}
            title='DNS TXT Verification'
            subtitle='Add a TXT record to your domain DNS settings. May take up to 48 hours to propagate.'
            recommended
            onCopy={handleCopy}
            copiedField={copiedField}
            fields={[
              { label: 'Type', value: 'TXT', field: 'dns-type' },
              { label: 'Name', value: '@', field: 'dns-name' },
              { label: 'Value', value: `sendwise-verify=${verificationToken}`, field: 'dns-value' },
            ]}
          />

          <VerificationMethodCard
            icon={Code2}
            title='HTML Meta Tag Verification'
            subtitle='Add this meta tag inside the head section of your website homepage.'
            onCopy={handleCopy}
            copiedField={copiedField}
            codeBlock={`<meta name="sendwise-verification" content="${verificationToken}" />`}
            codeField='meta-tag'
          />

          <VerificationMethodCard
            icon={FileText}
            title='Verification File'
            subtitle='Create a verification file at the specified path with the token as its content.'
            onCopy={handleCopy}
            copiedField={copiedField}
            fields={[
              {
                label: 'URL',
                value: `https://${domainName}/.well-known/sendwise-verify.txt`,
                field: 'file-url',
              },
              { label: 'Content', value: verificationToken, field: 'file-content' },
            ]}
          />
        </div>
      )}

      <div className='rounded-2xl border border-[var(--border-default)] bg-[var(--bg-page)]/50 p-6 shadow-xl space-y-4'>
        {status === 'success' && (
          <div className='flex items-start gap-3 p-4 rounded-xl bg-[var(--success)] dark:bg-[var(--success)] border border-[var(--success)] dark:border-[var(--success)] animate-fade-in'>
            <CheckCircle2 className='w-5 h-5 text-[var(--success)] dark:text-[var(--success)] shrink-0 mt-0.5' />
            <div>
              <p className='font-medium text-[var(--success)] dark:text-[var(--success)]'>
                Domain verified successfully!
              </p>
              <p className='text-sm text-[var(--success)] dark:text-[var(--success)] mt-0.5'>
                Your domain is now connected and ready to use with SendWise-AI.
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className='flex items-start gap-3 p-4 rounded-xl bg-[var(--danger)] dark:bg-[var(--danger)] border border-[var(--danger)] dark:border-[var(--danger)] animate-fade-in'>
            <XCircle className='w-5 h-5 text-[var(--danger)] dark:text-[var(--danger)] shrink-0 mt-0.5' />
            <div className='flex-1'>
              <p className='font-medium text-[var(--danger)] dark:text-[var(--danger)]'>Verification failed</p>
              <p className='text-sm text-[var(--danger)] dark:text-[var(--danger)] mt-0.5'>
                We could not verify your domain ownership. Please check your setup and try again.
              </p>
              {errorDetails && (
                <pre className='text-xs text-[var(--danger)] dark:text-[var(--danger)] mt-2 p-2 bg-[var(--danger)] dark:bg-[var(--danger)] rounded overflow-x-auto'>
                  {errorDetails}
                </pre>
              )}
            </div>
          </div>
        )}

        {(status === 'idle' || status === 'error') && (
          <div className='flex items-start gap-3 p-4 rounded-xl bg-[var(--primary)] dark:bg-[var(--primary)] border border-[var(--primary)] dark:border-[var(--border-accent)]'>
            <AlertTriangle className='w-5 h-5 text-[var(--text-accent)] shrink-0 mt-0.5' />
            <div>
              <p className='font-medium text-[var(--primary)] dark:text-[var(--primary)]'>Troubleshooting tips</p>
              <ul className='text-sm text-[var(--primary)] dark:text-[var(--primary)] mt-1 space-y-1 list-disc list-inside'>
                <li>DNS changes can take up to 48 hours to propagate</li>
                <li>Clear your browser cache and try again</li>
                <li>Ensure there are no typos in the verification token</li>
                <li>Check that your file or meta tag is publicly accessible</li>
              </ul>
            </div>
          </div>
        )}

        <div className='flex flex-col sm:flex-row gap-3'>
          {status === 'error' && (
            <Button variant='outline' size='lg' onClick={handleRetry} className='flex-1'>
              <RefreshCw className='w-4 h-4' />
              Try Again
            </Button>
          )}

          {status !== 'success' && (
            <Button
              variant='default'
              size='lg'
              onClick={handleVerify}
              disabled={status === 'verifying'}
              className='flex-1 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] hover:from-[var(--primary)] hover:to-[var(--primary-light)]'
            >
              {status === 'verifying' ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  Verifying...
                </>
              ) : (
                'Verify Domain'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

type VerificationMethodCardProps = {
  icon: React.ElementType
  title: string
  subtitle: string
  recommended?: boolean
  onCopy: (text: string, field: string) => void
  copiedField?: string
  fields?: Array<{ label: string; value: string; field: string }>
  codeBlock?: string
  codeField?: string
}

function VerificationMethodCard({
  icon: Icon,
  title,
  subtitle,
  recommended,
  onCopy,
  copiedField,
  fields,
  codeBlock,
  codeField,
}: VerificationMethodCardProps) {
  return (
    <div className='rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)]/50 p-6'>
      <div className='flex items-start gap-4 mb-4'>
        <div className='p-2 rounded-lg bg-[var(--bg-card)]'>
          <Icon className='w-5 h-5 text-[var(--text-secondary)]' />
        </div>
        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <h3 className='font-semibold text-[var(--text-primary)]'>{title}</h3>
            {recommended && (
              <span className='px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--success)] dark:bg-[var(--success)] text-[var(--success)] dark:text-[var(--success)] border border-[var(--success)] dark:border-[var(--success)]'>
                Recommended
              </span>
            )}
          </div>
          <p className='text-sm text-[var(--text-secondary)] mt-1'>{subtitle}</p>
        </div>
      </div>

      {fields && (
        <div className='space-y-3'>
          {fields.map((field) => (
            <div
              key={field.field}
              className='flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)]'
            >
              <div className='flex-1 min-w-0'>
                <p className='text-xs font-medium text-[var(--text-muted)] uppercase'>
                  {field.label}
                </p>
                <code className='text-sm font-mono text-[var(--text-primary)] break-all'>
                  {field.value}
                </code>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onCopy(field.value, field.field)}
                className='shrink-0'
              >
                {copiedField === field.field ? (
                  <Check className='w-4 h-4 text-[var(--success)]' />
                ) : (
                  <Copy className='w-4 h-4' />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      {codeBlock && codeField && (
        <div className='relative'>
          <pre className='p-4 rounded-lg bg-[var(--bg-page)] dark:bg-[var(--bg-page)] border border-[var(--border-strong)] overflow-x-auto'>
            <code className='text-sm text-[var(--text-primary)] font-mono'>{codeBlock}</code>
          </pre>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onCopy(codeBlock, codeField)}
            className='absolute top-2 right-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-active)]'
          >
            {copiedField === codeField ? (
              <Check className='w-4 h-4 text-[var(--success)]' />
            ) : (
              <Copy className='w-4 h-4 text-[var(--text-muted)]' />
            )}
          </Button>
        </div>
      )}
    </div>
  )
}