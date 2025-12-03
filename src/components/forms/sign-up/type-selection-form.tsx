'use client'
import React from 'react'
import { FieldValues, UseFormRegister } from 'react-hook-form'
import UserTypeCard from './user-type-card'
import { motion } from 'framer-motion'

type Props = {
    register: UseFormRegister<FieldValues>
    userType: 'owner' | 'student'
    setUserType: React.Dispatch<React.SetStateAction<'owner' | 'student'>>
}

const TypeSelectionForm = ({ register, setUserType, userType }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='space-y-6'
    >
      <div className='space-y-2'>
        <h2 className='text-3xl font-bold text-white'>Create an Account</h2>
        <p className='text-slate-400'>
          Tell us about yourself! What do you do? Let's tailor your
          experience so it best suits you.
        </p>
      </div>
      
      <div className='space-y-3'>
        <UserTypeCard
          register={register}
          setUserType={setUserType}
          userType={userType}
          value='owner'
          title='I own a business'
          text='Setting up my account for my company.'
        />
        <UserTypeCard
          register={register}
          setUserType={setUserType}
          userType={userType}
          value='student'
          title='I am a student'
          text='Looking to learn about the tool.'
        />
      </div>
    </motion.div>
  )
}

export default TypeSelectionForm