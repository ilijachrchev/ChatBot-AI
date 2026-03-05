'use client'

import { onUpdateOnboardingStep, OnboardingStep } from '@/actions/onboarding'
import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'

type Props = {
  step: OnboardingStep
}

export const StepTracker = ({ step }: Props) => {
  useEffect(() => {
    const track = async () => {
      const result = await onUpdateOnboardingStep(step)

      if (result.wasNewlyCompleted) {
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { x: 0.5, y: 0.2 },
          colors: ['#3b82f6', '#f59e0b', '#ffffff', '#8b5cf6'],
          gravity: 1.2,
        })
        toast.success("🎉 You're all set! You're a SendWise pro now.")
      }
    }

    track()
  }, [step])

  return null
}
