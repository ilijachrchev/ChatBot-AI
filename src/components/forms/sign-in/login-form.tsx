"use client"
import { USER_LOGIN_FORM } from '@/constants/forms'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import FormGenerator from '../form-generator'

type Props = {}

const LoginForm = (props: Props) => {

    const {
        register,
        formState: { errors },
    } = useFormContext()
    return <>
        <h2 className='text-gravel md:text-4xl font-bold'>Login</h2>
        <p className='text-iridium md:text-sm'>
            You will receive a one time password via email.
        </p>
        {USER_LOGIN_FORM.map((field) => (
            <FormGenerator
                key={field.name}
                {...field}
                register={register}
                errors={errors}
                name={field.name}
                />
        ))}
    </>


  return <div>LoginForm</div>
}

export default LoginForm