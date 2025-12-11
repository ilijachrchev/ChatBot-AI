import { onGetCurrentDomainInfo } from '@/actions/settings'
import { EmbedCodePanel } from '@/components/embed'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type Props = {
  params: Promise<{ domain: string }>
}

const DomainEmbedPage = async ({ params }: Props) => {
  const { domain } = await params

  if (!domain) redirect('/dashboard')

  const domainInfo = await onGetCurrentDomainInfo(domain)

  if (!domainInfo || !domainInfo.domains || domainInfo.domains.length === 0) {
    return redirect('/dashboard')
  }

  const currentDomain = domainInfo.domains[0]

  return (
    <div className="px-4 md:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/settings/${domain}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to domain settings
          </Link>
        </div>
      </div>

      <EmbedCodePanel
        domainId={currentDomain.id}
        domainName={currentDomain.name}
      />
    </div>
  )
}

export default DomainEmbedPage
