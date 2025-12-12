'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Save, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { onUpdateUserProfile, onUpdateUserAvatar } from '@/actions/settings'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import EmailStatus from './email-status'
import ChangePasswordCard from './change-password-card'

const profileSchema = z.object({
  fullname: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name is too long'),
})

type ProfileFormData = z.infer<typeof profileSchema>

type Props = {
  user: {
    id: string
    fullname: string
    email: string
    imageUrl: string
    createdAt: string
  }
}

const ProfileSettings = ({ user }: Props) => {
  const [loading, setLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(user.imageUrl)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullname: user.fullname,
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    try {
      const result = await onUpdateUserProfile(data.fullname)
      
      if (result?.status === 200) {
        toast.success('Profile updated!', {
          description: result.message,
        })
        router.refresh()
      } else {
        toast.error('Failed to update profile', {
          description: result?.message || 'Please try again later.',
        })
      }
    } catch (error) {
      toast.error('Failed to update profile', {
        description: 'An unexpected error occurred.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please upload an image file (JPG, PNG, GIF)',
      })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Please upload an image smaller than 2MB',
      })
      return
    }

    setAvatarLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('http://localhost:4000/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      const { url } = await uploadResponse.json()

      setAvatarPreview(url)

      const result = await onUpdateUserAvatar(url)

      if (result?.status === 200) {
        toast.success('Profile picture updated!', {
          description: 'Your new avatar has been saved.',
        })
        router.refresh()
      } else {
        toast.error('Failed to update picture', {
          description: result?.message || 'Please try again.',
        })
        setAvatarPreview(user.imageUrl)
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error('Upload failed', {
        description: 'Failed to upload image. Please try again.',
      })
      setAvatarPreview(user.imageUrl)
    } finally {
      setAvatarLoading(false)
    }
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })



  return (
    <div className='space-y-6'>
      <Card className='border-slate-200 dark:border-slate-800'>
        <CardHeader>
          <CardTitle className='text-xl'>Profile Picture</CardTitle>
          <CardDescription>
            Upload a new profile picture (JPG, PNG or GIF, max 2MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col md:flex-row items-start md:items-center gap-6'>
            <div className='relative group'>
              <Avatar className='w-24 h-24 ring-4 ring-slate-100 dark:ring-slate-800'>
                <AvatarImage src={avatarPreview} alt={user.fullname} className='object-cover' />
                <AvatarFallback className='text-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold'>
                  {user.fullname.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <label
                htmlFor='avatar-upload'
                className={cn(
                  'absolute bottom-0 right-0',
                  'bg-blue-600 hover:bg-blue-700',
                  'text-white p-2.5 rounded-full',
                  'cursor-pointer transition-all',
                  'shadow-lg hover:scale-110',
                  avatarLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {avatarLoading ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <Camera className='w-4 h-4' />
                )}
                <input
                  id='avatar-upload'
                  type='file'
                  accept='image/jpeg,image/png,image/gif,image/webp'
                  className='hidden'
                  onChange={handleAvatarUpload}
                  disabled={avatarLoading}
                />
              </label>
            </div>
            
            <div className='flex-1'>
              <h3 className='font-semibold text-lg text-foreground'>{user.fullname}</h3>
              <p className='text-sm text-muted-foreground'>{user.email}</p>
              <p className='text-xs text-muted-foreground mt-1'>
                Member since {memberSince}
              </p>
              
              <div className='mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800'>
                <div className='flex items-start gap-2'>
                  <Upload className='w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0' />
                  <div>
                    <p className='text-xs text-blue-900 dark:text-blue-100 font-medium'>
                      Upload a new picture
                    </p>
                    <p className='text-xs text-blue-700 dark:text-blue-300 mt-1'>
                      Click the camera icon to select an image from your computer. 
                      Your picture will be uploaded and saved automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='border-slate-200 dark:border-slate-800'>
        <CardHeader>
          <CardTitle className='text-xl'>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='fullname' className='text-sm font-medium'>
                Full Name
              </Label>
              <Input
                id='fullname'
                {...register('fullname')}
                placeholder='Enter your full name'
                className={cn(
                  'h-11',
                  errors.fullname && 'border-red-500 focus-visible:ring-red-500'
                )}
              />
              {errors.fullname && (
                <p className='text-sm text-red-500 flex items-center gap-1'>
                  {errors.fullname.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email' className='text-sm font-medium'>
                Email Address <EmailStatus />
              </Label>
              <Input
                id='email'
                type='email'
                value={user.email}
                disabled
                className='h-11 bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed'
              />
              <p className='text-xs text-muted-foreground'>
              </p>
            </div>

            <div className='flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800'>
              <Button 
                type='submit' 
                disabled={loading || !isDirty}
                className={cn(
                  'gap-2 bg-gradient-to-r from-blue-600 to-blue-700',
                  'hover:from-blue-700 hover:to-blue-800',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'shadow-lg shadow-blue-500/30',
                  'transition-all duration-200'
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className='w-4 h-4' />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className='border-slate-200 dark:border-slate-800'>
        <CardHeader>
          <CardTitle className='text-xl'>Account Information</CardTitle>
          <CardDescription>
            Your account details and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex justify-between py-3 border-b border-slate-200 dark:border-slate-800'>
              <span className='text-sm font-medium text-muted-foreground'>User ID</span>
              <span className='text-sm font-mono text-foreground'>{user.id.slice(0, 8)}...</span>
            </div>
            <div className='flex justify-between py-3 border-b border-slate-200 dark:border-slate-800'>
              <span className='text-sm font-medium text-muted-foreground'>Account Created</span>
              <span className='text-sm text-foreground'>{memberSince}</span>
            </div>
            <div className='flex justify-between py-3'>
              <span className='text-sm font-medium text-muted-foreground'>Account Status</span>
              <span className='text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-2'>
                <span className='w-2 h-2 rounded-full bg-green-600 dark:bg-green-400 animate-pulse' />
                Active
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
        <ChangePasswordCard />
    </div>
  )
}

export default ProfileSettings