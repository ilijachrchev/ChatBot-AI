'use client'

import { onDismissOnboarding } from '@/actions/onboarding'
import { cn } from '@/lib/utils'
import { BookOpen, Code, Palette, Rocket, X, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

type OnboardingProgressData = {
  customizedChatbot: boolean
  uploadedKnowledge: boolean
  copiedEmbedCode: boolean
  exploredPricing: boolean
  onboardingCompleted: boolean
  onboardingDismissed: boolean
}

type Props = {
  progress: OnboardingProgressData
  firstDomainSlug: string
}

type Step = {
  key: keyof Omit<OnboardingProgressData, 'onboardingCompleted' | 'onboardingDismissed'>
  title: string
  description: string
  icon: React.ReactNode
  href: string
}

export const GettingStartedCard = ({ progress, firstDomainSlug }: Props) => {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)
  const [collapsing, setCollapsing] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const steps: Step[] = [
    {
      key: 'customizedChatbot',
      title: 'Customize your chatbot',
      description: "Set your bot's personality, colors, and welcome message",
      icon: <Palette className="w-4 h-4" />,
      href: `/settings/${firstDomainSlug}/appearance`,
    },
    {
      key: 'uploadedKnowledge',
      title: 'Upload to Knowledge Base',
      description: 'Give your chatbot your docs, FAQs, and website content',
      icon: <BookOpen className="w-4 h-4" />,
      href: `/settings/${firstDomainSlug}/knowledge-base`,
    },
    {
      key: 'copiedEmbedCode',
      title: 'Copy your embed code',
      description: 'Add the chat widget to your website in minutes',
      icon: <Code className="w-4 h-4" />,
      href: `/settings/${firstDomainSlug}/embed`,
    },
    {
      key: 'exploredPricing',
      title: 'Explore pricing plans',
      description: 'Unlock more domains, conversations, and features',
      icon: <Zap className="w-4 h-4" />,
      href: '/account/billing',
    },
  ]

  const stepsCompleted = steps.filter((s) => progress[s.key]).length
  const radius = 16
  const circumference = 2 * Math.PI * radius
  const dashoffset = circumference - (circumference * stepsCompleted) / 4

  const handleDismiss = async () => {
    setCollapsing(true)
    setTimeout(() => setDismissed(true), 400)
    await onDismissOnboarding()
  }

  if (dismissed || progress.onboardingCompleted || progress.onboardingDismissed) {
    return null
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        'w-full rounded-2xl border border-border overflow-hidden shadow-sm mb-6 transition-all duration-400 ease-in-out',
        collapsing ? 'opacity-0 max-h-0 mb-0' : 'opacity-100 max-h-[600px]'
      )}
      style={{ transition: 'opacity 0.4s ease, max-height 0.4s ease, margin-bottom 0.4s ease' }}
    >
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-800 dark:via-blue-700 dark:to-indigo-800 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-base leading-snug">Getting Started</h2>
              <p className="text-blue-100 text-xs mt-0.5">
                Complete these steps to get the most out of SendWise AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <svg
                className="-rotate-90"
                width="44"
                height="44"
                viewBox="0 0 44 44"
                fill="none"
              >
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  stroke="white"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.7s ease' }}
                />
              </svg>
              <span className="text-sm font-medium text-white">
                {stepsCompleted} of 4
              </span>
            </div>

            <button
              onClick={handleDismiss}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors duration-200 cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card divide-y divide-border">
        {steps.map((step) => {
          const done = progress[step.key]
          return (
            <div
              key={step.key}
              className={cn(
                'flex items-center gap-4 px-5 py-4 transition-colors duration-150',
                !done && 'hover:bg-muted/50 cursor-pointer group'
              )}
              onClick={() => !done && router.push(step.href)}
            >
              <div className="flex-shrink-0">
                {done ? (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center transition-all duration-300 scale-100">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="animate-in zoom-in duration-300"
                    >
                      <path
                        d="M2 6 L5 9 L10 3"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 group-hover:border-blue-400 transition-colors duration-200" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-sm font-medium transition-colors duration-200',
                      done
                        ? 'line-through text-muted-foreground'
                        : 'text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                <p
                  className={cn(
                    'text-xs mt-0.5 transition-colors duration-200',
                    done ? 'text-muted-foreground/60' : 'text-muted-foreground'
                  )}
                >
                  {step.description}
                </p>
              </div>

              <div className="flex-shrink-0">
                {done ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-xs font-medium">
                    Done
                  </span>
                ) : (
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:underline transition-all duration-200">
                    Go →
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
