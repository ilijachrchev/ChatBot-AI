'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label' 
import { Textarea } from '@/components/ui/textarea'
import { PERSONAS, PersonaType } from '@/constants/personas'
import { cn } from '@/lib/utils'
import { Check, Info, Sparkles, Save } from 'lucide-react'
import { toast } from 'sonner'
import { onUpdateChatbotPersona } from '@/actions/settings'
import { Loader } from '@/components/loader'

type PersonaSelectorProps = {
  chatBotId: string 
  currentPersona: PersonaType
  currentCustomPrompt?: string | null
}

export const PersonaSelector = ({
  chatBotId,
  currentPersona,
  currentCustomPrompt,
}: PersonaSelectorProps) => {
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>(currentPersona)
  const [customPrompt, setCustomPrompt] = useState(currentCustomPrompt || '')
  const [showCustomPrompt, setShowCustomPrompt] = useState(currentPersona === 'CUSTOM')
  const [saving, setSaving] = useState(false)

  const handlePersonaChange = (personaId: PersonaType) => {
    setSelectedPersona(personaId)
    setShowCustomPrompt(personaId === 'CUSTOM')
  }

  const handleSave = async () => {
    if (selectedPersona === 'CUSTOM' && !customPrompt.trim()) {
      toast.error('Custom prompt required', {
        description: 'Please enter a custom system prompt for your AI assistant.'
      })
      return
    }

    setSaving(true)
    try {
      const result = await onUpdateChatbotPersona(
        chatBotId,
        selectedPersona,
        selectedPersona === 'CUSTOM' ? customPrompt : null
      )

      if (result?.status === 200) {
        toast.success('Persona updated! 🎉', {
          description: result.message
        })
      } else {
        toast.error('Failed to save', {
          description: result?.message || 'Please try again'
        })
      }
    } catch (error) {
      console.error('Error saving persona:', error)
      toast.error('Error', {
        description: 'Failed to save persona'
      })
    } finally {
      setSaving(false)
    }
  }

  const selectedPersonaData = PERSONAS.find(p => p.id === selectedPersona)

  const hasChanges = 
    selectedPersona !== currentPersona || 
    (selectedPersona === 'CUSTOM' && customPrompt !== currentCustomPrompt)

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">
            AI Assistant Persona
          </h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Transform your chatbot into a specialized AI agent tailored to your business.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {PERSONAS.map((persona) => {
          const isSelected = selectedPersona === persona.id
          
          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => handlePersonaChange(persona.id)}
              className={cn(
                'relative p-4 rounded-xl border-2 text-left transition-all duration-200',
                'hover:shadow-lg hover:-translate-y-0.5',
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                  <Check className="h-3 w-3" />
                </div>
              )}

              <div className="flex flex-col gap-2 mb-2">
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg text-2xl',
                  `bg-gradient-to-br ${persona.color}`
                )}>
                  {persona.icon}
                </div>
                <h4 className="font-semibold text-slate-950 dark:text-white text-sm">
                  {persona.name}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                  {persona.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {selectedPersonaData && selectedPersona !== 'CUSTOM' && (
        <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                {selectedPersonaData.name} Selected
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {selectedPersonaData.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {showCustomPrompt && (
        <div className="space-y-2">
          <Label htmlFor="customPrompt" className="text-sm font-medium">
            Custom System Prompt *
          </Label>
          <Textarea
            id="customPrompt"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Enter your custom system prompt here. Define exactly how your AI assistant should behave, what questions it asks, and what tone it uses...

Example:
You are a friendly tech support assistant for a SaaS company. Always be patient, use simple language, and provide step-by-step instructions. When users are frustrated, acknowledge their feelings and assure them you'll help resolve the issue."
            rows={12}
            className="font-mono text-sm"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            💡 Tip: Be specific about the assistant's role, goals, communication style, and any constraints.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg shadow-blue-500/30"
        >
          <Save className="h-4 w-4 mr-2" />
          <Loader loading={saving}>Save Persona</Loader>
        </Button>
        
        {hasChanges && !saving && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            ⚠️ You have unsaved changes
          </p>
        )}
        
        {!hasChanges && !saving && (
          <p className="text-sm text-green-600 dark:text-green-400">
            ✅ All changes saved
          </p>
        )}
      </div>
    </div>
  )
}