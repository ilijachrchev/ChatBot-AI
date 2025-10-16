"use client"
import { Card, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { User } from 'lucide-react'
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

const UserTypeCard = ({ register, setUserType, text, title, userType, value }: Props) => {
  const isSelected = userType === value

  return (
    <Label htmlFor={value}>
      <Card
        className={cn(
          "w-full cursor-pointer p-3 transition-all",
          isSelected 
            ? "border-2 border-orange shadow-md" 
            : "border-transparent hover:border-muted"
        )}
      >
        <CardContent className="flex items-center justify-between gap-3 px-1 py-0">
          <div className="flex items-center gap-3">
            <Card
              className={cn(
                "w-10 h-10 p-0 rounded-md flex items-center justify-center shrink-0 shadow-none",
                isSelected ? "border-orange" : "border-transparent bg-muted"
              )}
            >
              <User size={18} className={cn(isSelected ? "text-orange" : "text-gray-400")} />
            </Card>

            <div>
              <CardDescription className="text-iridium">{title}</CardDescription>
              <CardDescription className="text-gray-400">{text}</CardDescription>
            </div>
          </div>

          <div>
            <div
              className={cn(
                "w-4 h-4 rounded-full border",
                isSelected ? "bg-orange border-orange" : "bg-transparent border-gray-400"
              )}
            />
            <Input
              id={value}
              type="radio"
              value={value}
              {...register("type")}
              checked={isSelected}
              onChange={(e) => setUserType(e.target.value as 'owner' | 'student')}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>
    </Label>
  )
}

export default UserTypeCard
