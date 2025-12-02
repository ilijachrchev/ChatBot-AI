'use client'
import { useEmailMarketing } from '@/hooks/email-marketing/use-marketing'
import React from 'react'
import { CustomerTable } from './customer-table'
import { Button } from '../ui/button'
import { Plus, Mail, Users, Calendar, Send, Eye } from 'lucide-react'
import Modal from '../modal'
import { Card, CardContent, CardDescription, CardTitle } from '../ui/card'
import { Loader } from '../loader'
import FormGenerator from '../forms/form-generator'
import { cn, getMonthName } from '@/lib/utils'
import { EditEmail } from './edit-email'
import { CampaignPreview } from './campign-preview'
import { string } from 'zod'

type Props = {
  domains: {
    customer: {
      Domain: {
        name: string
      } | null
      id: string
      email: string | null
    }[]
  }[]
  campaign: {
    name: string
    id: string
    customers: string[]
    createdAt: Date
  }[]
  subscription: {
    plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
    credits: number
  } | null
}

const EmailMarketing = ({ campaign, domains, subscription }: Props) => {
  const {
    onSelectedEmails,
    isSelected,
    onCreateCampaign,
    register,
    errors,
    loading,
    onSelectCampaign,
    processing,
    onAddCustomersToCampaign,
    campaignId,
    onBulkEmail,
    onSetAnswersId,
    isId,
    registerEmail,
    emailErrors,
    onCreateEmailTemplate,
    setValue,
    onRemoveCustomer,
  } = useEmailMarketing()

  const getCustomerEmailsForCampaign = (customerEmails: string[]) => {
    const allCustomers = domains.flatMap((domain) => domain.customer)

    return customerEmails
      .map((email) => allCustomers.find(c => c.email === email))
      .filter(
        (c): c is {
          Domain: { name: string } | null
          id: string
          email: string | null
        } => Boolean(c)
      )
  }

  return (
    <div className="w-full flex-1 h-0 grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 md:px-6 pb-8">
      <div className="overflow-y-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                Customers
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Select customers for your campaigns
              </p>
            </div>
          </div>
        </div>

        <CustomerTable
          domains={domains}
          onId={onSetAnswersId}
          onSelect={onSelectedEmails}
          select={isSelected}
          id={isId}
        />
      </div>

      <div className="overflow-y-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                  Campaigns
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  Manage your email campaigns
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800">
              <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
                {subscription?.credits} credits
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              disabled={isSelected.length === 0}
              onClick={onAddCustomersToCampaign}
              className={cn(
                'flex-1 bg-gradient-to-r from-blue-500 to-blue-600',
                'hover:from-blue-600 hover:to-blue-700',
                'text-white font-semibold shadow-lg shadow-blue-500/30',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Campaign ({isSelected.length})
            </Button>

            <Modal
              title="Create New Campaign"
              description="Add your customers and create a marketing campaign"
              trigger={
                <Button
                  variant="outline"
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
                </Button>
              }
            >
              <form className="flex flex-col gap-4" onSubmit={onCreateCampaign}>
                <FormGenerator
                  name="name"
                  register={register}
                  errors={errors}
                  inputType="input"
                  placeholder="Campaign name (e.g., Summer Sale 2024)"
                  type="text"
                />
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold"
                  disabled={loading}
                  type="submit"
                >
                  <Loader loading={loading}>Create Campaign</Loader>
                </Button>
              </form>
            </Modal>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {campaign && campaign.length > 0 ? (
            campaign.map((camp) => (
              <Card
                key={camp.id}
                className={cn(
                  'group relative overflow-hidden cursor-pointer',
                  'transition-all duration-200',
                  'hover:shadow-card-hover hover:-translate-y-1',
                  campaignId === camp.id
                    ? 'border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                )}
                onClick={() => onSelectCampaign(camp.id)}
              >
                {campaignId === camp.id && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl" />
                )}

                <CardContent className="p-5 relative z-10">
                  <Loader loading={processing}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-2">
                          {camp.name}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {getMonthName(camp.createdAt.getMonth())}{' '}
                              {camp.createdAt.getDate()}, {camp.createdAt.getFullYear()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              <Users className="h-3.5 w-3.5" />
                              <span className="font-semibold">
                                {camp.customers.length} customers
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Modal
                        title={`Campaign: ${camp.name}`}
                        description="Preview customers in this campaign"
                        trigger={
                          <div
                            className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-lg',
                              'bg-slate-100 dark:bg-slate-800',
                              'hover:bg-blue-100 dark:hover:bg-blue-900/30',
                              'text-slate-600 dark:text-slate-300',
                              'hover:text-blue-600 dark:hover:text-blue-400',
                              'transition-all duration-200',
                              'cursor-pointer'
                            )}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Eye className="h-4 w-4" />
                          </div>
                        }
                      >
                        <CampaignPreview
                          campaignName={camp.name}
                          customers={getCustomerEmailsForCampaign(camp.customers)}
                          onRemoveCustomer={(email) => onRemoveCustomer(camp.id, email)}
                        />
                      </Modal>
                    </div>

                    <div className="flex gap-2">
                      <Modal
                        title="Edit Email Template"
                        description="Customize the email that will be sent to campaign members"
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="h-3.5 w-3.5 mr-2" />
                            Edit Email
                          </Button>
                        }
                      >
                        <EditEmail
                          register={registerEmail}
                          errors={emailErrors}
                          setDefault={setValue}
                          id={camp.id}
                          onCreate={onCreateEmailTemplate}
                        />
                      </Modal>

                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg shadow-green-500/30"
                        onClick={(e) => {
                          e.stopPropagation()
                          onBulkEmail(camp.customers.map((c) => c), camp.id)
                        }}
                      >
                        <Send className="h-3.5 w-3.5 mr-2" />
                        Send
                      </Button>
                    </div>
                  </Loader>
                </CardContent>
              </Card>
            ))
          ) : (
            // Empty State
            <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <Mail className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-950 dark:text-white mb-1">
                No Campaigns Yet
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Create your first campaign to start email marketing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmailMarketing