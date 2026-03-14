'use client'

import React from 'react'
import { DomainUpdate } from './domain-update'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import { 
  Globe, 
  Code, 
  Sparkles, 
  ArrowRight, 
  Trash2, 
  Save,
  CheckCircle2,
  AlertCircle,
  Zap,
  Shield,
  Rocket
} from 'lucide-react'
import { VerificationBanner } from '@/components/domain/verification-banner'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { useSettings } from '@/hooks/settings/use-settings'

type Props = {
  id: string
  name: string
  verificationStatus?: string
  verifiedAt?: Date | null
  verificationMethod?: string | null
}

export const DomainConfigurationForm = ({
  id,
  name,
  verificationStatus = 'PENDING',
  verifiedAt,
  verificationMethod,
}: Props) => {
  const {
    register,
    onUpdateSettings,
    errors,
    loading,
    onDeleteDomain,
    deleting,
  } = useSettings(id, '')

  const cleanDomain = React.useMemo(() => {
    return name.replace(/\.(com|net|org|io|dev|co|ai|app)$/, '')
  }, [name])

  return (
    <div className="max-w-7xl mx-auto">
      <form className="flex flex-col gap-8" onSubmit={onUpdateSettings}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-page)] dark:bg-white">
              <Globe className="h-6 w-6 text-[var(--text-primary)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                Domain Configuration
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Manage your domain settings and embed code
              </p>
            </div>
          </div>
        </div>

        <VerificationBanner
          domainName={name}
          verificationStatus={verificationStatus}
          verifiedAt={verifiedAt}
          verificationMethod={verificationMethod}
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="group relative overflow-hidden rounded-2xl border-2 border-[var(--border-default)] bg-[var(--bg-page)] transition-all duration-300 hover:border-[var(--border-strong)] hover:shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--bg-page)] to-transparent dark:from-[var(--bg-page)] dark:to-transparent opacity-50 rounded-full blur-3xl -z-0" />
            
            <div className="relative z-10 p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-page)] dark:bg-white transition-transform group-hover:scale-110">
                    <Globe className="h-5 w-5 text-[var(--text-primary)]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">
                      Domain Name
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Your registered domain
                    </p>
                  </div>
                </div>
                
                {verificationStatus === 'VERIFIED' && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--success)] dark:bg-[var(--success)] border border-[var(--success)] dark:border-[var(--success)]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)] dark:text-[var(--success)]" />
                    <span className="text-xs font-semibold text-[var(--success)] dark:text-[var(--success)]">
                      Verified
                    </span>
                  </div>
                )}
              </div>

              <DomainUpdate name={name} register={register} errors={errors} />

              <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-[var(--bg-card)]">
                      <Shield className="h-5 w-5 text-[var(--text-secondary)]" />
                    </div>
                    <p className="text-xs font-medium text-[var(--text-secondary)]">
                      SSL Secured
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-[var(--bg-card)]">
                      <Zap className="h-5 w-5 text-[var(--text-secondary)]" />
                    </div>
                    <p className="text-xs font-medium text-[var(--text-secondary)]">
                      Fast DNS
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 rounded-full bg-[var(--bg-card)]">
                      <Rocket className="h-5 w-5 text-[var(--text-secondary)]" />
                    </div>
                    <p className="text-xs font-medium text-[var(--text-secondary)]">
                      99.9% Uptime
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border-2 border-[var(--border-strong)] dark:border-white bg-[var(--bg-page)] dark:bg-white transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--border-default)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-page)] via-[var(--bg-card)] to-black dark:from-[var(--bg-page)] dark:via-white dark:to-[var(--bg-page)] opacity-90" />
            
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent dark:from-[var(--bg-page)] rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/5 to-transparent dark:from-[var(--bg-page)] rounded-full blur-3xl" />
            
            <div className="relative z-10 p-8 h-full flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-page)] transition-transform group-hover:scale-110">
                    <Code className="h-5 w-5 text-[var(--text-primary)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-[var(--text-primary)]">
                        Embed Code
                      </h3>
                      <Badge 
                        variant="secondary" 
                        className="bg-white/10 dark:bg-[var(--bg-page)]/10 text-[var(--text-primary)] border-white/20 dark:border-[var(--border-default)]/20 text-xs font-bold"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        15 Languages
                      </Badge>
                    </div>
                    <p className="text-sm text-white/70 dark:text-[var(--text-secondary)]">
                      Multi-framework integration
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <p className="text-sm text-white/80 dark:text-[var(--text-secondary)] leading-relaxed">
                  Get production-ready code snippets in <span className="font-bold text-[var(--text-primary)]">15 different languages</span> and frameworks. Copy, paste, and go live in seconds.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '✨', label: 'Syntax Highlighting' },
                    { icon: '📋', label: 'One-Click Copy' },
                    { icon: '🎯', label: 'Installation Guide' },
                    { icon: '👁️', label: 'Live Preview' },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 rounded-lg bg-white/5 dark:bg-[var(--bg-page)]/5 border border-white/10 dark:border-[var(--border-default)]/10"
                    >
                      <span className="text-lg">{feature.icon}</span>
                      <span className="text-xs font-medium text-white/90 dark:text-[var(--text-muted)]">
                        {feature.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {['JavaScript', 'React', 'Next.js', 'Vue', 'Python', 'PHP'].map((lang) => (
                    <span
                      key={lang}
                      className="px-2.5 py-1 text-[10px] font-semibold rounded-md bg-white/10 dark:bg-[var(--bg-page)]/10 text-[var(--text-primary)] border border-white/20 dark:border-[var(--border-default)]/20"
                    >
                      {lang}
                    </span>
                  ))}
                  <span className="px-2.5 py-1 text-[10px] font-semibold rounded-md bg-white/10 dark:bg-[var(--bg-page)]/10 text-[var(--text-primary)] border border-white/20 dark:border-[var(--border-default)]/20">
                    +9 more
                  </span>
                </div>
              </div>

              <Link href={`/settings/${cleanDomain}/embed`} className="mt-6">
                <Button 
                  type="button"
                  className="w-full h-12 bg-[var(--bg-page)] hover:bg-white/90 dark:hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold shadow-xl hover:shadow-2xl transition-all duration-300 group/btn"
                >
                  <Code className="h-4 w-4 mr-2" />
                  View Embed Instructions
                  <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)] dark:bg-[var(--primary)] flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-[var(--text-accent)]" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2">
                Need to change your domain?
              </h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Domain names are locked after verification to ensure security and prevent unauthorized changes. 
                If you need to update your domain, please contact our support team who will assist you with the process.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-6 border-t border-[var(--border-default)]">
          <Button
            onClick={onDeleteDomain}
            type="button"
            variant="ghost"
            className="w-full sm:w-auto border-2 border-[rgba(224,85,85,0.3)] text-[var(--danger)] hover:bg-[rgba(224,85,85,0.08)] hover:border-[rgba(224,85,85,0.5)] font-semibold h-11"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            <Loader loading={deleting}>Delete Domain</Loader>
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto h-11 px-8 bg-[var(--bg-page)] dark:bg-white hover:bg-[var(--bg-page)] dark:hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Save className="h-4 w-4 mr-2" />
            <Loader loading={loading}>Save Changes</Loader>
          </Button>
        </div>
      </form>
    </div>
  )
}