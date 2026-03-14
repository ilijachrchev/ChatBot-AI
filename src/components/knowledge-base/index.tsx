'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, FileText, Trash2, Power, PowerOff, RefreshCw, Globe, Lock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DataTable } from '../table'
import { TableCell, TableRow } from '../ui/table'
import {
  deleteKnowledgeBaseFile,
  toggleKnowledgeBaseFileStatus,
  getKnowledgeBaseFiles,
  reprocessKnowledgeBaseFile,
  scrapeWebsiteToKnowledgeBase,
} from '@/actions/knowledge-base'
import { onUpdateOnboardingStep } from '@/actions/onboarding'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type KnowledgeBaseFile = {
  id: string
  filename: string
  fileType: string
  filePath: string
  fileSize: number
  status: 'READY' | 'PROCESSING' | 'DISABLED' | 'FAILED'
  createdAt: Date
  Domain: {
    id: string
    name: string
  } | null
}

type Props = {
  initialFiles: KnowledgeBaseFile[]
  domainId?: string
  userPlan?: string
}

const KnowledgeBaseContent = ({ initialFiles, domainId, userPlan }: Props) => {
  const [files, setFiles] = useState<KnowledgeBaseFile[]>(initialFiles)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const [reprocessingId, setReprocessingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [scrapeUrl, setScrapeUrl] = useState('')
  const [scrapeMaxPages, setScrapeMaxPages] = useState(5)
  const [scraping, setScraping] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getFileTypeLabel = (fileType: string) => {
    if (fileType.includes('pdf')) return 'PDF'
    if (fileType.includes('word') || fileType.includes('docx')) return 'DOCX'
    if (fileType.includes('text') || fileType.includes('txt')) return 'TXT'
    return fileType.split('/').pop()?.toUpperCase() || 'FILE'
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    setUploading(true)

    try {
      const uploadPromises = Array.from(selectedFiles).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        if (domainId) formData.append('domainId', domainId)

        const response = await fetch('/api/knowledge-base/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        return response.json()
      })

      await Promise.all(uploadPromises)
      toast.success('Files uploaded successfully')
      onUpdateOnboardingStep('uploadedKnowledge')

      const result = await getKnowledgeBaseFiles(domainId)
      if (result.status === 200 && result.files) {
        setFiles(result.files)
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload files')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (fileId: string) => {
    setDeletingId(fileId)
    try {
      const result = await deleteKnowledgeBaseFile(fileId)
      if (result.status === 200) {
        toast.success('File deleted successfully')
        setFiles(files.filter((f) => f.id !== fileId))
      } else {
        toast.error(result.message || 'Failed to delete file')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete file')
    } finally {
      setDeletingId(null)
      setDeleteDialogOpen(false)
      setFileToDelete(null)
    }
  }

  const handleToggleStatus = async (fileId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'READY' ? 'DISABLED' : 'READY'
      const result = await toggleKnowledgeBaseFileStatus(fileId, newStatus)
      if (result.status === 200) {
        toast.success(
          `File ${newStatus === 'READY' ? 'enabled' : 'disabled'} successfully`
        )
        setFiles(
          files.map((f) =>
            f.id === fileId ? { ...f, status: newStatus } : f
          )
        )
      } else {
        toast.error(result.message || 'Failed to update file status')
      }
    } catch (error) {
      console.error('Toggle status error:', error)
      toast.error('Failed to update file status')
    }
  }

  const handleReprocess = async (fileId: string) => {
    setReprocessingId(fileId)
    try {
      const result = await reprocessKnowledgeBaseFile(fileId)
      if (result.status === 200) {
        toast.success('Reprocessing started')
        setFiles(
          files.map((f) =>
            f.id === fileId ? { ...f, status: 'PROCESSING' } : f
          )
        )
        setTimeout(async () => {
          const refreshResult = await getKnowledgeBaseFiles(domainId)
          if (refreshResult.status === 200 && refreshResult.files) {
            setFiles(refreshResult.files)
          }
        }, 2000)
      } else {
        toast.error(result.message || 'Failed to start reprocessing')
      }
    } catch (error) {
      console.error('Reprocess error:', error)
      toast.error('Failed to start reprocessing')
    } finally {
      setReprocessingId(null)
    }
  }

  const handleScrape = async () => {
    if (!scrapeUrl.trim()) {
      toast.error('Please enter a website URL')
      return
    }
    setScraping(true)
    try {
      console.log('Scraping URL:', scrapeUrl)
      const result = await scrapeWebsiteToKnowledgeBase(scrapeUrl.trim(), scrapeMaxPages, domainId)
      if (result.status === 200) {
        toast.success('Website scraping started — file will appear once ready')
        setScrapeUrl('')
        setScrapeMaxPages(5)
        const refreshResult = await getKnowledgeBaseFiles(domainId)
        if (refreshResult.status === 200 && refreshResult.files) {
          setFiles(refreshResult.files)
        }
      } else {
        toast.error(result.message || 'Failed to scrape website')
      }
    } catch (error) {
      console.error('Scrape error:', error)
      toast.error('Failed to scrape website')
    } finally {
      setScraping(false)
    }
  }

  const openDeleteDialog = (fileId: string) => {
    setFileToDelete(fileId)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="overflow-y-auto w-full flex-1 px-4 md:px-6 pb-8">
      <div className="mb-6 lg:mb-8 pt-4">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Knowledge Base
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Train your chatbot with your own content
            </p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="shrink-0"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload files'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)]/50 p-5">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-card)] mb-3">
              <Zap className="h-4 w-4 text-[var(--text-secondary)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">
              How it works
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Your chatbot reads and indexes the content you provide. When a
              customer asks a question, the AI searches your knowledge base and
              uses the most relevant content to generate accurate, grounded
              answers.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)]/50 p-5">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-card)] mb-3">
              <FileText className="h-4 w-4 text-[var(--text-secondary)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">
              File Uploads
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Upload PDF, TXT, or DOCX files containing your product docs, FAQs,
              policies, or any reference material. Files are processed and
              chunked into searchable knowledge.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)]/50 p-5">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-card)] mb-3">
              <Globe className="h-4 w-4 text-[var(--text-secondary)]" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Website Scraping
              </h3>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-[var(--warning)] dark:bg-[var(--warning)] text-[var(--warning)] dark:text-[var(--warning)] border border-[var(--warning)] dark:border-[var(--warning)]">
                Ultimate Plan
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Enter your website URL and the scraper will crawl your pages,
              extract all text content, and automatically ingest it into your
              knowledge base — no manual copy-paste needed.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border-default)] mb-6" />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />

      {userPlan === 'ULTIMATE' ? (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            Scrape Website
          </h2>
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)]/50 p-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                <Input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  disabled={scraping}
                  className="pl-9"
                />
              </div>
              <Input
                type="number"
                min={1}
                max={20}
                value={scrapeMaxPages}
                onChange={(e) =>
                  setScrapeMaxPages(Math.min(20, Math.max(1, Number(e.target.value))))
                }
                disabled={scraping}
                className="w-full sm:w-28"
                title="Max pages"
                aria-label="Max pages"
              />
              <Button onClick={handleScrape} disabled={scraping} className="shrink-0">
                {scraping ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    Scrape Website
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] mt-2">
              Enter a URL and the number of pages to crawl (max&nbsp;20). The scraped content
              will be saved and ingested into your knowledge base.
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            Scrape Website
          </h2>
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)]/50 p-8 flex flex-col items-center text-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-card)]">
              <Lock className="h-6 w-6 text-[var(--text-muted)]" />
            </div>
            <p className="font-semibold text-[var(--text-primary)]">
              Ultimate plan required
            </p>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm">
              Web scraping is available on the Ultimate plan. Upgrade to automatically
              pull content from any website into your knowledge base.
            </p>
            <Link
              href="/settings/billing"
              className={cn(
                'mt-1 inline-flex items-center justify-center rounded-md border border-[var(--border-default)] dark:border-[var(--border-strong)]',
                'bg-transparent px-4 py-2 text-sm font-medium text-[var(--text-primary)]',
                'hover:bg-[var(--bg-hover)] transition-colors'
              )}
            >
              Upgrade to Ultimate
            </Link>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div
          className={cn(
            'rounded-xl border-2 border-dashed',
            'border-[var(--border-default)]',
            'bg-[var(--bg-surface)]/50 dark:bg-[var(--bg-page)]/30',
            'p-8 md:p-12',
            'transition-all duration-200',
            'hover:border-[var(--primary)] dark:hover:border-[var(--primary)]',
            'hover:bg-[var(--bg-surface)]/50 dark:hover:bg-[var(--bg-hover)]/50',
            uploading && 'opacity-50 pointer-events-none'
          )}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div
              className={cn(
                'inline-flex h-16 w-16 items-center justify-center rounded-full',
                'bg-[var(--primary)] dark:bg-[var(--primary)]',
                'mb-4'
              )}
            >
              <FileText className="h-8 w-8 text-[var(--text-accent)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              {uploading ? 'Uploading files...' : 'Drop files here or click to upload'}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-md">
              Supported formats: PDF, DOCX, TXT. Maximum file size: 10MB per file.
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4" />
              Select Files
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Uploaded Files
        </h2>

        {files.length === 0 ? (
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)]/50 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-card)] mb-4">
                <FileText className="h-8 w-8 text-[var(--text-muted)]" />
              </div>
              <p className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                No files uploaded
              </p>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Upload your first document to get started
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Upload Files
              </Button>
            </div>
          </div>
        ) : (
          <DataTable
            headers={['File Name', 'Type', 'Size', 'Upload Date', 'Status', 'Actions']}
          >
            {files.map((file) => (
              <TableRow
                key={file.id}
                className={cn(
                  'transition-all duration-200',
                  'hover:bg-[var(--bg-hover)]',
                  file.status === 'DISABLED' && 'opacity-60'
                )}
              >
                <TableCell className="font-medium text-[var(--text-primary)]">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[var(--text-muted)] flex-shrink-0" />
                    <span className="truncate max-w-[300px]">{file.filename}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[var(--bg-card)] text-[var(--text-secondary)] text-sm font-medium">
                    {getFileTypeLabel(file.fileType)}
                  </span>
                </TableCell>

                <TableCell className="text-[var(--text-secondary)]">
                  {formatFileSize(file.fileSize)}
                </TableCell>

                <TableCell className="text-[var(--text-secondary)]">
                  {formatDate(file.createdAt)}
                </TableCell>

                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium',
                      file.status === 'READY' &&
                        'bg-[var(--success)] dark:bg-[var(--success)] text-[var(--success)] dark:text-[var(--success)]',
                      file.status === 'PROCESSING' &&
                        'bg-[var(--primary)] dark:bg-[var(--primary)] text-[var(--primary)] dark:text-[var(--primary)]',
                      file.status === 'DISABLED' &&
                        'bg-[var(--bg-card)] text-[var(--text-secondary)]',
                      file.status === 'FAILED' &&
                        'bg-[var(--danger)] dark:bg-[var(--danger)] text-[var(--danger)] dark:text-[var(--danger)]'
                    )}
                  >
                    {file.status}
                  </span>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {file.status === 'FAILED' && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleReprocess(file.id)}
                        className="h-8 w-8"
                        disabled={reprocessingId === file.id}
                        title="Reprocess"
                      >
                        {reprocessingId === file.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
                        ) : (
                          <RefreshCw className="h-4 w-4 text-[var(--text-accent)]" />
                        )}
                      </Button>
                    )}
                    {file.status !== 'PROCESSING' && file.status !== 'FAILED' && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleToggleStatus(file.id, file.status)}
                        className="h-8 w-8"
                        title={file.status === 'READY' ? 'Disable' : 'Enable'}
                      >
                        {file.status === 'READY' ? (
                          <PowerOff className="h-4 w-4 text-[var(--text-secondary)]" />
                        ) : (
                          <Power className="h-4 w-4 text-[var(--text-secondary)]" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openDeleteDialog(file.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={deletingId === file.id}
                      title="Delete"
                    >
                      {deletingId === file.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => fileToDelete && handleDelete(fileToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default KnowledgeBaseContent
