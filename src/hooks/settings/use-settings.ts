"use client"
import { onChatBotImageUpdate, onUpdateChatbotColor, onCreateFilterQuestions, onCreateHelpDeskQuestion, onCreateNewDomainProduct, onDeleteUserDomain, onGetAllFilterQuestions, onGetAllHelpDeskQuestions, onUpdateDomain, onUpdatePassword, onUpdateWelcomeMessage, onUpdateChatbotCustomization } from '@/actions/settings'
import { ChangePasswordProps, ChangePasswordSchema } from '@/schemas/auth.schema'
import { AddProductProps, AddProductSchema, DomainSettingsProps, DomainSettingsSchema, FilterQuestionsProps, FilterQuestionsSchema, HelpDeskQuestionsProps, HelpDeskQuestionsSchema } from '@/schemas/settings.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { uploadImageToNode } from '@/lib/upload'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export const useThemeMode = () => {
    const { setTheme, theme } = useTheme()
    return {
        setTheme,
        theme
    }
}

export const useChangePassword = () => {
    const { 
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ChangePasswordProps>({
        resolver: zodResolver(ChangePasswordSchema),
        mode: 'onChange',
    })

    const [loading, setLoading] = useState<boolean>(false)
    const onChangePassword = handleSubmit(async (values) => {
        try {
            setLoading(true)
            const updated = await onUpdatePassword(values.password)
            if (updated) {
                reset()
                setLoading(false)
                toast('Success', { description: updated.message })
            }
        } catch (error) {
            console.log(error)
        }
    })
    return {
        register,
        errors,
        onChangePassword,
        loading
    }
}

export const useSettings = (id: string, chatBotId: string) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<DomainSettingsProps>({
        resolver: zodResolver(DomainSettingsSchema),
    })
    const router = useRouter()
    const [loading, setLoading] = useState<boolean>(false)
    const [deleting, setDeleting] = useState<boolean>(false)

    useEffect(() => {
        register('chatbotColor')
        register('chatbotTitle')
        register('chatbotSubtitle')
        register('userBubbleColor')
        register('botBubbleColor')
        register('userTextColor')
        register('botTextColor')
        register('buttonStyle')
        register('bubbleStyle')
        register('showAvatars')
        register('widgetSize')
        register('widgetStyle')
    }, [register])
    
    const watchedIcon = watch('image')
    const watchedWelcomeMessage = watch('welcomeMessage')
    const watchedColor = watch('chatbotColor')
    const watchedTitle = watch('chatbotTitle')
    const watchedSubtitle = watch('chatbotSubtitle')
    const watchedUserBubbleColor = watch('userBubbleColor')
    const watchedBotBubbleColor = watch('botBubbleColor')
    const watchedUserTextColor = watch('userTextColor')
    const watchedBotTextColor = watch('botTextColor')
    const watchedButtonStyle = watch('buttonStyle')
    const watchedBubbleStyle = watch('bubbleStyle')
    const watchedShowAvatars = watch('showAvatars')
    const watchedWidgetSize = watch('widgetSize')
    const watchedWidgetStyle = watch('widgetStyle')

    const [previewIcon, setPreviewIcon] = useState<string | null>(null)

    useEffect(() => {
        if (watchedIcon && watchedIcon[0]) {
            const file = watchedIcon[0]
            const objectUrl = URL.createObjectURL(file)
            setPreviewIcon(objectUrl)
            
            return () => URL.revokeObjectURL(objectUrl)
        }
    }, [watchedIcon])

    const onUpdateSettings = handleSubmit(async (values) => {
        setLoading(true)
        
        if(values.domain) {
            const domain = await onUpdateDomain(id, values.domain)
            if (domain) {
                toast('Success', { description: domain.message })
            }
        }
        
        if (values.image && values.image[0]) {
            try {
                const imageUrl = await uploadImageToNode(values.image[0])
                const image = await onChatBotImageUpdate(chatBotId, imageUrl)
                
                if (image) {
                    const isSuccess = image.status === 200
                    toast(isSuccess ? 'Success ✅' : 'Error ❌', {
                        description: image.message,
                        duration: 4000,
                    })
                }
            } catch (error) {
                toast.error('Failed to upload image')
                console.error(error)
            }
        }
        
        if (values.welcomeMessage) {
            const message = await onUpdateWelcomeMessage(values.welcomeMessage, id)
            if (message) {
                toast('Success', { description: message.message })
            }
        }

        if (values.chatbotColor) {
            const color = await onUpdateChatbotColor(chatBotId, values.chatbotColor)
            if (color) {
                if (color.status === 200) {
                    toast.success(color.message)
                } else {
                    toast.error(color.message)
                }
            }
        }
        if (
            values.chatbotTitle ||
            values.chatbotSubtitle ||
            values.userBubbleColor ||
            values.botBubbleColor ||
            values.userTextColor ||
            values.botTextColor ||
            values.buttonStyle ||
            values.bubbleStyle ||
            values.showAvatars !== undefined ||
            values.widgetSize ||
            values.widgetStyle
        ) {
            const customization = await onUpdateChatbotCustomization(chatBotId, {
                chatbotTitle: values.chatbotTitle,
                chatbotSubtitle: values.chatbotSubtitle,
                userBubbleColor: values.userBubbleColor,
                botBubbleColor: values.botBubbleColor,
                userTextColor: values.userTextColor,
                botTextColor: values.botTextColor,
                buttonStyle: values.buttonStyle,
                bubbleStyle: values.bubbleStyle,
                showAvatars: values.showAvatars,
                widgetSize: values.widgetSize,
                widgetStyle: values.widgetStyle,
            })

            if (customization) {
                if (customization.status === 200) {
                    toast.success(customization.message)
                } else {
                    toast.error(customization.message)
                }
            }
        }
        
        reset()
        router.refresh()
        setLoading(false)
    })

    const onDeleteDomain = async () => {
        setDeleting(true)
        const deleted = await onDeleteUserDomain(id)

        if (deleted) {
            toast('Success', { description: deleted.message })
            setDeleting(false)
            router.refresh()
        }
    }
    
    return {
        register,
        onUpdateSettings,
        errors,
        loading,
        onDeleteDomain,
        deleting,
        previewIcon,
        watchedWelcomeMessage,
        watchedColor,
        watchedTitle,
        watchedSubtitle,
        watchedUserBubbleColor,
        watchedBotBubbleColor,
        watchedUserTextColor,
        watchedBotTextColor,
        watchedButtonStyle,
        watchedBubbleStyle,
        watchedShowAvatars,
        setValue,
        watchedWidgetSize,
        watchedWidgetStyle,
    }
}

export const useHelpDesk = (id: string) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<HelpDeskQuestionsProps>({
    resolver: zodResolver(HelpDeskQuestionsSchema),
  })

  const [loading, setLoading] = useState<boolean>(false)
  const [isQuestions, setIsQuestions] = useState<
    { id: string; question: string; answer: string }[]
  >([])
  const onSubmitQuestion = handleSubmit(async (values) => {
    setLoading(true)
    const question = await onCreateHelpDeskQuestion(
      id,
      values.question,
      values.answer
    )
    if (question) {
      setIsQuestions(question.questions!)
      if (question.status === 200) {
        toast.success(question.message);
      } else {
        toast.error(question.message);
      }
      
      setLoading(false)
      reset()
    }
  })

  const onGetQuestions = async () => {
    setLoading(true)
    const questions = await onGetAllHelpDeskQuestions(id)
    if (questions) {
      setIsQuestions(questions.questions)
      setLoading(false)
    }
  }

  useEffect(() => {
    onGetQuestions()
  }, [])

  return {
    register,
    onSubmitQuestion,
    errors,
    isQuestions,
    loading,
  }
}


export const useFilterQuestions = (id: string) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FilterQuestionsProps>({
        resolver: zodResolver
        (FilterQuestionsSchema),
    })

    const [loading, setLoading] = useState<boolean>(false)
    const [isQuestions, setIsQuestions] = useState<
    { id: string; question: string }[]>([])

    const onAddFilterQuestions = handleSubmit(async (values) => {
        setLoading(true)
        const questions = await onCreateFilterQuestions(id, values.question)
        if(questions) {
            setIsQuestions(questions.questions!)
            if (questions.status === 200) {
                toast.success(questions.message);
            } else {
                toast.error(questions.message);
            }
            reset()
            setLoading(false)
        }
    })

    const onGetQuestions = async () => {
        setLoading(true)
        const questions = await onGetAllFilterQuestions(id)
        if (questions) {
            setIsQuestions(questions.questions)
            setLoading(false)
        }
    }

    useEffect(() => {
        onGetQuestions()
    }, [])

    return {
        loading,
        onAddFilterQuestions,
        register,
        errors,
        isQuestions,
    }
}

export const useProducts = (domainId: string) => {
    const [loading, setLoading] = useState<boolean>(false)
    const {
        register,
        reset,
        formState: { errors },
        handleSubmit,
    } = useForm<AddProductProps>({
        resolver: zodResolver(AddProductSchema),
    })

    const onCreateNewProduct = handleSubmit(async (values) => {
        try {
            setLoading(true)
            const uploaded = await uploadImageToNode(values.image[0])
            const product = await onCreateNewDomainProduct(
                domainId,
                values.name,
                uploaded,
                values.price
            )
            if (product) {
                reset()
                toast.success(product.message)
                setLoading(false)
            }
        } catch (error) {
            console.log(error)
        }
    })

    return { 
        onCreateNewProduct,
        register,
        errors,
        loading
    }
}