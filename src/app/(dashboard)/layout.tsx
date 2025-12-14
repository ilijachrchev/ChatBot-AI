import { onLoginUser } from '@/actions/auth'
import SideBar from '@/components/sidebar'
import { ChatProvider } from '@/context/user-chat-context'
import { OAuthTypeUpdater } from '@/components/auth/oauth-tpy-updater' 
import React from 'react'
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  children: React.ReactNode
}

const OwnerLayout = async ({ children }: Props) => {
  const authenticated = await onLoginUser()
  if (authenticated?.status !== 200) return null

  return (
    <ChatProvider>
      <OAuthTypeUpdater />
      <div className="flex h-screen w-full overflow-hidden">
        <SideBar domains={authenticated.domains} />
        <div className="w-full h-screen flex flex-col pl-20 md:pl-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </ChatProvider>
  )
}

export default OwnerLayout