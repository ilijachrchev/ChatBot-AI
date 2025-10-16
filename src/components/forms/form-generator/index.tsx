import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'
import { FieldErrors, FieldValues, UseFormRegister, useFormContext } from 'react-hook-form'
import { ErrorMessage } from '@hookform/error-message'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  type: 'text' | 'email' | 'password'
  inputType: 'select' | 'input' | 'textarea'
  options?: { value: string; label: string; id: string }[]
  label?: string
  placeholder: string
  register: UseFormRegister<any>
  name: string
  errors: FieldErrors<FieldValues>
  lines?: number
  form?: string
}

const FormGenerator = ({
  errors,
  inputType,
  name,
  placeholder,
  register,
  type,
  form,
  label,
  lines,
  options,
}: Props) => {

  const { formState: { touchedFields, isSubmitted } } = useFormContext()

  switch (inputType) {
    case 'input':
    default:
      return (
        <Label className="flex flex-col gap-2" htmlFor={`input-${label}`}>
          {label && label}
          <Input
            id={`input-${label}`}
            type={type}
            placeholder={placeholder}
            form={form}
            {...register(name)}
          />

          {/* ✅ Added: show error only after touch or submit */}
          {((touchedFields as any)[name] || isSubmitted) && (
            <ErrorMessage
              errors={errors}
              name={name}
              render={({ message }) => (
                <p className="text-red-400 mt-2">
                  {message === 'Required' ? '' : message}
                </p>
              )}
            />
          )}
        </Label>
      )

    case 'select':
      return (
        <Label htmlFor={`select-${label}`}>
          {label && label}
          <select form={form} id={`select-${label}`} {...register(name)}>
            {options?.length
              ? options.map((option) => (
                  <option value={option.value} key={option.id}>
                    {option.label}
                  </option>
                ))
              : null}
          </select>

          {/* ✅ Added: show error only after touch or submit */}
          {((touchedFields as any)[name] || isSubmitted) && (
            <ErrorMessage
              errors={errors}
              name={name}
              render={({ message }) => (
                <p className="text-red-400 mt-2">
                  {message === 'Required' ? '' : message}
                </p>
              )}
            />
          )}
        </Label>
      )

    case 'textarea':
      return (
        <Label className="flex flex-col gap-2" htmlFor={`input-${label}`}>
          {label && label}
          <Textarea
            form={form}
            id={`input-${label}`}
            placeholder={placeholder}
            {...register(name)}
            rows={lines}
          />

          {/* ✅ Added: show error only after touch or submit */}
          {((touchedFields as any)[name] || isSubmitted) && (
            <ErrorMessage
              errors={errors}
              name={name}
              render={({ message }) => (
                <p className="text-red-400 mt-2">
                  {message === 'Required' ? '' : message}
                </p>
              )}
            />
          )}
        </Label>
      )
  }
}

export default FormGenerator
