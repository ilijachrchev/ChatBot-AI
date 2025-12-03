'use client'
import React from 'react'
import { User } from 'lucide-react'
import FormGenerator from '../forms/form-generator'
import { Button } from '../ui/button'
import { useForm } from 'react-hook-form'
import { Loader } from '../loader'

type Props = {}

const AccountSettings = (props: Props) => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = React.useState(false)

  const onSubmit = async (data: any) => {
    setLoading(true)
    // TODO: Add your save account settings logic here
    console.log('Account settings:', data)
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Account Settings
          </h3>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              First Name
            </label>
            <FormGenerator
              register={register}
              errors={errors}
              name="firstName"
              placeholder="John"
              type="text"
              inputType="input"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Last Name
            </label>
            <FormGenerator
              register={register}
              errors={errors}
              name="lastName"
              placeholder="Doe"
              type="text"
              inputType="input"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
            Email Address
          </label>
          <FormGenerator
            register={register}
            errors={errors}
            name="email"
            placeholder="john@example.com"
            type="email"
            inputType="input"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
            Company Name
          </label>
          <FormGenerator
            register={register}
            errors={errors}
            name="company"
            placeholder="Acme Corp"
            type="text"
            inputType="input"
          />
        </div>

        <Button 
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40"
        >
          <Loader loading={loading}>Save Changes</Loader>
        </Button>
      </form>
    </div>
  )
}

export default AccountSettings