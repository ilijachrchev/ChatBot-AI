import {
  onAddCustomersToEmail,
  onBulkMailer,
  onCreateMarketingCampaign,
  onGetAllCustomerResponses,
  onGetEmailTemplate,
  onSaveEmailTemplate,
  onRemoveCustomerFromCapaign,
  onScheduleCampaign,
} from '@/actions/mail'
import { EmailMarketingBodySchema, EmailMarketingSchema } from '@/schemas/marketing.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export const useEmailMarketing = () => {
  const [isSelected, setIsSelected] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [campaignId, setCampaignId] = useState<string | undefined>()
  const [processing, setProcessing] = useState<boolean>(false)
  const [isId, setIsId] = useState<string | undefined>(undefined)
  const [editing, setEditing] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(EmailMarketingSchema),
  })

  const {
    register: registerEmail,
    formState: { errors: emailErrors },
    handleSubmit: SubmitEmail,
    setValue,
  } = useForm({
    resolver: zodResolver(EmailMarketingBodySchema),
  })
  const router = useRouter()

  const onCreateCampaign = handleSubmit(async (values) => {
    try {
      setLoading(true)
      const campaign = await onCreateMarketingCampaign(values.name)
      if (campaign) {
        reset()
        toast.success(campaign.message)
        setLoading(false)
        router.refresh()
      }
    } catch (error) {
      console.log(error)
    }
  })

  const onCreateEmailTemplate = SubmitEmail(async (values) => {
    try {
      setEditing(true)
      const template = JSON.stringify(values.description)
      const emailTemplate = await onSaveEmailTemplate(template, campaignId!)
      if (emailTemplate) {
        toast.success(emailTemplate.message)
        setEditing(false)
      }
    } catch (error) {
      console.log(error)
    }
  })

  const onSelectCampaign = (id: string) => setCampaignId(id)

  const onAddCustomersToCampaign = async () => {
    try {
      setProcessing(true)
      const customersAdd = await onAddCustomersToEmail(isSelected, campaignId!)
      if (customersAdd) {
        toast.success(customersAdd.message)
        setProcessing(false)
        setCampaignId(undefined)
        router.refresh()
      }
    } catch (error) {
      console.log(error)
    }
  }

  const onRemoveCustomer = async (campaignId: string, email: string) => {
    try {
      setProcessing(true)
      const res = await onRemoveCustomerFromCapaign(campaignId, email)
      if (res) {
        toast.success(res.message)
        setProcessing(false)
        router.refresh()
      }
    } catch (error) {
      console.log(error)
    }
  }

  const onSelectedEmails = (email: string) => {
    const duplicate = isSelected.find((e) => e == email)
    if (duplicate) {
      setIsSelected(isSelected.filter((e) => e !== email))
    } else {
      setIsSelected((prev) => [...prev, email])
    }
  }

  const onBulkEmail = async (emails: string[], campaignId: string) => {
    try {
      const mails = await onBulkMailer(emails, campaignId)
      if (mails) {
        toast.success(mails.message)
        router.refresh()
      }
    } catch (error) {
      console.log(error)
    }
  }


const onSchedule = async (
  campaignId: string, 
  scheduledData: { date: string; time: string } | null,
  timezone: string
) => {
  console.log('🎯 Hook onSchedule called')
  console.log('Campaign:', campaignId)
  console.log('Schedule Data:', scheduledData)
  console.log('Timezone:', timezone)
  
  try {
    const result = await onScheduleCampaign(campaignId, scheduledData, timezone)
    console.log('📬 Result:', result)
    
    if (result?.status === 200) {
      toast.success(
        scheduledData ? 'Campaign scheduled! 📅' : 'Campaign sent! 🚀',
        {
          description: result.message,
        }
      )
      router.refresh()
      return true
    } else {
      toast.error('Failed', {
        description: result?.message || 'Please try again',
      })
      return false
    }
  } catch (error) {
    console.error('❌ Hook error:', error)
    toast.error('Error', {
      description: 'Failed to process campaign',
    })
    return false
  }
}


  const onSetAnswersId = (id: string) => setIsId(id)

  return {
    onSelectedEmails,
    isSelected,
    onCreateCampaign,
    register,
    errors,
    loading,
    onSelectCampaign,
    processing,
    campaignId,
    onAddCustomersToCampaign,
    onBulkEmail,
    onSetAnswersId,
    isId,
    registerEmail,
    emailErrors,
    onCreateEmailTemplate,
    editing,
    setValue,
    onRemoveCustomer,
    onSchedule,
  }
}

export const useAnswers = (id: string) => {
  const [answers, setAnswers] = useState<
    {
      customer: {
        questions: { question: string; answered: string | null }[]
      }[]
    }[]
  >([])
  const [loading, setLoading] = useState<boolean>(false)

  const onGetCustomerAnswers = async () => {
    try {
      setLoading(true)
      const answer = await onGetAllCustomerResponses(id)
      setLoading(false)
      if (answer) {
        setAnswers(answer)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    onGetCustomerAnswers()
  }, [])

  return { answers, loading }
}

export const useEditEmail = (id: string) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [template, setTemplate] = useState<string>('')

  const onGetTemplate = async (id: string) => {
    try {
      setLoading(true)
      const email = await onGetEmailTemplate(id)
      if (email) {
        setTemplate(email)
      }
      setLoading(false)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    onGetTemplate(id)
  }, [])

  return { loading, template }
}