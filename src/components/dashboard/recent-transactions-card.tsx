import React from 'react'
import { ArrowRight, DollarSign, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Transaction {
    id: string;
    amount: number;
    calculated_statement_descriptor: string | null;
}

type RecentTransactionsCardProps = {
    transactions: Transaction[] | undefined;
}

export const RecentTransactionsCard = ({ transactions }: RecentTransactionsCardProps) => {

    const hasTransactions = transactions && transactions.length > 0;

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
                        See all
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
            </div>

            <div className="space-y-2 flex-grow">
                {hasTransactions ? (
                    transactions.slice(0, 5).map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                    <DollarSign className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className='font-semibold text-sm text-slate-900 dark:text-white truncate'>
                                        {transaction.calculated_statement_descriptor || 'Transaction'}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        ID: {transaction.id.slice(0, 16)}...
                                    </p>
                                </div>
                            </div>

                            <p className='font-bold text-base text-slate-900 dark:text-white flex-shrink-0 ml-2 tabular-nums'>
                                ${(transaction.amount / 100).toFixed(2)}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 flex flex-col items-center justify-center h-full">
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <Receipt className="h-7 w-7 text-slate-400" />
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
        </div>
    )
}