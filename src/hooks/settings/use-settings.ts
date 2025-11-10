"use client"
import { onChatBotImageUpdate, onCreateFilterQuestions, onCreateHelpDeskQuestion, onCreateNewDomainProduct, onDeleteUserDomain, onGetAllFilterQuestions, onGetAllHelpDeskQuestions, onUpdateDomain, onUpdatePassword, onUpdateWelcomeMessage } from '@/actions/settings'
import { ChangePasswordProps, ChangePasswordSchema } from '@/schemas/auth.schema'
import { AddProductProps, AddProductSchema, DomainSettingsProps, DomainSettingsSchema, FilterQuestionsProps, FilterQuestionsSchema, HelpDeskQuestionsProps, HelpDeskQuestionsSchema } from '@/schemas/settings.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { UploadClient } from '@uploadcare/upload-client'
import { id } from 'date-fns/locale'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useEffect } from 'react'

const upload = new UploadClient({
    publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string,
})

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

export const useSettings = (id: string) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<DomainSettingsProps>({
        resolver: zodResolver(DomainSettingsSchema),
    })
    const router = useRouter()
    const [loading, setLoading] = useState<boolean>(false)
    const [deleting, setDeleting] = useState<boolean>(false)
    const onUpdateSettings = handleSubmit(async (values) => {
        setLoading(true)
        if(values.domain) {
            const domain = await onUpdateDomain(id, values.domain)
            if (domain) {
                toast('Success', { description: domain.message })
            }
        }
        if (values.image[0]) {
            const uploaded = await upload.uploadFile(values.image[0])
            const image = await onChatBotImageUpdate(id, uploaded.uuid)
            if (image) {
                const isSuccess = image.status === 200

                toast(isSuccess ? 'Success ✅' : 'Error ❌', {
                    description: image.message,
                    className: isSuccess
                        ? 'bg-cream text-gray-700 border-l-4 border-cyan-400 shadow-md'
                        : 'bg-rose-50 text-red-600 border-l-4 border-red-500 shadow-md',
                    duration: 4000,
                    position: 'top-right',
                    style: { fontWeight: 500 },
                })

                setLoading(false)
            }
        }
        if (values.welcomeMessage) {
            const message = await onUpdateWelcomeMessage(values.welcomeMessage,
                id
            );
            if (message) {
                toast('Success', { description: message.message })
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
            const uploaded = await upload.uploadFile(values.image[0])
            const product = await onCreateNewDomainProduct(
                domainId,
                values.name,
                uploaded.uuid,
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