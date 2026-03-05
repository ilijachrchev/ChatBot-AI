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
    color: 'from-blue-500 to-blue-600',
    traits: ['Persuasive', 'Goal-oriented', 'Professional'],
  },
  {
    id: 'APPOINTMENT_SETTER',
    name: 'Appointment Setter',
    icon: Calendar,
    description: 'Focuses on booking calls and meetings efficiently',
    color: 'from-purple-500 to-purple-600',
    traits: ['Scheduling expert', 'Time-conscious', 'Organized'],
  },
  {
    id: 'CUSTOMER_SUPPORT',
    name: 'Customer Support',
    icon: Heart,
    description: 'Answers FAQs and provides troubleshooting with patience',
    color: 'from-emerald-500 to-emerald-600',
    traits: ['Patient', 'Helpful', 'Empathetic'],
  },
  {
    id: 'ECOMMERCE_RECOMMENDER',
    name: 'Shopping Assistant',
    icon: ShoppingCart,
    description: 'Helps find products, compares options, suggests upsells',
    color: 'from-amber-500 to-amber-600',
    traits: ['Product expert', 'Attentive', 'Suggestive'],
  },
  {
    id: 'REAL_ESTATE_QUALIFIER',
    name: 'Real Estate Agent',
    icon: GraduationCap,
    description: 'Property expert who understands market trends and buyer needs',
    color: 'from-rose-500 to-rose-600',
    traits: ['Market-savvy', 'Consultative', 'Detailed'],
  },
  {
    id: 'HEALTHCARE_INTAKE',
    name: 'Medical Intake',
    icon: Stethoscope,
    description: 'Collects patient information and schedules appointments',
    color: 'from-cyan-500 to-cyan-600',
    traits: ['Professional', 'Confidential', 'Precise'],
  },
  {
    id: 'RESTAURANT_RESERVATION',
    name: 'Restaurant Host',
    icon: Utensils,
    description: 'Takes reservations and answers menu questions warmly',
    color: 'from-orange-500 to-orange-600',
    traits: ['Welcoming', 'Friendly', 'Efficient'],
  },
  {
    id: 'CUSTOM',
    name: 'Custom Persona',
    icon: Settings,
    description: 'Create your own unique AI assistant personality',
    color: 'from-slate-500 to-slate-600',
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
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-slate-100">
                <Sparkles className="h-6 w-6 text-white dark:text-slate-900" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  AI Assistant Persona
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Transform your chatbot into a specialized AI agent tailored to your business
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Active
                </span>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  {currentPersonaName}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Currently Active
            </span>
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              {currentPersonaName}
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 p-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-slate-200/30 to-transparent dark:from-slate-700/20 rounded-full blur-3xl" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 dark:bg-white flex-shrink-0">
              <Zap className="h-5 w-5 text-white dark:text-slate-900" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Choose the perfect personality for your AI assistant
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
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
                    ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'
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
                          ? 'bg-white dark:bg-slate-900'
                          : 'bg-slate-100 dark:bg-slate-900 group-hover:scale-110'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-6 w-6 transition-colors',
                          isSelected
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-600 dark:text-slate-400'
                        )}
                      />
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {isCurrent && !isSelected && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                            Active
                          </span>
                        </div>
                      )}

                      {isSelected && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-900 animate-in zoom-in duration-200">
                          <Check className="h-4 w-4 text-slate-900 dark:text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3
                      className={cn(
                        'text-lg font-bold mb-2 transition-colors',
                        isSelected
                          ? 'text-white dark:text-slate-900'
                          : 'text-slate-900 dark:text-white'
                      )}
                    >
                      {persona.name}
                    </h3>
                    <p
                      className={cn(
                        'text-sm leading-relaxed mb-4 transition-colors',
                        isSelected
                          ? 'text-white/80 dark:text-slate-700'
                          : 'text-slate-600 dark:text-slate-400'
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
                              ? 'bg-white/10 dark:bg-slate-900/20 text-white dark:text-slate-900 border border-white/20 dark:border-slate-900/30'
                              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
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
          <div className="rounded-2xl border-2 border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-slate-950 p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Sales Agent Features
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase tracking-wider mt-0.5">
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
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900/50 border border-blue-100 dark:border-blue-900/50"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/50 flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                Add your products in Domain Settings → Products to enable automatic product recommendations in chat conversations.
              </p>
              <Link href={`/settings/${domain}/products`}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 whitespace-nowrap flex-shrink-0"
                >
                  Manage Products
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {selectedPersona === 'APPOINTMENT_SETTER' && (
          <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-900 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/20 dark:to-slate-950 p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/25">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Appointment Setter Features
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 uppercase tracking-wider mt-0.5">
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
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900/50 border border-purple-100 dark:border-purple-900/50"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950/50 flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-purple-50/80 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                Your appointment booking portal is automatically shared with customers when they ask to schedule. View all bookings in the Appointments section.
              </p>
              <Link href="/appointment">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 whitespace-nowrap flex-shrink-0"
                >
                  View Appointments
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {selectedPersona === 'CUSTOMER_SUPPORT' && (
          <div className="rounded-2xl border-2 border-green-200 dark:border-green-900 bg-gradient-to-br from-green-50/50 to-white dark:from-green-950/20 dark:to-slate-950 p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/25">
                  <Headphones className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Customer Support Features
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-900 uppercase tracking-wider mt-0.5">
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
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900/50 border border-green-100 dark:border-green-900/50"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/50 flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-green-50/80 dark:bg-green-950/20 border border-green-100 dark:border-green-900/50 mb-3">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Your knowledge base and helpdesk FAQs are automatically provided to the support bot. The more you add in Bot Training, the smarter your support gets.
              </p>
            </div>

            <div className="flex gap-3">
              <Link href={`/settings/${domain}/bot-training`}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/50 whitespace-nowrap"
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
                  className="text-slate-600 dark:text-slate-400 whitespace-nowrap"
                >
                  View Support Tickets
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {selectedPersona === 'ECOMMERCE_RECOMMENDER' && (
          <div className="rounded-2xl border-2 border-pink-200 dark:border-pink-900 bg-gradient-to-br from-pink-50/50 to-white dark:from-pink-950/20 dark:to-slate-950 p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-amber-500 shadow-lg shadow-pink-500/25">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Shopping Assistant Features
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 uppercase tracking-wider mt-0.5">
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
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900/50 border border-pink-100 dark:border-pink-900/50"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950/50 flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-pink-600 dark:text-pink-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-pink-50/80 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/50">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                Products added in Domain Settings → Products are automatically shown to the shopping assistant. The bot will recommend, compare, and guide customers to the right product.
              </p>
              <Link href={`/settings/${domain}/products`}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/50 whitespace-nowrap flex-shrink-0"
                >
                  Manage Products
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {selectedPersona === 'REAL_ESTATE_QUALIFIER' && (
          <div className="rounded-2xl border-2 border-orange-200 dark:border-orange-900 bg-gradient-to-br from-orange-50/50 to-white dark:from-orange-950/20 dark:to-slate-950 p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 shadow-lg shadow-orange-500/25">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Real Estate Features
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 uppercase tracking-wider mt-0.5">
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
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900/50 border border-orange-100 dark:border-orange-900/50"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/50 flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-orange-50/80 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/50 mb-3">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Every qualified lead from real estate conversations is automatically saved to your Leads section with their property requirements — budget, location, size, and timeline.
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/properties">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/50 whitespace-nowrap"
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
                  className="text-slate-600 dark:text-slate-400 whitespace-nowrap"
                >
                  View Leads
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {selectedPersona === 'HEALTHCARE_INTAKE' && (
          <div className="rounded-2xl border-2 border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50/50 to-white dark:from-cyan-950/20 dark:to-slate-950 p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/25">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Medical Intake Features
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 uppercase tracking-wider mt-0.5">
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
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900/50 border border-cyan-100 dark:border-cyan-900/50"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-950/50 flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-3 mb-4">
              <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed">
                ⚠️ This persona includes critical safety rules. The bot will never provide medical diagnoses and will always direct emergency situations to emergency services immediately.
              </p>
            </div>

            <Link href="/patient-intake">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 whitespace-nowrap"
              >
                View Patient Intake
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        )}

        {selectedPersona === 'RESTAURANT_RESERVATION' && (
          <div className="rounded-2xl border-2 border-yellow-200 dark:border-yellow-900 bg-gradient-to-br from-yellow-50/50 to-white dark:from-yellow-950/20 dark:to-slate-950 p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/25">
                  <Utensils className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Restaurant Features
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 uppercase tracking-wider mt-0.5">
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
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900/50 border border-yellow-100 dark:border-yellow-900/50"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-950/50 flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-yellow-50/80 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/50 mb-3">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Reservations booked through the chatbot appear in your Reservations section with full guest details, party size, and any special requests.
              </p>
            </div>

            <Link href="/reservations">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-950/50 whitespace-nowrap"
              >
                View Reservations
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        )}

        {selectedPersona === 'CUSTOM' && (
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 dark:bg-white">
                <Bot className="h-5 w-5 text-white dark:text-slate-900" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Custom Instructions
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Define your AI assistant's unique personality and behavior
                </p>
              </div>
            </div>

            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Example: You are a professional financial advisor specializing in retirement planning. Be knowledgeable, trustworthy, and always prioritize the client's best interests..."
              className="min-h-[200px] text-sm leading-relaxed resize-none border-2 focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
            />

            <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="font-bold text-slate-900 dark:text-white">Pro Tip:</span> Include tone, expertise level, communication style, and key behaviors. The more specific you are, the better your AI assistant will perform.
              </p>
            </div>
          </div>
        )}

        {cooldownInfo && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-2 duration-300">
            <Lock className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-white">
                Persona locked for {cooldownInfo.hoursRemaining} more hour{cooldownInfo.hoursRemaining !== 1 ? 's' : ''}
              </span>
              {' '}— last changed at {cooldownInfo.changedAt}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-800">
          {!hasChanges ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No changes to save
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
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
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed hover:shadow-lg'
                : 'bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 hover:shadow-xl'
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
            <AlertDialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Change AI Persona?
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              You are switching from{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{currentPersonaName}</span>
              {' '}to{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{pendingPersonaName}</span>.
            </p>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                This will reset your chatbot's behavior immediately for all new conversations. Existing conversations are not affected.
              </p>
            </div>

            {currentPersona === 'CUSTOM' && currentCustomPrompt && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed font-medium">
                  Your custom instructions will be cleared.
                </p>
              </div>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              You can only change your persona once every 24 hours.
            </p>
          </div>

          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel
              onClick={handleCancel}
              className="border-slate-200 dark:border-slate-800"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleConfirm}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
            >
              Confirm Switch
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
