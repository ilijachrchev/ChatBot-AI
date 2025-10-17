import { onIntegrateDomain } from '@/actions/settings'
import { AddDomainSchema } from '@/schemas/settings.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { UploadClient } from '@uploadcare/upload-client'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'


const upload = new UploadClient({
    publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string,
})

type DomainForm = z.infer<typeof AddDomainSchema>

export const useDomain = () => {
    const { 
        register,
         handleSubmit,
          formState: { errors },
            reset,
        } = useForm<DomainForm>(
        {
            resolver: zodResolver(AddDomainSchema),
        }
    )

    const pathname = usePathname()
    const [loading, setLoading] = useState<boolean>(false)
    const [isDomain, setIsDomain] = useState<string | undefined>(undefined)
    const router = useRouter()

    useEffect(() => {
        setIsDomain(pathname.split('/').pop())
    }, [pathname])

    const onAddDomain = handleSubmit(async (values:DomainForm) => {
        setLoading(true)
        const uploaded = await upload.uploadFile(values.image[0])
        const domain = await onIntegrateDomain(values.domain, uploaded.uuid)

        if (domain) {
            reset()
            setLoading(false)
            if (domain.status == 200) {
                toast.success('Domain added successfully')
            } else {
                toast.error('Error adding domain')
            }
            router.refresh()
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