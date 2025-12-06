import { onGetAllAccountDomains } from '@/actions/settings'
import ConversationMenu from '@/components/conversation'
import Messenger from '@/components/conversation/messenger'
import InfoBar from '@/components/infobar'
import React from 'react'

type Props = {}

const ConversationPage = async (props: Props) => {
  const domains = await onGetAllAccountDomains()

  return (
    <div className="flex h-full w-full overflow-hidden">
      <aside
        className="flex-shrink-0 w-[360px] border-r bg-background flex flex-col overflow-y-auto"
      >
        <ConversationMenu domains={domains?.domains} />
      </aside>

      <div className="flex-1 flex flex-col">
        <div className="px-5 border-b">
          <InfoBar />
        </div>
        <Messenger />
      </div>
    </div>
  )
}

export default ConversationPage
