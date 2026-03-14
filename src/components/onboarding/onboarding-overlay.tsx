'use client'

import { useOnboardingDomain } from '@/hooks/sidebar/use-onboarding-domain'
import { cn } from '@/lib/utils'
import { Globe, Loader2, Shield, Zap } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import FormGenerator from '@/components/forms/form-generator'
import UploadButton from '@/components/upload-button'
import { Button } from '@/components/ui/button'
import { FieldValues, UseFormRegister } from 'react-hook-form'

export const OnboardingOverlay = () => {
  const { register, onAddDomain, errors, loading, isSuccess, addedDomainName } =
    useOnboardingDomain()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!isSuccess) return

    setCelebrating(true)

    const burst = (x: number) =>
      confetti({
        particleCount: 150,
        spread: 60,
        origin: { x, y: 1 },
        colors: ['#3b82f6', '#f59e0b', '#ffffff', '#8b5cf6'],
        gravity: 0.8,
      })

    burst(0.1)
    burst(0.9)

    redirectTimerRef.current = setTimeout(() => {
      window.location.href = '/dashboard'
    }, 4000)

    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
    }
  }, [isSuccess])

  const domainSlug = addedDomainName?.split('.')[0] ?? ''

  const handleDashboard = () => {
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
    window.location.href = '/dashboard'
  }

  const handleCustomize = () => {
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
    window.location.href = `/settings/${domainSlug}/appearance`
  }

  return (
    <>
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes draw-circle {
          from { stroke-dashoffset: 201; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes draw-check {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        .anim-gradient { animation: gradient-shift 4s ease-in-out infinite; }
        .anim-draw-circle { animation: draw-circle 0.5s ease-out forwards; }
        .anim-draw-check { animation: draw-check 0.55s ease-out 0.35s forwards; }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8 px-4">
        <div className="absolute inset-0 bg-background" />
        <div
          className="absolute inset-0 bg-gradient-to-br from-[var(--bg-page)] via-[var(--bg-surface)] to-[var(--bg-page)] anim-gradient"
        />

        <div
          className={cn(
            'relative w-full max-w-[560px] transition-all duration-700 ease-out',
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          )}
        >
          {!celebrating ? (
            <>
              <div className="flex flex-col items-center mb-8">
                <Image
                  src="/images/fulllogo.png"
                  alt="SendWise AI"
                  width={140}
                  height={40}
                  className="mb-6"
                />
                <div className="w-full bg-border rounded-full h-1.5 mb-2 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] transition-all duration-1000 ease-out"
                    style={{ width: '0%' }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Step 1 of 1</p>
              </div>

              <div className="flex flex-col items-center mb-8 text-center">
                <Globe
                  className="w-8 h-8 text-[var(--primary)] mb-4"
                  style={{ animation: 'bounce 2s infinite' }}
                />
                <h1 className="text-3xl font-bold text-foreground mb-3">
                  Let&apos;s set up your first chatbot
                </h1>
                <p className="text-base text-muted-foreground">
                  Add your domain to get started. It only takes 30 seconds.
                </p>
              </div>

              <div className="bg-[var(--bg-surface)] shadow-xl rounded-2xl p-8 border border-border mb-8">
                <form className="flex flex-col gap-4" onSubmit={onAddDomain}>
                  <FormGenerator
                    inputType="input"
                    register={register as unknown as UseFormRegister<FieldValues>}
                    label="Domain"
                    name="domain"
                    errors={errors}
                    placeholder="yourbusiness.com"
                    type="text"
                  />
                  <UploadButton
                    register={register}
                    label="Upload Icon (Optional)"
                    errors={errors}
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 font-semibold transition-all duration-200"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding domain...
                      </span>
                    ) : (
                      'Add Domain & Continue →'
                    )}
                  </Button>
                </form>
              </div>

              <div className="flex items-center justify-center gap-8">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="text-xs">Secure & encrypted</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Zap className="w-3.5 h-3.5" />
                  <span className="text-xs">Live in 2 minutes</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="text-xs">Works on any website</span>
                </div>
              </div>
            </>
          ) : (
            <div
              className={cn(
                'flex flex-col items-center text-center transition-all duration-500 ease-out',
                celebrating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              )}
            >
              <div className="mb-6">
                <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
                  <circle cx="44" cy="44" r="40" fill="#22c55e" />
                  <circle
                    cx="44"
                    cy="44"
                    r="32"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2"
                    strokeDasharray="201"
                    strokeDashoffset="201"
                    className="anim-draw-circle"
                    style={{ transformOrigin: '44px 44px', transform: 'rotate(-90deg)' }}
                  />
                  <path
                    d="M28 44 L38 54 L60 32"
                    stroke="white"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="100"
                    strokeDashoffset="100"
                    className="anim-draw-check"
                  />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-3">
                Your domain is live! 🎉
              </h1>
              <p className="text-base text-muted-foreground mb-8 max-w-[400px]">
                Amazing —{' '}
                <span className="font-semibold text-foreground">{addedDomainName}</span> is
                connected to SendWise AI. Your chatbot is ready to be configured.
              </p>

              <div className="flex gap-3 flex-wrap justify-center">
                <Button
                  onClick={handleDashboard}
                  className="bg-foreground text-background hover:bg-foreground/90 font-semibold px-6"
                >
                  Go to Dashboard →
                </Button>
                <Button variant="outline" onClick={handleCustomize} className="px-6">
                  Customize chatbot first
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-6">
                Redirecting to dashboard in 4 seconds…
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
