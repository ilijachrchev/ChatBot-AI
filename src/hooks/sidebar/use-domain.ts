'use client'

import { onIntegrateDomain } from '@/actions/settings'
import { AddDomainSchema } from '@/schemas/settings.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

type DomainForm = z.infer<typeof AddDomainSchema>

export const useDomain = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DomainForm>({
    resolver: zodResolver(AddDomainSchema),
  })

  const pathname = usePathname()
  const [loading, setLoading] = useState<boolean>(false)
  const [isDomain, setIsDomain] = useState<string | undefined>(undefined)
  const router = useRouter()

  useEffect(() => {
    setIsDomain(pathname.split('/').pop())
  }, [pathname])

  const onAddDomain = handleSubmit(async (values: DomainForm) => {
    setLoading(true)

    try {
      let iconUrl = ''

      if (values.image && values.image.length > 0) {
        console.log('📤 Uploading image to Node...')
        
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
        console.log('✅ Image uploaded:', iconUrl)
      } else {
        console.log('ℹ️ No image provided, using default')
      }

      const domain = await onIntegrateDomain(values.domain, iconUrl)

      if (domain) {
        reset()
        if (domain.status == 200) {
          toast.success(domain.message || 'Domain added successfully')
          router.refresh()
        } else {
          toast.error(domain.message || 'Error adding domain')
        }
      }
    } catch (error) {
      console.error('❌ Error in onAddDomain:', error)
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
    isDomain,
  }
}