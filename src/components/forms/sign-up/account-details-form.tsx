'use client'
import React, { useState } from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import { motion } from 'framer-motion'
import FormGenerator from '../form-generator'
import { USER_REGISTRATION_FORM } from '@/constants/forms'
import { Eye, EyeOff } from 'lucide-react'

type Props = {
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
}

const AccountDetailsForm = ({ errors, register }: Props) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='space-y-6'
    >
      <div className='space-y-2'>
        <h2 className='text-3xl font-bold text-white'>Account Details</h2>
        <p className='text-slate-400'>
          Enter your email and password
        </p>
      </div>

      <div className='space-y-4'>
        {USER_REGISTRATION_FORM.map((field) => {
          const isPassword = field.type === 'password'
          const isConfirmPassword = field.name === 'confirmPassword'

          return (
            <div key={field.id} className='relative'>
              <FormGenerator
                {...field}
                errors={errors}
                register={register}
                type={
                  isPassword
                    ? isConfirmPassword
                      ? showConfirmPassword
                        ? 'text'
                        : 'password'
                      : showPassword
                      ? 'text'
                      : 'password'
                    : field.type
                }
              />
              
              {isPassword && (
                <button
                  type='button'
                  onClick={() =>
                    isConfirmPassword
                      ? setShowConfirmPassword(!showConfirmPassword)
                      : setShowPassword(!showPassword)
                  }
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors'
                >
                  {(isConfirmPassword ? showConfirmPassword : showPassword) ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default AccountDetailsForm