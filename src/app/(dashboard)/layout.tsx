import { onLoginUser } from '@/actions/auth'
import SideBar from '@/components/sidebar'
import { ChatProvider } from '@/context/user-chat-context'
import React from 'react'

type Props = {
  children: React.ReactNode
}

const OwnerLayout = async ({ children }: Props) => {
  const authenticated = await onLoginUser()
  if (authenticated?.status !== 200) return null

  return (
    <ChatProvider>
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