'use client'

import { onIntegrateDomain } from '@/actions/settings'
import { AddDomainSchema } from '@/schemas/settings.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

type DomainForm = z.infer<typeof AddDomainSchema>

export const useOnboardingDomain = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DomainForm>({
    resolver: zodResolver(AddDomainSchema),
  })

  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [addedDomainName, setAddedDomainName] = useState<string | null>(null)

  const onAddDomain = handleSubmit(async (values: DomainForm) => {
    setLoading(true)

    try {
      let iconUrl = ''

      if (values.image && values.image.length > 0) {
        const formData = new FormData()
        formData.append('file', values.image[0])

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          toast.error('Failed to upload image')
          setLoading(false)
          return
        }

        const uploadData = await uploadResponse.json()
        iconUrl = uploadData.url
      }

      const result = await onIntegrateDomain(values.domain, iconUrl)

      if (result?.status === 200) {
        reset()
        setAddedDomainName(values.domain)
        setIsSuccess(true)
      } else {
        toast.error(result?.message || 'Error adding domain')
      }
    } catch (error) {
      console.error('Error adding domain:', error)
      toast.error('Failed to add domain')
    } finally {
      setLoading(false)
    }
  })

  return {
    register,
    onAddDomain,
    errors,
    loading,
    isSuccess,
    addedDomainName,
  }
}
