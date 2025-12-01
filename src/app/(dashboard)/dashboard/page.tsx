import { getUserAppointments } from '@/actions/appointment'
import { getUserBalance, getUserClients, getUserPlanInfo, getUserTotalProductPrices, getUserTransaction } from '@/actions/dashboard'
import DashboardCard from '@/components/dashboard/cards'
import { PlanUsage } from '@/components/dashboard/plan-usage'
import InfoBar from '@/components/infobar'
import { Separator } from '@/components/ui/separator'
import CalIcon from '@/icons/cal-icon'
import PersonIcon from '@/icons/person-icon'
import { TransactionsIcon } from '@/icons/transactions-icon'
import { DollarSign, TrendingUp, ArrowRight, Activity, Receipt } from 'lucide-react'
import React from 'react'

type Props = {}

const Page = async (props: Props) => {
  const clients = await getUserClients()
  const sales = await getUserBalance()
  const bookings = await getUserAppointments()
  const plan = await getUserPlanInfo()
  const transactions = await getUserTransaction()
  const products = await getUserTotalProductPrices()

  return (
    <>
      <InfoBar />
      
      <div className='overflow-y-auto w-full chat-window flex-1 h-0 px-4 md:px-6 pb-8'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8'>
          <DashboardCard
            value={clients || 0}
            title="Potential Clients"
            icon={<PersonIcon />}
          />
          <DashboardCard
            value={products! * clients! || 0}
            sales
            title="Pipeline Value"
            icon={<TrendingUp />}
          />
          <DashboardCard
            value={bookings || 0}
            title="Appointments"
            icon={<CalIcon />}
          />
          <DashboardCard
            value={sales || 0}
            sales
            title="Total Sales"
            icon={<DollarSign />}
          />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6'>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 md:p-6 shadow-card">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 className='font-bold text-lg md:text-xl text-slate-900 dark:text-white'>
                  Plan Usage
                </h2>
                <p className='text-xs md:text-sm text-slate-600 dark:text-slate-400'>
                  Track your current usage and limits
                </p>
              </div>
            </div>
            
            <PlanUsage
              plan={plan?.plan! || 'STANDARD'}
              credits={
                plan?.plan === 'STANDARD' 
                  ? 10 - (plan?.credits || 0)
                  : plan?.plan === 'PRO'
                  ? 50 - (plan?.credits || 0)
                  : 500 - (plan?.credits || 0)
              }
              domains={plan?.domains || 0}
              clients={clients || 0}
            />
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 md:p-6 shadow-card">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h2 className='font-bold text-lg md:text-xl text-slate-900 dark:text-white'>
                    Recent Transactions
                  </h2>
                  <p className='text-xs md:text-sm text-slate-600 dark:text-slate-400'>
                    Latest payment activity
                  </p>
                </div>
              </div>
              
              {transactions && transactions.data.length > 0 && (
                <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors group">
                  See all
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {transactions && transactions.data.length > 0 ? (
                transactions.data.slice(0, 5).map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between p-3 md:p-4 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <p className='font-semibold text-sm md:text-base text-slate-900 dark:text-white truncate'>
                          {transaction.calculated_statement_descriptor}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          ID: {transaction.id.slice(0, 16)}...
                        </p>
                      </div>
                    </div>
                    
                    <p className='font-bold text-base md:text-xl text-slate-900 dark:text-white flex-shrink-0 ml-2'>
                      ${(transaction.amount / 100).toFixed(2)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 md:py-12">
                  <div className="inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <Receipt className="h-7 w-7 md:h-8 md:w-8 text-slate-400" />
                  </div>
                  <p className="text-sm md:text-base font-medium text-slate-900 dark:text-white mb-1">
                    No transactions yet
                  </p>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
                    Your payment history will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page