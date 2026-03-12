'use client'
import { useEmailMarketing } from '@/hooks/email-marketing/use-marketing'
import React, { useState } from 'react'
import { CustomerTable } from './customer-table'
import { Button } from '../ui/button'
import {
  Plus,
  Mail,
  Users,
  Calendar,
  Send,
  Eye,
  Clock,
  RefreshCw,
  CheckCircle,
  Trash2,
  CreditCard,
  Sparkles,
} from 'lucide-react'
import Modal from '../modal'
import { Card, CardContent } from '../ui/card'
import { Loader } from '../loader'
import { cn } from '@/lib/utils'
import { EditEmail } from './edit-email'
import { CampaignPreview } from './campign-preview'
import { ScheduleEmail } from './schedule-email'
import { FieldValues, UseFormRegister } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import { Switch } from '../ui/switch'
import { motion } from 'framer-motion'
import { RecurringCampaignModal } from './recurring-campaign-modal'
import { Textarea } from '../ui/textarea'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

type Campaign = {
  name: string
  id: string
  customers: string[]
  createdAt: Date
  status?: string
  scheduledAt?: Date | null
  sentAt?: Date | null
  recurringType?: string | null
  recurringDay?: number | null
  recurringTime?: string | null
  recurringActive?: boolean
  lastSentAt?: Date | null
  nextSendAt?: Date | null
}

type Props = {
  domains: {
    customer: {
      Domain: { name: string } | null
      id: string
      email: string | null
    }[]
  }[]
  campaign: Campaign[]
  subscription: {
    plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
    credits: number
  } | null
  userTimezone: string
}

const getTimeAgo = (date: Date) => {
  const now = new Date()
  const secondsAgo = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)
  if (secondsAgo < 60) return `${secondsAgo}s ago`
  const minutesAgo = Math.floor(secondsAgo / 60)
  if (minutesAgo < 60) return `${minutesAgo}m ago`
  const hoursAgo = Math.floor(minutesAgo / 60)
  if (hoursAgo < 24) return `${hoursAgo}h ago`
  const daysAgo = Math.floor(hoursAgo / 24)
  if (daysAgo < 7) return `${daysAgo}d ago`
  const weeksAgo = Math.floor(daysAgo / 7)
  if (weeksAgo < 4) return `${weeksAgo}w ago`
  return `${Math.floor(daysAgo / 30)}mo ago`
}

const formatDateShort = (date: Date) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }) + ' UTC'

const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'SCHEDULED':
      return { text: 'Scheduled', className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' }
    case 'SENT':
      return { text: 'Sent', className: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' }
    case 'SENDING':
      return { text: 'Sending', className: 'bg-slate-900 dark:bg-[var(--bg-hover)] text-[var(--text-primary)]', pulse: true }
    case 'FAILED':
      return { text: 'Failed', className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' }
    case 'CANCELLED':
      return { text: 'Cancelled', className: 'bg-slate-100 dark:bg-[var(--bg-surface)] text-[var(--text-muted)]' }
    default:
      return { text: 'Draft', className: 'bg-slate-100 dark:bg-[var(--bg-surface)] text-[var(--text-secondary)]' }
  }
}

const EmailMarketing = ({ campaign, domains, subscription, userTimezone }: Props) => {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [recurringModalOpen, setRecurringModalOpen] = useState(false)
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1)
  const [createName, setCreateName] = useState('')
  const [createTemplate, setCreateTemplate] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  const {
    onSelectedEmails,
    onSelectAll,
    isSelected,
    onCreateCampaign,
    register,
    errors,
    loading,
    onSelectCampaign,
    processing,
    onAddCustomersToCampaign,
    campaignId,
    onSetAnswersId,
    isId,
    registerEmail,
    emailErrors,
    onCreateEmailTemplate,
    setValue,
    onRemoveCustomer,
    onSchedule,
    onDeleteCampaign,
    onCreateRecurring,
    onToggleRecurring,
    onCreateAndSend,
  } = useEmailMarketing()

  const allCustomers = domains.flatMap((d) => d.customer)
  const allEmails = allCustomers.map((c) => c.email).filter(Boolean) as string[]
  const totalCustomers = allCustomers.length
  const totalCampaigns = (campaign || []).length
  const emailsSent = (campaign || [])
    .filter((c) => c.status === 'SENT')
    .reduce((acc, c) => acc + c.customers.length, 0)
  const creditsRemaining = subscription?.credits ?? 0

  const getCustomerEmailsForCampaign = (customerEmails: string[]) =>
    customerEmails
      .map((email) => allCustomers.find((c) => c.email === email))
      .filter(
        (c): c is { Domain: { name: string } | null; id: string; email: string | null } =>
          Boolean(c)
      )

  const handleSchedule = async (
    campId: string,
    scheduledData: { date: string; time: string } | null,
    timezone: string
  ) => {
    await onSchedule(campId, scheduledData, timezone)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingId) return
    await onDeleteCampaign(deletingId)
    setDeleteConfirmOpen(false)
    setDeletingId(null)
  }

  const handleAiEnhance = async () => {
    if (!createTemplate.trim()) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: createTemplate }),
      })
      const data = await res.json()
      if (data.text) setCreateTemplate(data.text)
    } catch {}
    setAiLoading(false)
  }

  const handleCreateAndSend = async () => {
    if (isSelected.length === 0 || !createName.trim() || !createTemplate.trim()) return
    setCreating(true)
    const success = await onCreateAndSend(createName, isSelected, createTemplate)
    setCreating(false)
    if (success) {
      setCreateModalOpen(false)
      setCreateStep(1)
      setCreateName('')
      setCreateTemplate('')
    }
  }

  const closeCreateModal = (open: boolean) => {
    if (!open) {
      setCreateModalOpen(false)
      setCreateStep(1)
      setCreateName('')
      setCreateTemplate('')
    }
  }

  const STATS = [
    { label: 'Total Customers', value: totalCustomers, icon: Users },
    { label: 'Total Campaigns', value: totalCampaigns, icon: Mail },
    { label: 'Emails Sent', value: emailsSent, icon: Send },
    { label: 'Credits Remaining', value: creditsRemaining, icon: CreditCard },
  ]

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 md:px-6 pb-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-slate-100 flex-shrink-0">
            <Mail className="h-6 w-6 text-[var(--text-primary)]" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Email Marketing
            </h1>
            <p className="text-sm text-slate-500 dark:text-[var(--text-secondary)]">
              Send targeted campaigns to your customers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-[var(--bg-page)] border border-[var(--border-default)]">
          <Mail className="h-4 w-4 text-[var(--text-secondary)]" />
          <span className="text-sm font-semibold text-[var(--text-secondary)]">
            {creditsRemaining} credits remaining
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--bg-page)] border border-[var(--border-default)] rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className="h-4 w-4 text-[var(--text-muted)]" />
              <span className="text-xs text-slate-500 dark:text-[var(--text-secondary)]">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Customers</h2>
              {isSelected.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-xs font-bold">
                  {isSelected.length} selected
                </span>
              )}
            </div>
            <button
              onClick={() => onSelectAll(allEmails)}
              className="text-sm text-[var(--text-muted)] hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {isSelected.length === allEmails.length && allEmails.length > 0
                ? 'Deselect All'
                : 'Select All'}
            </button>
          </div>

          <CustomerTable
            domains={domains}
            onId={onSetAnswersId}
            onSelect={onSelectedEmails}
            select={isSelected}
            id={isId}
          />

          <Button
            disabled={isSelected.length === 0 || !campaignId}
            onClick={onAddCustomersToCampaign}
            className={cn(
              'w-full font-bold h-11 transition-all',
              isSelected.length > 0 && campaignId
                ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                : 'opacity-40 cursor-not-allowed bg-indigo-500 text-white'
            )}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isSelected.length > 0
              ? `Add ${isSelected.length} to Campaign`
              : 'Add to Campaign'}
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Campaigns</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRecurringModalOpen(true)}
                className="border-[var(--border-default)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                New Recurring
              </Button>
              <Button
                size="sm"
                onClick={() => setCreateModalOpen(true)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Campaign
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {campaign && campaign.length > 0 ? (
              campaign.map((camp, index) => {
                const badge = getStatusBadge(camp.status)
                return (
                  <motion.div
                    key={camp.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                  >
                    <Card
                      className={cn(
                        'cursor-pointer transition-all duration-200 hover:shadow-md',
                        campaignId === camp.id
                          ? 'border-slate-900 dark:border-white'
                          : 'border-[var(--border-default)] hover:border-slate-400 dark:hover:border-slate-600'
                      )}
                      onClick={() => onSelectCampaign(camp.id)}
                    >
                      <CardContent className="p-4">
                        <Loader loading={processing && campaignId === camp.id}>
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-[var(--text-primary)] text-base leading-tight pr-2">
                              {camp.name}
                            </h3>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {badge.pulse && (
                                <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                              )}
                              <span
                                className={cn(
                                  'px-2.5 py-1 rounded-full text-xs font-semibold',
                                  badge.className
                                )}
                              >
                                {badge.text}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 mb-3">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[var(--text-secondary)]">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>
                                {new Date(camp.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[var(--text-secondary)]">
                              <Users className="h-3.5 w-3.5" />
                              <span>{camp.customers.length} customers</span>
                            </div>
                            {camp.recurringType && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[var(--text-secondary)]">
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span>
                                  {camp.recurringType.charAt(0) +
                                    camp.recurringType.slice(1).toLowerCase()}
                                </span>
                              </div>
                            )}
                            {camp.nextSendAt && camp.recurringType && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[var(--text-secondary)]">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Next: {formatDateShort(camp.nextSendAt)}</span>
                              </div>
                            )}
                            {camp.lastSentAt && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[var(--text-secondary)]">
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span>Last sent {getTimeAgo(camp.lastSentAt)}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Modal
                              title="Edit Email Template"
                              description="Customize the email that will be sent to campaign members"
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-xs border border-[var(--border-default)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Mail className="h-3.5 w-3.5 mr-1.5" />
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

                            <Modal
                              title={`Campaign: ${camp.name}`}
                              description="Preview customers in this campaign"
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-xs border border-[var(--border-default)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                                  Preview
                                </Button>
                              }
                            >
                              <CampaignPreview
                                campaignName={camp.name}
                                customers={getCustomerEmailsForCampaign(camp.customers)}
                                onRemoveCustomer={(email) => onRemoveCustomer(camp.id, email)}
                              />
                            </Modal>

                            <div className="ml-auto flex items-center gap-2">
                              {camp.recurringType && (
                                <div
                                  className="flex items-center gap-1.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="text-xs text-slate-500 dark:text-[var(--text-secondary)]">
                                    {camp.recurringActive ? 'Active' : 'Paused'}
                                  </span>
                                  <Switch
                                    checked={camp.recurringActive ?? false}
                                    onCheckedChange={(checked) =>
                                      onToggleRecurring(camp.id, checked)
                                    }
                                  />
                                </div>
                              )}

                              <Modal
                                title={
                                  camp.status === 'SENT' ? 'Resend Campaign' : 'Schedule Campaign'
                                }
                                description={
                                  camp.status === 'SENT'
                                    ? 'Send this campaign again to the same recipients'
                                    : 'Choose when to send this campaign'
                                }
                                trigger={
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs border-[var(--border-default)] hover:bg-[var(--bg-hover)]"
                                    onClick={(e) => e.stopPropagation()}
                                    disabled={camp.status === 'SENDING'}
                                  >
                                    <Send className="h-3.5 w-3.5 mr-1.5" />
                                    {camp.status === 'SENT'
                                      ? 'Resend'
                                      : camp.status === 'SCHEDULED'
                                      ? 'Reschedule'
                                      : camp.status === 'SENDING'
                                      ? 'Sending...'
                                      : 'Send'}
                                  </Button>
                                }
                              >
                                <ScheduleEmail
                                  campaignId={camp.id}
                                  onSchedule={handleSchedule}
                                  onClose={() => {}}
                                  userTimezone={userTimezone}
                                />
                              </Modal>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeletingId(camp.id)
                                  setDeleteConfirmOpen(true)
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </Loader>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })
            ) : (
              <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-[var(--border-default)]">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-[var(--bg-surface)] mb-4">
                  <Mail className="h-8 w-8 text-[var(--text-muted)]" />
                </div>
                <p className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                  No Campaigns Yet
                </p>
                <p className="text-sm text-slate-500 dark:text-[var(--text-secondary)]">
                  Create your first campaign to start email marketing
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-[var(--bg-page)] border border-[var(--border-default)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[var(--text-primary)]">
              Delete Campaign
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-[var(--text-secondary)]">
              This will permanently delete this campaign and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[var(--border-default)] hover:bg-[var(--bg-hover)]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={createModalOpen} onOpenChange={closeCreateModal}>
        <DialogContent className="max-w-lg bg-[var(--bg-page)] border border-[var(--border-default)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[var(--text-primary)]">
              Create Campaign
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-[var(--text-secondary)]">
              Set up a one-time email blast
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-1.5 my-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  'flex-1 h-1 rounded-full transition-all duration-300',
                  createStep >= s
                    ? 'bg-slate-900 dark:bg-white'
                    : 'bg-slate-200 dark:bg-[var(--bg-surface)]'
                )}
              />
            ))}
          </div>

          {createStep === 1 && (
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[var(--text-secondary)]">
                  Campaign name
                </Label>
                <Input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g., Summer Sale 2024"
                  className="border-[var(--border-default)] bg-[var(--bg-page)] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-900 dark:focus-visible:border-white"
                />
              </div>
              <Button
                onClick={() => setCreateStep(2)}
                disabled={!createName.trim()}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold"
              >
                Next
              </Button>
            </div>
          )}

          {createStep === 2 && (
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-[var(--text-secondary)]">
                    Email message
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAiEnhance}
                    disabled={aiLoading || !createTemplate.trim()}
                    className="h-7 text-xs border-[var(--border-default)] dark:border-[var(--border-strong)] hover:bg-[var(--bg-hover)]"
                  >
                    <Sparkles className="h-3 w-3 mr-1.5" />
                    {aiLoading ? 'Writing...' : 'Write with AI'}
                  </Button>
                </div>
                <Textarea
                  value={createTemplate}
                  onChange={(e) => setCreateTemplate(e.target.value)}
                  placeholder="Write your email message..."
                  className="min-h-[160px] resize-none border-[var(--border-default)] bg-[var(--bg-page)] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-900 dark:focus-visible:border-white"
                />
                <div className="text-right text-xs text-[var(--text-muted)]">
                  {createTemplate.length} characters
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCreateStep(1)}
                  className="flex-1 border-[var(--border-default)] hover:bg-[var(--bg-hover)]"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setCreateStep(3)}
                  disabled={!createTemplate.trim()}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {createStep === 3 && (
            <div className="space-y-4 mt-2">
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[var(--bg-page)] border border-[var(--border-default)]">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Campaign name</p>
                  <p className="font-medium text-[var(--text-primary)]">{createName}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[var(--bg-page)] border border-[var(--border-default)]">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Recipients</p>
                  <p className="font-medium text-[var(--text-primary)]">
                    {isSelected.length} customer{isSelected.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[var(--bg-page)] border border-[var(--border-default)]">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Message preview</p>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-3">
                    {createTemplate}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCreateStep(2)}
                  className="flex-1 border-[var(--border-default)] hover:bg-[var(--bg-hover)]"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreateAndSend}
                  disabled={creating || isSelected.length === 0}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold"
                >
                  <Loader loading={creating}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Now
                  </Loader>
                </Button>
              </div>
              {isSelected.length === 0 && (
                <p className="text-xs text-center text-[var(--text-muted)]">
                  Select customers on the left before sending
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RecurringCampaignModal
        open={recurringModalOpen}
        onClose={() => setRecurringModalOpen(false)}
        selectedCount={isSelected.length}
        onSubmit={async (name, template, recurringType, recurringTime, recurringDay) => {
          await onCreateRecurring(name, template, recurringType, recurringTime, recurringDay)
          setRecurringModalOpen(false)
        }}
        loading={loading}
      />
    </div>
  )
}

export default EmailMarketing
