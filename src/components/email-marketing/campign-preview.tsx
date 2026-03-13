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
      <div className="flex items-center gap-2 p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)]">
        <Users className="h-5 w-5 text-[var(--text-secondary)]" />
        <div>
          <p className="font-semibold text-[var(--text-primary)]">
            {validCustomers.length}{' '}
            {validCustomers.length === 1 ? 'Customer' : 'Customers'}
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            in this campaign
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-[var(--text-primary)] mb-3">
          Campaign Recipients
        </p>
        <ScrollArea className="h-[400px] rounded-lg border border-[var(--border-default)]">
          <div className="p-4 space-y-2">
            {validCustomers.length > 0 ? (
              validCustomers.map((customer, index) => (
                <div
                  key={customer.id || index}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 dark:from-indigo-900 dark:to-indigo-700 text-white text-sm font-semibold flex-shrink-0">
                      {customer.email?.[0]?.toUpperCase() || '?'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-[var(--text-muted)] flex-shrink-0" />
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {customer.email || 'No email'}
                        </p>
                      </div>

                      {customer.Domain?.name && (
                        <div className="flex items-center gap-2 mt-1">
                          <Globe className="h-3.5 w-3.5 text-[var(--text-muted)] flex-shrink-0" />
                          <p className="text-xs text-[var(--text-secondary)] truncate">
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

                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[var(--border)] text-xs font-semibold text-[var(--text-secondary)]">
                      {index + 1}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-3" />
                <p className="text-sm text-[var(--text-secondary)]">
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
