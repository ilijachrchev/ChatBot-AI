import { currentUser } from '@clerk/nextjs/server'
import Image from 'next/image'
import React from 'react'
import ParticleBackground from '@/components/auth/particle-background'
import DashboardPreview from '@/components/auth/dashboard-preview'

type Props = {
    children: React.ReactNode
}

const AuthLayout = async ({ children }: Props) => {
    const user = await currentUser()

    return (
        <div className='min-h-screen flex w-full relative overflow-hidden bg-[var(--bg-page)]'>
            <ParticleBackground />

            <div className='w-full lg:w-[50%] flex flex-col items-center justify-center p-6 md:p-12 relative z-10'>
                <div className='absolute top-8 left-8'>
                    <Image 
                        src="/images/fulllogo.png" 
                        alt='SendWise AI' 
                        width={140}
                        height={45}
                        className='brightness-0 invert'
                    />
                </div>

                <div className='w-full max-w-md'>
                    {children}
                </div>
            </div>

            <div className='hidden lg:flex lg:w-[50%] items-center justify-center relative z-10 p-12'>
                <div className='w-full max-w-2xl'>
                    <div className='mb-12 text-center'>
                        <h2 className='text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight'>
                            Hi I am your AI powered sales assistant,{' '}
                            <span className='text-[var(--primary)]'>
                                SendWise-AI!
                            </span>
                        </h2>
                        <p className='text-[var(--text-muted)] text-lg'>
                            SendWise-AI is capable of capturing lead information without a form...
                            something never done before 🚀
                        </p>
                    </div>
                    <DashboardPreview />
                </div>
            </div>
        </div>
    )
}

export default AuthLayout