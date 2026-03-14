'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import {
  Sparkles,
  Save,
  Bot,
  Briefcase,
  Heart,
  GraduationCap,
  ShoppingCart,
  ShoppingBag,
  Calendar,
  Stethoscope,
  Utensils,
  Settings,
  Zap,
  Check,
  CheckCircle2,
  Lock,
  ExternalLink,
  AlertTriangle,
  Headphones,
  Home,
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { usePersona } from '@/hooks/settings/use-persona'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import Link from 'next/link'

type Props = {
  chatBotId: string
  currentPersona: string
  currentCustomPrompt?: string | null
  personaLastChangedAt?: Date | string | null
  domain: string
}

const PERSONAS = [
  {
    id: 'SALES_AGENT',
    name: 'Sales Agent',
    icon: Briefcase,
    description: 'Handles objections, qualifies leads, and recommends products/services',
    color: 'from-[var(--primary)] to-[var(--primary-light)]',
    traits: ['Persuasive', 'Goal-oriented', 'Professional'],
  },
  {
    id: 'APPOINTMENT_SETTER',
    name: 'Appointment Setter',
    icon: Calendar,
    description: 'Focuses on booking calls and meetings efficiently',
    color: 'from-[var(--primary)] to-[var(--info)]',
    traits: ['Scheduling expert', 'Time-conscious', 'Organized'],
  },
  {
    id: 'CUSTOMER_SUPPORT',
    name: 'Customer Support',
    icon: Heart,
    description: 'Answers FAQs and provides troubleshooting with patience',
    color: 'from-[var(--success)] to-[var(--success)]',
    traits: ['Patient', 'Helpful', 'Empathetic'],
  },
  {
    id: 'ECOMMERCE_RECOMMENDER',
    name: 'Shopping Assistant',
    icon: ShoppingCart,
    description: 'Helps find products, compares options, suggests upsells',
    color: 'from-[var(--warning)] to-[var(--warning)]',
    traits: ['Product expert', 'Attentive', 'Suggestive'],
  },
  {
    id: 'REAL_ESTATE_QUALIFIER',
    name: 'Real Estate Agent',
    icon: GraduationCap,
    description: 'Property expert who understands market trends and buyer needs',
    color: 'from-[var(--danger)] to-[var(--danger)]',
    traits: ['Market-savvy', 'Consultative', 'Detailed'],
  },
  {
    id: 'HEALTHCARE_INTAKE',
    name: 'Medical Intake',
    icon: Stethoscope,
    description: 'Collects patient information and schedules appointments',
    color: 'from-[var(--success)] to-[var(--info)]',
    traits: ['Professional', 'Confidential', 'Precise'],
  },
  {
    id: 'RESTAURANT_RESERVATION',
    name: 'Restaurant Host',
    icon: Utensils,
    description: 'Takes reservations and answers menu questions warmly',
    color: 'from-[var(--warning)] to-[var(--warning)]',
    traits: ['Welcoming', 'Friendly', 'Efficient'],
  },
  {
    id: 'CUSTOM',
    name: 'Custom Persona',
    icon: Settings,
    description: 'Create your own unique AI assistant personality',
    color: 'from-[var(--bg-page)] to-[var(--bg-page)]',
    traits: ['Customizable', 'Flexible', 'Unique'],
  },
]

export const AIPersonaForm = ({
  chatBotId,
  currentPersona,
  currentCustomPrompt,
  personaLastChangedAt,
  domain,
}: Props) => {
  const [selectedPersona, setSelectedPersona] = useState(currentPersona)
  const [customPrompt, setCustomPrompt] = useState(currentCustomPrompt || '')
  const [pendingPersona, setPendingPersona] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const { onUpdatePersona, loading } = usePersona(chatBotId)

  const hasChanges =
    selectedPersona !== currentPersona ||
    (selectedPersona === 'CUSTOM' && customPrompt !== (currentCustomPrompt || ''))

  const isSaveDisabled =
    loading ||
    !hasChanges ||
    (selectedPersona === 'CUSTOM' && !customPrompt.trim())

  const cooldownInfo = (() => {
    if (!personaLastChangedAt) return null
    const hoursSince =
      (Date.now() - new Date(personaLastChangedAt).getTime()) / (1000 * 60 * 60)
    if (hoursSince >= 24) return null
    const hoursRemaining = Math.ceil(24 - hoursSince)
    return {
      hoursRemaining,
      changedAt: new Date(personaLastChangedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
  })()

  const currentPersonaName = PERSONAS.find(p => p.id === currentPersona)?.name || 'Sales Agent'
  const pendingPersonaName = PERSONAS.find(p => p.id === pendingPersona)?.name || ''

  const handlePersonaClick = (personaId: string) => {
    if (personaId === selectedPersona) return
    if (personaId === currentPersona) {
      setSelectedPersona(personaId)
      return
    }
    setPendingPersona(personaId)
    setShowConfirmModal(true)
  }

  const handleConfirm = () => {
    if (pendingPersona) {
      setSelectedPersona(pendingPersona)
    }
    setShowConfirmModal(false)
    setPendingPersona(null)
  }

  const handleCancel = () => {
    setShowConfirmModal(false)
    setPendingPersona(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSaveDisabled) return
    await onUpdatePersona({
      persona: selectedPersona,
      customPrompt: selectedPersona === 'CUSTOM' ? customPrompt : null,
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--bg-page)] to-[var(--bg-page)] dark:from-white dark:to-[var(--bg-page)]">
                <Sparkles className="h-6 w-6 text-[var(--text-primary)]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                  AI Assistant Persona
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Transform your chatbot into a specialized AI agent tailored to your business
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--success)] dark:bg-[var(--success)] border border-[var(--success)] dark:border-[var(--success)]">
              <CheckCircle2 className="h-4 w-4 text-[var(--success)] dark:text-[var(--success)]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[var(--success)] dark:text-[var(--success)] uppercase tracking-wider">
                  Active
                </span>
                <span className="text-xs font-semibold text-[var(--success)] dark:text-[var(--success)]">
                  {currentPersonaName}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--success)] dark:bg-[var(--success)] border border-[var(--success)] dark:border-[var(--success)]">
          <CheckCircle2 className="h-4 w-4 text-[var(--success)] dark:text-[var(--success)] flex-shrink-0" />
          <div className="flex-1">
            <span className="text-[10px] font-bold text-[var(--success)] dark:text-[var(--success)] uppercase tracking-wider block">
              Currently Active
            </span>
            <span className="text-sm font-semibold text-[var(--success)] dark:text-[var(--success)]">
              {currentPersonaName}
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border-2 border-[var(--border-default)] bg-gradient-to-br from-[var(--bg-page)] to-white dark:from-[var(--bg-page)] dark:to-[var(--bg-page)] p-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--bg-page)] to-transparent dark:from-[var(--bg-page)] rounded-full blur-3xl" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-page)] dark:bg-white flex-shrink-0">
              <Zap className="h-5 w-5 text-[var(--text-primary)]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
                Choose the perfect personality for your AI assistant
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Each persona is optimized with specialized prompts and behaviors to deliver exceptional results in specific use cases. Select one below or create your own custom personality.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {PERSONAS.map((persona) => {
            const Icon = persona.icon
            const isSelected = selectedPersona === persona.id
            const isCurrent = currentPersona === persona.id

            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => handlePersonaClick(persona.id)}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 text-left',
                  'hover:shadow-lg hover:scale-[1.02]',
                  isSelected
                    ? 'border-[var(--border-strong)] dark:border-white bg-[var(--bg-page)] dark:bg-white'
                    : 'border-[var(--border-default)] bg-[var(--bg-page)] hover:border-[var(--border-strong)]'
                )}
              >
                <div
                  className={cn(
                    'absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity',
                    isSelected ? 'opacity-30' : 'opacity-0 group-hover:opacity-20'
                  )}
                  style={{
                    background: isSelected
                      ? 'white'
                      : 'linear-gradient(135deg, rgb(148 163 184) 0%, transparent 70%)',
                  }}
                />

                <div className="relative z-10 p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-xl transition-all',
                        isSelected
                          ? 'bg-[var(--bg-page)]'
                          : 'bg-[var(--bg-card)] group-hover:scale-110'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-6 w-6 transition-colors',
                          isSelected
                            ? 'text-[var(--text-primary)]'
                            : 'text-[var(--text-secondary)]'
                        )}
                      />
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {isCurrent && !isSelected && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--success)] dark:bg-[var(--success)] border border-[var(--success)] dark:border-[var(--success)]">
                          <CheckCircle2 className="h-3 w-3 text-[var(--success)] dark:text-[var(--success)]" />
                          <span className="text-[9px] font-bold text-[var(--success)] dark:text-[var(--success)] uppercase tracking-wider">
                            Active
                          </span>
                        </div>
                      )}

                      {isSelected && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-page)] animate-in zoom-in duration-200">
                          <Check className="h-4 w-4 text-[var(--text-primary)]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3
                      className={cn(
                        'text-lg font-bold mb-2 transition-colors',
                        isSelected
                          ? 'text-[var(--text-primary)]'
                          : 'text-[var(--text-primary)]'
                      )}
                    >
                      {persona.name}
                    </h3>
                    <p
                      className={cn(
                        'text-sm leading-relaxed mb-4 transition-colors',
                        isSelected
                          ? 'text-white/80 dark:text-[var(--text-secondary)]'
                          : 'text-[var(--text-secondary)]'
                      )}
                    >
                      {persona.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {persona.traits.map((trait) => (
                        <span
                          key={trait}
                          className={cn(
                            'px-2 py-1 text-[10px] font-semibold rounded-md transition-colors',
                            isSelected
                              ? 'bg-white/10 dark:bg-[var(--bg-page)]/20 text-[var(--text-primary)] border border-white/20 dark:border-[var(--border-default)]/30'
                              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)]'
                          )}
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {selectedPersona === 'SALES_AGENT' && (
          <div className="rounded-2xl border-2 border-[var(--primary)] dark:border-[var(--primary)] bg-gradient-to-br from-[var(--primary)] to-white dark:from-[var(--primary)] dark:to-[var(--bg-page)] p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] shadow-lg shadow-[var(--primary)]">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    Sales Agent Features
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--primary)] dark:bg-[var(--primary)] text-[var(--primary)] dark:text-[var(--primary)] border border-[var(--primary)] dark:border-[var(--border-accent)] uppercase tracking-wider mt-0.5">
                    Exclusive to this persona
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {[
                'Products catalog auto-injected into conversations',
                'Lead qualification scoring visible in conversation inbox',
                'Objection handling powered by your product data',
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--bg-page)]/50 border border-[var(--primary)] dark:border-[var(--primary)]"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] dark:bg-[var(--primary)] flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-[var(--text-accent)]" />
                  </div>
                  <span className="text-xs font-medium text-[var(--text-secondary)] leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--primary)] dark:bg-[var(--primary)] border border-[var(--primary)] dark:border-[var(--primary)]">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1">
                Add your products in Domain Settings → Products to enable automatic product recommendations in chat conversations.
              </p>
              <Link href={`/settings/${domain}/products`}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-[var(--primary)] dark:border-[var(--primary)] text-[var(--primary)] dark:text-[var(--primary)] hover:bg-[var(--primary-hover)] dark:hover:bg-[var(--primary-hover)] whitespace-nowrap flex-shrink-0"
                >
                  Manage Products
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {selectedPersona === 'APPOINTMENT_SETTER' && (
          <div className="rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-card)] p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    Appointment Setter Features
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--border-strong)] uppercase tracking-wider mt-0.5">
                    Exclusive to this persona
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {[
                'Automatic booking link injection in conversations',
                'Customer appointment portal enabled',
                'Appointment summary sent to your dashboard',
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--bg-page)]/50 border border-[var(--border-default)]"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary-light)] flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-[var(--primary)]" />
                  </div>
                  <span className="text-xs font-medium text-[var(--text-secondary)] leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)]">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1">
                Your appointment booking portal is automatically shared with customers when they ask to schedule. View all bookings in the Appointments section.
              </p>
              <Link href="/appointment">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-[var(--border-strong)] text-[var(--primary)] hover:bg-[var(--primary-light)] whitespace-nowrap flex-shrink-0"
                >
                  View Appointments
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {selectedPersona === 'CUSTOMER_SUPPORT' && (
          <div className="rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-card)] p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--success)]">
                  <Headphones className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    Customer Support Features
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(61,184,130,0.15)] text-[var(--success)] border border-[var(--border-default)] uppercase tracking-wider mt-0.5">
                    Exclusive to this persona
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {[
                'Knowledge base auto-injected into every conversation',
                'Helpdesk FAQ answers surfaced automatically',
                'Smart escalation to human agent when needed',
                'Support Tickets dashboard to track all issues',
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--bg-page)]/50 border border-[var(--border-default)]"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(61,184,130,0.15)] flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-[var(--success)]" />
                  </div>
                  <span className="text-xs font-medium text-[var(--text-secondary)] leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] mb-3">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Your knowledge base and helpdesk FAQs are automatically provided to the support bot. The more you add in Bot Training, the smarter your support gets.
              </p>
            </div>

            <div className="flex gap-3">
              <Link href={`/settings/${domain}/bot-training`}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-[var(--border-strong)] text-[var(--success)] hover:bg-[rgba(61,184,130,0.1)] whitespace-nowrap"
                >
                  Manage Knowledge Base
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
              <Link href="/support-tickets">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-[var(--text-secondary)] whitespace-nowrap"
                >
                  View Support Tickets
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {selectedPersona === 'ECOMMERCE_RECOMMENDER' && (
          <div className="rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-card)] p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--warning)]">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    Shopping Assistant Features
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(224,155,26,0.15)] text-[var(--warning)] border border-[var(--border-default)] uppercase tracking-wider mt-0.5">
                    Exclusive to this persona
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {[
                'Full product catalog injected into conversations',
                'Price and feature comparison mode enabled',
                'Personalized recommendations based on customer needs',
                'Natural upsell suggestions without being pushy',
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--bg-page)]/50 border border-[var(--border-default)]"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(224,155,26,0.15)] flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-[var(--warning)]" />
                  </div>
                  <span className="text-xs font-medium text-[var(--text-secondary)] leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)]">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1">
                Products added in Domain Settings → Products are automatically shown to the shopping assistant. The bot will recommend, compare, and guide customers to the right product.
              </p>
              <Link href={`/settings/${domain}/products`}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-[var(--border-strong)] text-[var(--warning)] hover:bg-[rgba(224,155,26,0.1)] whitespace-nowrap flex-shrink-0"
                >
                  Manage Products
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {selectedPersona === 'REAL_ESTATE_QUALIFIER' && (
          <div className="rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-card)] p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--danger)]">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    Real Estate Features
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(224,85,85,0.15)] text-[var(--danger)] border border-[var(--border-default)] uppercase tracking-wider mt-0.5">
                    Exclusive to this persona
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {[
                'Buyer/renter qualification flow built-in',
                'Property requirements captured automatically',
                'Qualified leads saved to Leads CRM with full details',
                'Property viewing link auto-injected in conversations',
                'Properties dashboard to manage your listings',
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--bg-page)]/50 border border-[var(--border-default)]"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(224,85,85,0.15)] flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-[var(--danger)]" />
                  </div>
                  <span className="text-xs font-medium text-[var(--text-secondary)] leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] mb-3">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Every qualified lead from real estate conversations is automatically saved to your Leads section with their property requirements — budget, location, size, and timeline.
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/properties">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-[var(--border-strong)] text-[var(--danger)] hover:bg-[rgba(224,85,85,0.1)] whitespace-nowrap"
                >
                  View Properties
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
              <Link href="/leads">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-[var(--text-secondary)] whitespace-nowrap"
                >
                  View Leads
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {selectedPersona === 'HEALTHCARE_INTAKE' && (
          <div className="rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-card)] p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--success)]">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    Medical Intake Features
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(61,184,130,0.15)] text-[var(--success)] border border-[var(--border-default)] uppercase tracking-wider mt-0.5">
                    Exclusive to this persona
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {[
                'Patient intake form collected via conversation',
                'Emergency escalation protocol always active',
                'Medical disclaimer auto-appended to every response',
                'Patient Intake dashboard to review submissions',
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--bg-page)]/50 border border-[var(--border-default)]"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(61,184,130,0.15)] flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-[var(--success)]" />
                  </div>
                  <span className="text-xs font-medium text-[var(--text-secondary)] leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-[rgba(224,85,85,0.08)] border border-[rgba(224,85,85,0.3)] rounded-xl p-3 mb-4">
              <p className="text-sm text-[var(--danger)] leading-relaxed">
                ⚠️ This persona includes critical safety rules. The bot will never provide medical diagnoses and will always direct emergency situations to emergency services immediately.
              </p>
            </div>

            <Link href="/patient-intake">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-[var(--border-strong)] text-[var(--success)] hover:bg-[rgba(61,184,130,0.1)] whitespace-nowrap"
              >
                View Patient Intake
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        )}

        {selectedPersona === 'RESTAURANT_RESERVATION' && (
          <div className="rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--bg-card)] p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--warning)]">
                  <Utensils className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    Restaurant Features
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(224,155,26,0.15)] text-[var(--warning)] border border-[var(--border-default)] uppercase tracking-wider mt-0.5">
                    Exclusive to this persona
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {[
                'Reservation details captured and saved automatically',
                'Dietary restrictions and special occasions noted',
                'Operating hours injected so bot only books during open hours',
                'Reservations dashboard to manage all bookings',
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--bg-page)]/50 border border-[var(--border-default)]"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(224,155,26,0.15)] flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-[var(--warning)]" />
                  </div>
                  <span className="text-xs font-medium text-[var(--text-secondary)] leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] mb-3">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Reservations booked through the chatbot appear in your Reservations section with full guest details, party size, and any special requests.
              </p>
            </div>

            <Link href="/reservations">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-[var(--border-strong)] text-[var(--warning)] hover:bg-[rgba(224,155,26,0.1)] whitespace-nowrap"
              >
                View Reservations
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        )}

        {selectedPersona === 'CUSTOM' && (
          <div className="rounded-2xl border-2 border-[var(--border-default)] bg-[var(--bg-page)] p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-page)] dark:bg-white">
                <Bot className="h-5 w-5 text-[var(--text-primary)]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Custom Instructions
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Define your AI assistant's unique personality and behavior
                </p>
              </div>
            </div>

            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Example: You are a professional financial advisor specializing in retirement planning. Be knowledgeable, trustworthy, and always prioritize the client's best interests..."
              className="min-h-[200px] text-sm leading-relaxed resize-none border-2 focus:ring-2 focus:ring-[var(--border-strong)] dark:focus:ring-white"
            />

            <div className="mt-4 p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)]">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                <span className="font-bold text-[var(--text-primary)]">Pro Tip:</span> Include tone, expertise level, communication style, and key behaviors. The more specific you are, the better your AI assistant will perform.
              </p>
            </div>
          </div>
        )}

        {cooldownInfo && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] animate-in slide-in-from-bottom-2 duration-300">
            <Lock className="h-4 w-4 text-[var(--text-muted)] flex-shrink-0" />
            <p className="text-sm text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">
                Persona locked for {cooldownInfo.hoursRemaining} more hour{cooldownInfo.hoursRemaining !== 1 ? 's' : ''}
              </span>
              {' '}— last changed at {cooldownInfo.changedAt}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-6 border-t border-[var(--border-default)]">
          {!hasChanges ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)]">
              <CheckCircle2 className="h-4 w-4 text-[var(--text-secondary)]" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                No changes to save
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--warning)] dark:bg-[var(--warning)] border border-[var(--warning)] dark:border-[var(--warning)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--warning)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--warning)]"></span>
              </span>
              <span className="text-sm font-medium text-[var(--warning)] dark:text-[var(--warning)]">
                Unsaved changes
              </span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSaveDisabled}
            className={cn(
              'h-11 px-8 font-bold shadow-lg transition-all duration-300',
              isSaveDisabled
                ? 'bg-[var(--bg-card)] text-[var(--text-muted)] cursor-not-allowed hover:shadow-lg'
                : 'bg-[var(--bg-page)] dark:bg-white hover:bg-[var(--bg-page)] dark:hover:bg-[var(--bg-hover)] text-[var(--text-primary)] hover:shadow-xl'
            )}
          >
            <Save className="h-4 w-4 mr-2" />
            <Loader loading={loading}>Save AI Persona</Loader>
          </Button>
        </div>
      </form>

      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-[var(--text-primary)]">
              Change AI Persona?
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <p className="text-sm text-[var(--text-secondary)]">
              You are switching from{' '}
              <span className="font-semibold text-[var(--text-primary)]">{currentPersonaName}</span>
              {' '}to{' '}
              <span className="font-semibold text-[var(--text-primary)]">{pendingPersonaName}</span>.
            </p>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--warning)] dark:bg-[var(--warning)] border border-[var(--warning)] dark:border-[var(--warning)]">
              <AlertTriangle className="h-4 w-4 text-[var(--warning)] dark:text-[var(--warning)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--warning)] dark:text-[var(--warning)] leading-relaxed">
                This will reset your chatbot's behavior immediately for all new conversations. Existing conversations are not affected.
              </p>
            </div>

            {currentPersona === 'CUSTOM' && currentCustomPrompt && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--danger)] dark:bg-[var(--danger)] border border-[var(--danger)] dark:border-[var(--danger)]">
                <AlertTriangle className="h-4 w-4 text-[var(--danger)] dark:text-[var(--danger)] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--danger)] dark:text-[var(--danger)] leading-relaxed font-medium">
                  Your custom instructions will be cleared.
                </p>
              </div>
            )}

            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              You can only change your persona once every 24 hours.
            </p>
          </div>

          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel
              onClick={handleCancel}
              className="border-[var(--border-default)]"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleConfirm}
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
            >
              Confirm Switch
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
