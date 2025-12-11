'use client'
import React from 'react'
import { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Label } from '@/components/ui/label' 
import { Input } from '@/components/ui/input'
import { ErrorMessage } from '@hookform/error-message'

type Props = {
  type?: 'text' | 'email' | 'password'
  inputType: 'select' | 'input' | 'textarea'
  options?: { value: string; label: string; id: string }[]
  label?: string
  placeholder: string
  register: UseFormRegister<any>
  name: string
  errors: FieldErrors<any>
  lines?: number
  form?: string
  defaultValue?: string
}

const FormGenerator = ({
  inputType,
  options,
  label,
  placeholder,
  register,
  name,
  errors,
  type,
  lines,
  form,
  defaultValue,
}: Props) => {
  switch (inputType) {
    case 'input':
      return (
        <div className='flex flex-col gap-2'>
          {label && (
            <Label
              htmlFor={`input-${label}`}
              className='text-sm font-medium text-slate-700 dark:text-slate-300'
            >
              {label}
            </Label>
          )}
          <Input
            id={`input-${label}`}
            type={type}
            placeholder={placeholder}
            form={form}
            defaultValue={defaultValue}
            {...register(name)}
            className='h-12 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400
                       focus:border-blue-500 focus:bg-slate-50 transition-all
                       dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-slate-500 dark:focus:bg-white/10'
          />
          <ErrorMessage
            errors={errors}
            name={name}
            render={({ message }) => (
              <p className='text-red-400 text-sm mt-1'>{message}</p>
            )}
          />
        </div>
      )
    case 'select':
      return (
        <div className='flex flex-col gap-2'>
          {label && (
            <Label
              htmlFor={`select-${label}`}
              className='text-sm font-medium text-slate-700 dark:text-slate-300'
            >
              {label}
            </Label>
          )}
          <select
            id={`select-${label}`}
            form={form}
            defaultValue={defaultValue}
            {...register(name)}
            className='h-12 rounded-xl px-4 border border-slate-200 bg-white text-slate-900
                       focus:border-blue-500 focus:bg-slate-50 transition-all
                       dark:bg-white/5 dark:text-white dark:border-white/10 dark:focus:bg-white/10'
          >
            {options?.map((option) => (
              <option
                key={option.id}
                value={option.value}
                className='bg-white text-slate-900 dark:bg-[#1A1F2E] dark:text-white'
              >
                {option.label}
              </option>
            ))}
          </select>
          <ErrorMessage
            errors={errors}
            name={name}
            render={({ message }) => (
              <p className='text-red-400 text-sm mt-1'>{message}</p>
            )}
          />
        </div>
      )
    case 'textarea':
      return (
        <div className='flex flex-col gap-2'>
          {label && (
            <Label
              htmlFor={`textarea-${label}`}
              className='text-sm font-medium text-slate-700 dark:text-slate-300'
            >
              {label}
            </Label>
          )}
          <textarea
            id={`textarea-${label}`}
            placeholder={placeholder}
            rows={lines || 3}
            form={form}
            defaultValue={defaultValue}
            {...register(name)}
            className='rounded-xl px-4 py-3 resize-none border border-slate-200 bg-white text-slate-900
                       placeholder:text-slate-400 focus:border-blue-500 focus:bg-slate-50 transition-all
                       dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-slate-500 dark:focus:bg-white/10'
          />
          <ErrorMessage
            errors={errors}
            name={name}
            render={({ message }) => (
              <p className='text-red-400 text-sm mt-1'>{message}</p>
            )}
          />
        </div>
      )
    default:
      return null
  }
}

export default FormGenerator
