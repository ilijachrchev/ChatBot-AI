import React, { ReactNode } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import Image from 'next/image'
import { ArrowLeft, ArrowRight } from 'lucide-react'

type Props = {
    trigger: React.ReactNode
    children: ReactNode
    title: string
    description: string
    type?: 'Integration'
    logo?: string
}

const Modal = ({
    trigger,
    children,
    title,
    description,
    type,
    logo,
}: Props) => {
  switch (type) {
    case 'Integration':
        return (
            <Dialog>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogContent className='bg-white'>
                    <div className='flex justify-center gap-3'>
                        <div className='w-12 h-12 relative'>
                            <Image
                                src='/images/maloLogo.png'
                                fill
                                alt='SendWise-AI'
                            />
                        </div>
                        <div className='text-gray-400'>
                            <ArrowLeft size={20} />
                            <ArrowRight size={20} />
                        </div>
                        <div className='w-12 h-12 relative'>
                            <Image
                                src={`/images/stripe.png`}
                                fill
                                alt='Stripe'
                            />
                        </div>
                    </div>
                    <DialogHeader className='flex items-center'>
                        <DialogTitle className='text-xl'>{title}</DialogTitle>
                        <DialogDescription className='text-center'>
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                    {children}
                </DialogContent>
            </Dialog>
        )
        default:
            return (
                <Dialog>
                    <DialogTrigger asChild>{trigger}</DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className='text-xl'>{title}</DialogTitle>
                            <DialogDescription>{description}</DialogDescription>
                        </DialogHeader>
                        {children}
                    </DialogContent>
                </Dialog>
            )
  }
}

export default Modal