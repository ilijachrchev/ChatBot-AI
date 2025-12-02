'use client'
import React from 'react'
import { Button } from '../ui/button'
import { Loader } from '../loader'
import { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { useEditEmail } from '@/hooks/email-marketing/use-marketing'
import FormGenerator from '../forms/form-generator'
import { Save } from 'lucide-react'

type EmailTemplateFormData = {
  description: string
}

type EditEmailProps = {
  id: string
  onCreate(): void
  register: UseFormRegister<EmailTemplateFormData>
  errors: FieldErrors<EmailTemplateFormData>
  setDefault: UseFormSetValue<EmailTemplateFormData>
}

export const EditEmail = ({
  id,
  onCreate,
  errors,
  register,
  setDefault,
}: EditEmailProps) => {
  const { loading, template } = useEditEmail(id)
  
  React.useEffect(() => {
    if (template) {
      setDefault('description', JSON.parse(template))
    }
  }, [template, setDefault])

  return (
    <form onSubmit={onCreate} className="flex flex-col gap-4">
      <Loader loading={loading}>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">
            Email Message
          </label>
          <FormGenerator
            name="description"
            register={register}
            errors={errors}
            inputType="textarea"
            lines={10}
            placeholder="Write your email message here..."
            type="text"
          />
        </div>

        <Button 
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Template
        </Button>
      </Loader>
    </form>
  )
}