'use client'

import { useEffect, useState } from 'react'
import { onGetPaymentHistory } from '@/actions/billing'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Payment {
  id: string
  amount: number
  status: string
  plan: string | null
  description: string | null
  paymentMethod: string | null
  paymentBrand: string | null
  date: Date
}

export function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPaymentHistory()
  }, [])

  const loadPaymentHistory = async () => {
    setLoading(true)
    const result = await onGetPaymentHistory()
    if (result.success) {
      setPayments(result.payments)
    }
    setLoading(false)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatAmount = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`
  }

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
      case 'paid':
        return {
          label: 'Paid',
          className: 'bg-[#FDFFFC] text-[#4D7298] border border-[#4D7298]',
        }
      case 'failed':
        return {
          label: 'Failed',
          className: 'bg-[#FDFFFC] text-[#000022] border border-[#000022]',
        }
      case 'refunded':
        return {
          label: 'Refunded',
          className: 'bg-[#FDFFFC] text-[#0D0709] border border-[#0D0709]',
        }
      default:
        return {
          label: 'Pending',
          className: 'bg-[#FDFFFC] text-[#000022] border border-[#0D0709]',
        }
    }
  }

  if (loading) {
    return (
      <Card className="border-[#0D0709]">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#4D7298]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (payments.length === 0) {
    return (
      <Card className="border-[#0D0709]">
        <CardHeader>
          <CardTitle className="text-[#001242]">Payment History</CardTitle>
          <CardDescription className="text-[#000022]">
            View your past transactions and download receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-12 h-12 text-[#0D0709] mb-3" />
            <p className="text-[#000022] text-sm">No payment history available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-[#0D0709]">
      <CardHeader>
        <CardTitle className="text-[#001242]">Payment History</CardTitle>
        <CardDescription className="text-[#000022]">
          View your past transactions and download receipts
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#0D0709]">
                <th className="px-6 py-4 text-left text-xs font-medium text-[#000022] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#000022] uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#000022] uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-[#000022] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-[#000022] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-[#000022] uppercase tracking-wider">
                  Receipt
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#FDFFFC]">
              {payments.map((payment, index) => {
                const statusConfig = getStatusConfig(payment.status)
                return (
                  <tr
                    key={payment.id}
                    className={cn(
                      'border-b border-[#0D0709] transition-colors hover:bg-[#FDFFFC]/50',
                      index === payments.length - 1 && 'border-b-0'
                    )}
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#001242]">
                        {formatDate(payment.date)}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-[#001242] font-medium">
                        {payment.description || `${payment.plan} Plan`}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {payment.paymentBrand && payment.paymentMethod ? (
                        <div className="text-sm text-[#000022] capitalize">
                          {payment.paymentBrand} •••• {payment.paymentMethod}
                        </div>
                      ) : (
                        <div className="text-sm text-[#0D0709]">—</div>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-[#001242]">
                        {formatAmount(payment.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <span
                        className={cn(
                          'inline-flex items-center px-3 py-1 rounded-sm text-xs font-medium',
                          statusConfig.className
                        )}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#4D7298] hover:text-[#001242] hover:bg-transparent"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}