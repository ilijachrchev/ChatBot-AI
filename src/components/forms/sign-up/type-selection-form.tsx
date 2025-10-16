import React from 'react'
import { FieldValues, UseFormRegister } from 'react-hook-form'
import UserTypeCard from './user-type-card'

type Props = {
    register: UseFormRegister<FieldValues>
    userType: 'owner' | 'student'
    setUserType: React.Dispatch<React.SetStateAction<'owner' | 'student'>>
}

const TypeSelectionForm = ({ register, setUserType, userType }: Props) => {
  return (
    <>
        <h2 className='text-gravel md:Text-4xl font-bold'>Create an Account</h2>
        <p className='text-iridium md:text-sm'>
            Tell us about yourslef! What do you do? Let's tailor your
            <br /> experience so it best suits you.
        </p>
        <UserTypeCard
        register={register}
        setUserType={setUserType}
        userType={userType}
        value='owner'
        title='I own a buisness'
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
    </>
  )
}

export default TypeSelectionForm