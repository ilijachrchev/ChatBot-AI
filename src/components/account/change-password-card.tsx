'use client'

import React from 'react'
import { useChangePassword } from '@/hooks/settings/use-settings'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Loader } from '@/components/loader'

const ChangePasswordCard = () => {
  const { register, errors, onChangePassword, loading } = useChangePassword()

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 text-white">
          <Lock className="h-5 w-5" />
        </div>
        <div>
          <CardTitle className="text-lg">Change Password</CardTitle>
          <CardDescription>
            Reset your password to keep your account secure
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={onChangePassword}
          className="max-w-md flex flex-col gap-5"
        >
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Password</Label>
            <Input
              type="password"
              autoComplete="current-password"
              className="h-11"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-red-500">
                {String(errors.password.message)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">New Password</Label>
            <Input
              type="password"
              autoComplete="new-password"
              className="h-11"
              {...register('password')}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Confirm New Password
            </Label>
            <Input
              type="password"
              autoComplete="new-password"
              className="h-11"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {String(errors.confirmPassword.message)}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={loading}
              className={cn(
                'gap-2 bg-gradient-to-r from-blue-600 to-blue-700',
                'hover:from-blue-700 hover:to-blue-800',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'shadow-lg shadow-blue-500/30',
                'transition-all duration-200'
              )}
            >
              <Loader loading={loading}>Update Password</Loader>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default ChangePasswordCard
