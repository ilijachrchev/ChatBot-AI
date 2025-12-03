'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { User, GraduationCap } from 'lucide-react'
import React from 'react'
import { FieldValues, UseFormRegister } from 'react-hook-form'

type Props = {
  value: string
  title: string
  text: string
  register: UseFormRegister<FieldValues>
  userType: 'owner' | 'student'
  setUserType: React.Dispatch<React.SetStateAction<'owner' | 'student'>>
}

const UserTypeCard = ({
  register,
  setUserType,
  userType,
  value,
  title,
  text,
}: Props) => {
  const isSelected = userType === value

  return (
    <Label htmlFor={value} className='cursor-pointer'>
      <Card
        className={cn(
          'transition-all duration-300 border-2 hover:scale-[1.02]',
          isSelected
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-white/10 bg-white/5 hover:border-white/20'
        )}
      >
        <CardContent className='flex items-center gap-4 p-4'>
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center transition-all',
              isSelected
                ? 'bg-gradient-to-br from-blue-500 to-purple-500'
                : 'bg-white/10'
            )}
          >
            {value === 'owner' ? (
              <User className={cn('w-6 h-6', isSelected ? 'text-white' : 'text-slate-400')} />
            ) : (
              <GraduationCap className={cn('w-6 h-6', isSelected ? 'text-white' : 'text-slate-400')} />
            )}
          </div>
          
          <div className='flex-1'>
            <h3 className={cn('font-semibold', isSelected ? 'text-white' : 'text-slate-300')}>
              {title}
            </h3>
            <p className='text-sm text-slate-400'>{text}</p>
          </div>

          <div
            className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
              isSelected ? 'border-blue-500 bg-blue-500' : 'border-white/20'
            )}
          >
            {isSelected && (
              <div className='w-2 h-2 rounded-full bg-white' />
            )}
          </div>
        </CardContent>
      </Card>
      
      <Input
        {...register('type', {
          onChange: (e) => setUserType(e.target.value),
        })}
        value={value}
        id={value}
        className='hidden'
        type='radio'
        name='type'
      />
    </Label>
  )
}

export default UserTypeCard