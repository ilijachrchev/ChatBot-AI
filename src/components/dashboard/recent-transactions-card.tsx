import React from 'react'
import { ArrowRight, DollarSign, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Transaction {
    id: string
    amount: number
    calculated_statement_descriptor: string | null
    created?: number
}

type RecentTransactionsCardProps = {
    transactions: Transaction[] | undefined
}

export const RecentTransactionsCard = ({ transactions }: RecentTransactionsCardProps) => {
    const hasTransactions = transactions && transactions.length > 0

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return 'Recent'
        const date = new Date(timestamp * 1000)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    return (
        <div className={cn(
            "rounded-xl border border-slate-200 dark:border-slate-800",
            "bg-white dark:bg-slate-900/50 p-5 md:p-6 shadow-md h-full flex flex-col"
        )}>
            <div className="flex items-center justify-between mb-5 md:mb-6">
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

                {hasTransactions && (
                    <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors group p-1">
                        View All
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
            </div>

            <div className="space-y-2 flex-grow">
                {hasTransactions ? (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {transactions.slice(0, 5).map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 px-2 rounded-lg transition-colors group"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/20 dark:to-emerald-600/20 flex items-center justify-center flex-shrink-0">
                                        <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className='font-semibold text-sm text-slate-900 dark:text-white truncate'>
                                            {transaction.calculated_statement_descriptor || 'Payment'}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {formatDate(transaction.created)}
                                        </p>
                                    </div>
                                </div>

                                <p className='font-bold text-base text-slate-900 dark:text-white flex-shrink-0 ml-2 tabular-nums'>
                                    ${(transaction.amount / 100).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <Receipt className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                            No transactions yet
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs">
                            Your payment history will appear here once sales are processed.
                        </p>
                    </div>
                )}
            </div>

            {hasTransactions && transactions.length > 5 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                        Showing 5 of {transactions.length} transactions
                    </p>
                </div>
            )}
        </div>
    )
}