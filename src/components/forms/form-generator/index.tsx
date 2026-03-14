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
              className='text-sm font-medium text-[var(--text-secondary)]'
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
            className='h-12 rounded-xl border border-[var(--border-default)] bg-white text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                       focus:border-[var(--primary)] focus:bg-[var(--bg-surface)] transition-all
                       dark:bg-white/5 dark:text-[var(--text-primary)] dark:border-white/10 dark:placeholder:text-[var(--text-secondary)] dark:focus:bg-white/10'
          />
          <ErrorMessage
            errors={errors}
            name={name}
            render={({ message }) => (
              <p className='text-[var(--danger)] text-sm mt-1'>{message}</p>
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
              className='text-sm font-medium text-[var(--text-secondary)]'
            >
              {label}
            </Label>
          )}
          <select
            id={`select-${label}`}
            form={form}
            defaultValue={defaultValue}
            {...register(name)}
            className='h-12 rounded-xl px-4 border border-[var(--border-default)] bg-white text-[var(--text-primary)]
                       focus:border-[var(--primary)] focus:bg-[var(--bg-surface)] transition-all
                       dark:bg-white/5 dark:text-[var(--text-primary)] dark:border-white/10 dark:focus:bg-white/10'
          >
            {options?.map((option) => (
              <option
                key={option.id}
                value={option.value}
                className='bg-white text-[var(--text-primary)] dark:bg-[var(--bg-surface)] dark:text-[var(--text-primary)]'
              >
                {option.label}
              </option>
            ))}
          </select>
          <ErrorMessage
            errors={errors}
            name={name}
            render={({ message }) => (
              <p className='text-[var(--danger)] text-sm mt-1'>{message}</p>
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
              className='text-sm font-medium text-[var(--text-secondary)]'
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
            className='rounded-xl px-4 py-3 resize-none border border-[var(--border-default)] bg-white text-[var(--text-primary)]
                       placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-[var(--bg-surface)] transition-all
                       dark:bg-white/5 dark:text-[var(--text-primary)] dark:border-white/10 dark:placeholder:text-[var(--text-secondary)] dark:focus:bg-white/10'
          />
          <ErrorMessage
            errors={errors}
            name={name}
            render={({ message }) => (
              <p className='text-[var(--danger)] text-sm mt-1'>{message}</p>
            )}
          />
        </div>
      )
    default:
      return null
  }
}

export default FormGenerator
