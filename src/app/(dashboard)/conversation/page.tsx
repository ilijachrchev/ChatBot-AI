import { onGetAllAccountDomains } from '@/actions/settings'
import ConversationMenu from '@/components/conversation'
import Messenger from '@/components/conversation/messenger'
import InfoBar from '@/components/infobar'
import { ConversationShell } from '@/components/conversation/conversation-shell'
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ConversationPage = async () => {
  const domains = await onGetAllAccountDomains()

  return (
    <ConversationShell
      list={<ConversationMenu domains={domains?.domains} />}
      chat={
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-4 md:px-5 border-b flex-shrink-0">
            <InfoBar />
          </div>
          <Messenger />
        </div>
      }
    />
  )
}

export default ConversationPage
