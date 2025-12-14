import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { PreferencesSection } from '@/components/settings/preferences/preferences-section'
import { onGetUserPreferences } from '@/actions/preferences'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const PreferencesPage = async () => {
  const user = await currentUser()
  if (!user) redirect('/auth/sign-in')

  const preferences = await onGetUserPreferences()

  if (!preferences) {
    redirect('/dashboard')
  }

  return <PreferencesSection preferences={preferences} />
}

export default PreferencesPage