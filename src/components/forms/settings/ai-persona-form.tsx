'use client'

import React, { useState, useEffect } from 'react'
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
  Calendar,
  Stethoscope,
  Utensils,
  Settings,
  Zap,
  Check,
  CheckCircle2,
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { usePersona } from '@/hooks/settings/use-persona'
import { cn } from '@/lib/utils'

type Props = {
  chatBotId: string
  currentPersona: string
  currentCustomPrompt?: string | null
}

const PERSONAS = [
  {
    id: 'SALES_AGENT',
    name: 'Sales Agent',
    icon: Briefcase,
    description: 'Handles objections, qualifies leads, and recommends products/services',
    color: 'from-blue-500 to-blue-600',
    darkColor: 'dark:from-blue-600 dark:to-blue-700',
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-950/20',
    borderLight: 'border-blue-200',
    borderDark: 'dark:border-blue-900',
    textLight: 'text-blue-700',
    textDark: 'dark:text-blue-300',
    traits: ['Persuasive', 'Goal-oriented', 'Professional'],
  },
  {
    id: 'APPOINTMENT_SETTER',
    name: 'Appointment Setter',
    icon: Calendar,
    description: 'Focuses on booking calls and meetings efficiently',
    color: 'from-purple-500 to-purple-600',
    darkColor: 'dark:from-purple-600 dark:to-purple-700',
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-950/20',
    borderLight: 'border-purple-200',
    borderDark: 'dark:border-purple-900',
    textLight: 'text-purple-700',
    textDark: 'dark:text-purple-300',
    traits: ['Scheduling expert', 'Time-conscious', 'Organized'],
  },
  {
    id: 'CUSTOMER_SUPPORT',
    name: 'Customer Support',
    icon: Heart,
    description: 'Answers FAQs and provides troubleshooting with patience',
    color: 'from-emerald-500 to-emerald-600',
    darkColor: 'dark:from-emerald-600 dark:to-emerald-700',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/20',
    borderLight: 'border-emerald-200',
    borderDark: 'dark:border-emerald-900',
    textLight: 'text-emerald-700',
    textDark: 'dark:text-emerald-300',
    traits: ['Patient', 'Helpful', 'Empathetic'],
  },
  {
    id: 'ECOMMERCE_RECOMMENDER',
    name: 'Shopping Assistant',
    icon: ShoppingCart,
    description: 'Helps find products, compares options, suggests upsells',
    color: 'from-amber-500 to-amber-600',
    darkColor: 'dark:from-amber-600 dark:to-amber-700',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/20',
    borderLight: 'border-amber-200',
    borderDark: 'dark:border-amber-900',
    textLight: 'text-amber-700',
    textDark: 'dark:text-amber-300',
    traits: ['Product expert', 'Attentive', 'Suggestive'],
  },
  {
    id: 'REAL_ESTATE_QUALIFIER',
    name: 'Real Estate Agent',
    icon: GraduationCap,
    description: 'Property expert who understands market trends and buyer needs',
    color: 'from-rose-500 to-rose-600',
    darkColor: 'dark:from-rose-600 dark:to-rose-700',
    bgLight: 'bg-rose-50',
    bgDark: 'dark:bg-rose-950/20',
    borderLight: 'border-rose-200',
    borderDark: 'dark:border-rose-900',
    textLight: 'text-rose-700',
    textDark: 'dark:text-rose-300',
    traits: ['Market-savvy', 'Consultative', 'Detailed'],
  },
  {
    id: 'HEALTHCARE_INTAKE',
    name: 'Medical Intake',
    icon: Stethoscope,
    description: 'Collects patient information and schedules appointments',
    color: 'from-cyan-500 to-cyan-600',
    darkColor: 'dark:from-cyan-600 dark:to-cyan-700',
    bgLight: 'bg-cyan-50',
    bgDark: 'dark:bg-cyan-950/20',
    borderLight: 'border-cyan-200',
    borderDark: 'dark:border-cyan-900',
    textLight: 'text-cyan-700',
    textDark: 'dark:text-cyan-300',
    traits: ['Professional', 'Confidential', 'Precise'],
  },
  {
    id: 'RESTAURANT_RESERVATION',
    name: 'Restaurant Host',
    icon: Utensils,
    description: 'Takes reservations and answers menu questions warmly',
    color: 'from-orange-500 to-orange-600',
    darkColor: 'dark:from-orange-600 dark:to-orange-700',
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-950/20',
    borderLight: 'border-orange-200',
    borderDark: 'dark:border-orange-900',
    textLight: 'text-orange-700',
    textDark: 'dark:text-orange-300',
    traits: ['Welcoming', 'Friendly', 'Efficient'],
  },
  {
    id: 'CUSTOM_PERSONA',
    name: 'Custom Persona',
    icon: Settings,
    description: 'Create your own unique AI assistant personality',
    color: 'from-slate-500 to-slate-600',
    darkColor: 'dark:from-slate-600 dark:to-slate-700',
    bgLight: 'bg-slate-50',
    bgDark: 'dark:bg-slate-950/20',
    borderLight: 'border-slate-200',
    borderDark: 'dark:border-slate-900',
    textLight: 'text-slate-700',
    textDark: 'dark:text-slate-300',
    traits: ['Customizable', 'Flexible', 'Unique'],
  },
]

export const AIPersonaForm = ({ chatBotId, currentPersona, currentCustomPrompt }: Props) => {
  const [selectedPersona, setSelectedPersona] = useState(currentPersona)
  const [customPrompt, setCustomPrompt] = useState(currentCustomPrompt || '')
  const { onUpdatePersona, loading } = usePersona(chatBotId)

  const hasChanges = 
    selectedPersona !== currentPersona || 
    (selectedPersona === 'CUSTOM_PERSONA' && customPrompt !== (currentCustomPrompt || ''))

  const isSaveDisabled = 
    loading || 
    !hasChanges || 
    (selectedPersona === 'CUSTOM_PERSONA' && !customPrompt.trim())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSaveDisabled) return
    
    const success = await onUpdatePersona({
      persona: selectedPersona,
      customPrompt: selectedPersona === 'CUSTOM_PERSONA' ? customPrompt : null,
    })

  }

  const currentPersonaName = PERSONAS.find(p => p.id === currentPersona)?.name || 'Sales Agent'

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
                onClick={() => setSelectedPersona(persona.id)}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 text-left',
                  'hover:shadow-lg hover:scale-[1.02]',
                  isSelected
                    ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                <div className={cn(
                  'absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity',
                  isSelected ? 'opacity-30' : 'opacity-0 group-hover:opacity-20'
                )} 
                style={{
                  background: isSelected 
                    ? 'white' 
                    : 'linear-gradient(135deg, rgb(148 163 184) 0%, transparent 70%)'
                }}
                />

                <div className="relative z-10 p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl transition-all',
                      isSelected
                        ? 'bg-white dark:bg-slate-900'
                        : 'bg-slate-100 dark:bg-slate-900 group-hover:scale-110'
                    )}>
                      <Icon className={cn(
                        'h-6 w-6 transition-colors',
                        isSelected
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-600 dark:text-slate-400'
                      )} />
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
                    <h3 className={cn(
                      'text-lg font-bold mb-2 transition-colors',
                      isSelected
                        ? 'text-white dark:text-slate-900'
                        : 'text-slate-900 dark:text-white'
                    )}>
                      {persona.name}
                    </h3>
                    <p className={cn(
                      'text-sm leading-relaxed mb-4 transition-colors',
                      isSelected
                        ? 'text-white/80 dark:text-slate-700'
                        : 'text-slate-600 dark:text-slate-400'
                    )}>
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

        {selectedPersona === 'CUSTOM_PERSONA' && (
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
              placeholder="Example: You are a professional financial advisor specializing in retirement planning. Be knowledgeable, trustworthy, and always prioritize the client's best interests. Ask clarifying questions before making recommendations..."
              className="min-h-[200px] text-sm leading-relaxed resize-none border-2 focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
            />

            <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="font-bold text-slate-900 dark:text-white">💡 Pro Tip:</span> Include tone, expertise level, communication style, and key behaviors. The more specific you are, the better your AI assistant will perform.
              </p>
            </div>
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
              "h-11 px-8 font-bold shadow-lg transition-all duration-300",
              isSaveDisabled
                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed hover:shadow-lg"
                : "bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 hover:shadow-xl"
            )}
          >
            <Save className="h-4 w-4 mr-2" />
            <Loader loading={loading}>Save AI Persona</Loader>
          </Button>
        </div>
      </form>
    </div>
  )
}