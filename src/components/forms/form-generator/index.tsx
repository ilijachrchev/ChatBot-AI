'use client'
import React from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import { Label } from '@/components/ui/label' 
import { Input } from '@/components/ui/input'
import { ErrorMessage } from '@hookform/error-message'

type Props = {
  type?: 'text' | 'email' | 'password'
  inputType: 'select' | 'input' | 'textarea'
  options?: { value: string; label: string; id: string }[]
  label?: string
  placeholder: string
  register: UseFormRegister<FieldValues>
  name: string
  errors: FieldErrors<FieldValues>
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
              className='text-sm font-medium text-slate-300'
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
            className='h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-white/10 transition-all rounded-xl'
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
              className='text-sm font-medium text-slate-300'
            >
              {label}
            </Label>
          )}
          <select
            id={`select-${label}`}
            form={form}
            defaultValue={defaultValue}
            {...register(name)}
            className='h-12 bg-white/5 border border-white/10 text-white rounded-xl px-4 focus:border-blue-500 focus:bg-white/10 transition-all'
          >
            {options?.map((option) => (
              <option
                key={option.id}
                value={option.value}
                className='bg-[#1A1F2E] text-white'
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
              className='text-sm font-medium text-slate-300'
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
            className='bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-white/10 transition-all rounded-xl px-4 py-3 resize-none'
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