import { onGetCurrentDomainInfo } from '@/actions/settings'
import { EmbedCodePanel } from '@/components/embed'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@clerk/nextjs/server'

type Props = {
  params: Promise<{ domain: string }>
}

const DomainEmbedPage = async ({ params }: Props) => {
  const { userId } = await auth()
  if (!userId) {
    redirect('/auth/sign-in')
  }

  const { domain } = await params
  
  const cleanDomain = domain.replace(/\.(com|net|org|io)$/, '')

  if (!cleanDomain) redirect('/dashboard')

  const domainInfo = await onGetCurrentDomainInfo(cleanDomain)

  if (!domainInfo || !domainInfo.domains || domainInfo.domains.length === 0) {
    return redirect('/dashboard')
  }

  const currentDomain = domainInfo.domains[0]

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-20"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(262 83% 58% / 0.3) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] opacity-10"
          style={{
            background: 'radial-gradient(circle at center, hsl(221 83% 53% / 0.4) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <Link
            href={`/settings/${domain}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to domain settings
          </Link>
        </div>

        <EmbedCodePanel
          domainId={currentDomain.id}
          domainName={currentDomain.name}
        />
      </div>
    </div>
  )
}

export default DomainEmbedPage