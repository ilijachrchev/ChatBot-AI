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
            "rounded-xl border border-[var(--border-default)]",
            "bg-[var(--bg-page)]/50 p-5 md:p-6 shadow-md h-full flex flex-col"
        )}>
            <div className="flex items-center justify-between mb-5 md:mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--danger)] text-white shadow-lg">
                        <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className='font-bold text-lg md:text-xl text-[var(--text-primary)]'>
                            Recent Transactions
                        </h2>
                        <p className='text-xs md:text-sm text-[var(--text-secondary)]'>
                            Latest payment activity
                        </p>
                    </div>
                </div>

                {hasTransactions && (
                    <button className="flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary)] dark:text-[var(--text-accent)] dark:hover:text-[var(--primary)] transition-colors group p-1">
                        View All
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
            </div>

            <div className="space-y-2 flex-grow">
                {hasTransactions ? (
                    <div className="divide-y divide-[var(--border-default)] dark:divide-[var(--border-default)]">
                        {transactions.slice(0, 5).map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-[var(--bg-hover)] -mx-2 px-2 rounded-lg transition-colors group"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="h-9 w-9 rounded-full bg-[rgba(61,184,130,0.15)] flex items-center justify-center flex-shrink-0">
                                        <DollarSign className="h-4 w-4 text-[var(--success)] dark:text-[var(--success)]" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className='font-semibold text-sm text-[var(--text-primary)] truncate'>
                                            {transaction.calculated_statement_descriptor || 'Payment'}
                                        </p>
                                        <p className="text-xs text-[var(--text-muted)]">
                                            {formatDate(transaction.created)}
                                        </p>
                                    </div>
                                </div>

                                <p className='font-bold text-base text-[var(--text-primary)] flex-shrink-0 ml-2 tabular-nums'>
                                    ${(transaction.amount / 100).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-card)] mb-4">
                            <Receipt className="h-8 w-8 text-[var(--text-muted)]" />
                        </div>
                        <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                            No transactions yet
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] max-w-xs">
                            Your payment history will appear here once sales are processed.
                        </p>
                    </div>
                )}
            </div>

            {hasTransactions && transactions.length > 5 && (
                <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
                    <p className="text-xs text-center text-[var(--text-muted)]">
                        Showing 5 of {transactions.length} transactions
                    </p>
                </div>
            )}
        </div>
    )
}