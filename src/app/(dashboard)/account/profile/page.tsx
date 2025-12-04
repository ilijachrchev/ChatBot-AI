import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
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

  return (
    <div className='container mx-auto py-6 px-4 max-w-4xl'>
      <Link 
        href='/dashboard'
        className='inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group'
      >
        <ArrowLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform' />
        Back to Dashboard
      </Link>

      <div className='mb-8'>
        <h1 className='text-3xl md:text-4xl font-bold text-foreground mb-2'>
          Profile Settings
        </h1>
        <p className='text-muted-foreground'>
          Manage your personal information and profile picture
        </p>
      </div>

      <ProfileSettings user={userData} />
    </div>
  )
}

export default ProfilePage