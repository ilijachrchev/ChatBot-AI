import TabsMenu from '@/components/tabs/intex'
import { HELP_DESK_TABS_MENU } from '@/constants/menu'
import { TabsContent } from '@radix-ui/react-tabs'
import React from 'react'
import HelpDesk from './help-desk'
import FilterQuestions from './filter-questions'
import { Brain } from 'lucide-react'

type Props = {
  id: string
}

const BotTrainingForm = ({ id }: Props) => {
  return (
    <div className='px-4 md:px-6 py-6 mb-10'>
      <div className='rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white'>
            <Brain className='h-5 w-5' />
          </div>
          <div>
            <h2 className='text-lg font-bold text-slate-950 dark:text-white'>
              Bot Training
            </h2>
            <p className='text-sm text-slate-600 dark:text-slate-300'>
              Set FAQ questions, create questions for capturing lead information and train your bot to act the way you want it to.
            </p>
          </div>
        </div>

        <TabsMenu triggers={HELP_DESK_TABS_MENU}>
          <TabsContent value='help desk' className='w-full'>
            <HelpDesk id={id} />
          </TabsContent>
          <TabsContent value='questions'>
            <FilterQuestions id={id} />
          </TabsContent>
        </TabsMenu>
      </div>
    </div>
  )
}

export default BotTrainingForm