import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AccountLayoutClient } from '@/components/settings/account-layout-client' 
import { onGetUserProfile } from '@/actions/settings'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()
  if (!user) redirect('/auth/sign-in')

  const profile = await onGetUserProfile()
  
  if (!profile) {
    redirect('/dashboard')
  }

  const userData = {
    id: profile.id,
    fullname: profile.fullname,
    email: profile.email,
    imageUrl: profile.imageUrl,
  }

  return (
    <AccountLayoutClient user={userData}>
      {children}
    </AccountLayoutClient>
  )
}