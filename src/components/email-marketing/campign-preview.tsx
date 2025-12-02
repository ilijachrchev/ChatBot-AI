import React from 'react'
import { Mail, Globe, Users, X } from 'lucide-react'
import { ScrollArea } from '../ui/scroll-area'

type Customer = {
  Domain: {
    name: string
  } | null
  id: string
  email: string | null
}

type CampaignPreviewProps = {
  campaignName: string
  customers: Array<Customer | undefined>
  onRemoveCustomer?: (email: string) => void
}

export const CampaignPreview = ({
  campaignName,
  customers,
  onRemoveCustomer,
}: CampaignPreviewProps) => {
  const validCustomers = customers.filter(
    (c): c is Customer => Boolean(c)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <div>
          <p className="font-semibold text-blue-900 dark:text-blue-100">
            {validCustomers.length}{' '}
            {validCustomers.length === 1 ? 'Customer' : 'Customers'}
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            in this campaign
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">
          Campaign Recipients
        </p>
        <ScrollArea className="h-[400px] rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="p-4 space-y-2">
            {validCustomers.length > 0 ? (
              validCustomers.map((customer, index) => (
                <div
                  key={customer.id || index}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold flex-shrink-0">
                      {customer.email?.[0]?.toUpperCase() || '?'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <p className="text-sm font-medium text-slate-950 dark:text-white truncate">
                          {customer.email || 'No email'}
                        </p>
                      </div>

                      {customer.Domain?.name && (
                        <div className="flex items-center gap-2 mt-1">
                          <Globe className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                            {customer.Domain.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {onRemoveCustomer && customer.email && (
                      <button
                        type="button"
                        onClick={() => onRemoveCustomer(customer.email!)}
                        className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}

                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {index + 1}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No customers in this campaign yet
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
