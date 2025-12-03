'use client'
import { useAuthContextHook } from '@/context/use-auth-context'
import { cn } from '@/lib/utils'
import React from 'react'
import { motion } from 'framer-motion'

const HighLightBar = () => {
    const { currentStep } = useAuthContextHook()

    return (
        <div className='grid grid-cols-3 gap-3'>
            {[1, 2, 3].map((step) => (
                <motion.div
                    key={step}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3, delay: step * 0.1 }}
                    className={cn(
                        'rounded-full h-2 transition-all duration-300',
                        currentStep >= step 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                            : 'bg-white/10'
                    )}
                    style={{ transformOrigin: 'left' }}
                />
            ))}
        </div>
    )
}

export default HighLightBar