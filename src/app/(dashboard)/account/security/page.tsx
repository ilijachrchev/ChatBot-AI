import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SecuritySection } from '@/components/settings/security/security-section' 

const SecurityPage = async () => {
  const user = await currentUser()
  if (!user) redirect('/auth/sign-in')

  return <SecuritySection />
}

export default SecurityPage