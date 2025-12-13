"use client"
import { USER_LOGIN_FORM } from '@/constants/forms'
import React, { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import FormGenerator from '../form-generator'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'

const LoginForm = () => {
    const {
        register,
        formState: { errors },
        watch,
        setValue,
    } = useFormContext()
    
    const [showPassword, setShowPassword] = useState(false)
    const keepMeLoggedIn = watch('keepMeLoggedIn')

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='space-y-6'
        >
            {USER_LOGIN_FORM.map((field, index) => {
                const isPassword = field.type === 'password'
                
                return (
                    <motion.div
                        key={field.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className='relative'
                    >
                        <FormGenerator
                            {...field}
                            register={register}
                            errors={errors}
                            name={field.name}
                            type={isPassword ? (showPassword ? 'text' : 'password') : field.type}
                        />
                        
                        {isPassword && (
                            <button
                                type='button'
                                onClick={() => setShowPassword(!showPassword)}
                                className='absolute right-3 top-[42px] text-slate-400 hover:text-white transition-colors'
                            >
                                {showPassword ? (
                                    <EyeOff className='w-5 h-5' />
                                ) : (
                                    <Eye className='w-5 h-5' />
                                )}
                            </button>
                        )}
                    </motion.div>
                )
            })}

            <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                    <Checkbox
                        id='keepMeLoggedIn'
                        checked={keepMeLoggedIn}
                        onCheckedChange={(checked) => setValue('keepMeLoggedIn', checked)}
                        className='border-white/20 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500'
                    />
                    <label
                        htmlFor='keepMeLoggedIn'
                        className='text-sm text-slate-300 cursor-pointer select-none'
                    >
                        Keep me logged in
                    </label>
                </div>

                <button
                    type='button'
                    className='text-sm text-blue-500 hover:text-blue-400 transition-colors'
                >
                    Forgot password?
                </button>
            </div>

            <Button
                type='submit'
                className='w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all'
            >
                Sign In
            </Button>

            <p className='text-center text-slate-400 text-sm'>
                Don't have an account?{' '}
                <Link
                    href="/auth/sign-up"
                    className="text-blue-500 hover:text-blue-400 font-semibold transition-colors"
                >
                    Create one
                </Link>
            </p>

            <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t border-white/10'></div>
                </div>
                <div className='relative flex justify-center text-sm'>
                    <span className='px-4 bg-[#1A1F2E] text-slate-400'>Or continue with</span>
                </div>
            </div>

            <div className='grid grid-cols-3 gap-3'>
                <button
                    type='button'
                    className='h-12 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group'
                >
                    <svg className='w-5 h-5' viewBox='0 0 24 24'>
                        <path
                            fill='currentColor'
                            className='text-white'
                            d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                        />
                        <path
                            fill='currentColor'
                            className='text-white'
                            d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                        />
                        <path
                            fill='currentColor'
                            className='text-white'
                            d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                        />
                        <path
                            fill='currentColor'
                            className='text-white'
                            d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                        />
                    </svg>
                </button>

                <button
                    type='button'
                    className='h-12 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group'
                >
                    <svg className='w-5 h-5 text-white' fill='currentColor' viewBox='0 0 24 24'>
                        <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'/>
                    </svg>
                </button>

                <button
                    type='button'
                    className='h-12 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group'
                >
                    <svg className='w-5 h-5 text-white' fill='currentColor' viewBox='0 0 24 24'>
                        <path d='M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z'/>
                    </svg>
                </button>
            </div>
        </motion.div>
    )
}

export default LoginForm