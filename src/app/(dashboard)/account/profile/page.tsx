import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import ProfileSettings from '@/components/account/profile-settings'
import { onGetUserProfile } from '@/actions/settings'

const ProfilePage = async () => {
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
    createdAt: profile.createdAt.toISOString(),
  }

  return <ProfileSettings user={userData} />
}

export default ProfilePage