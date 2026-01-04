'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, FileText, Trash2, Power, PowerOff, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DataTable } from '../table'
import { TableCell, TableRow } from '../ui/table'
import {
  deleteKnowledgeBaseFile,
  toggleKnowledgeBaseFileStatus,
  getKnowledgeBaseFiles,
  reprocessKnowledgeBaseFile,
} from '@/actions/knowledge-base'
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
}

const KnowledgeBaseContent = ({ initialFiles }: Props) => {
  const [files, setFiles] = useState<KnowledgeBaseFile[]>(initialFiles)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const [reprocessingId, setReprocessingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

      // Refresh files list
      const result = await getKnowledgeBaseFiles()
      if (result.status === 200 && result.files) {
        setFiles(result.files)
      }

      // Reset file input
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
        // Update status to PROCESSING
        setFiles(
          files.map((f) =>
            f.id === fileId ? { ...f, status: 'PROCESSING' } : f
          )
        )
        // Refresh files after a delay to check status
        setTimeout(async () => {
          const refreshResult = await getKnowledgeBaseFiles()
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

  const openDeleteDialog = (fileId: string) => {
    setFileToDelete(fileId)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="overflow-y-auto w-full flex-1 px-4 md:px-6 pb-8">
      <div className="mb-6 lg:mb-8 pt-4">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Knowledge Base
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Upload documents to help your chatbot learn business-specific
              information. Files are stored securely and will be used for AI
              training.
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
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="mb-6">
        <div
          className={cn(
            'rounded-xl border-2 border-dashed',
            'border-slate-200 dark:border-slate-800',
            'bg-slate-50/50 dark:bg-slate-900/30',
            'p-8 md:p-12',
            'transition-all duration-200',
            'hover:border-blue-300 dark:hover:border-blue-700',
            'hover:bg-slate-100/50 dark:hover:bg-slate-900/50',
            uploading && 'opacity-50 pointer-events-none'
          )}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div
              className={cn(
                'inline-flex h-16 w-16 items-center justify-center rounded-full',
                'bg-blue-100 dark:bg-blue-900/30',
                'mb-4'
              )}
            >
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {uploading ? 'Uploading files...' : 'Drop files here or click to upload'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-md">
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
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Uploaded Files
        </h2>

        {files.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                No files uploaded
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
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
                  'hover:bg-slate-50 dark:hover:bg-slate-800/50',
                  file.status === 'DISABLED' && 'opacity-60'
                )}
              >
                <TableCell className="font-medium text-slate-950 dark:text-white">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate max-w-[300px]">{file.filename}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium">
                    {getFileTypeLabel(file.fileType)}
                  </span>
                </TableCell>

                <TableCell className="text-slate-600 dark:text-slate-400">
                  {formatFileSize(file.fileSize)}
                </TableCell>

                <TableCell className="text-slate-600 dark:text-slate-400">
                  {formatDate(file.createdAt)}
                </TableCell>

                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium',
                      file.status === 'READY' &&
                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
                      file.status === 'PROCESSING' &&
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                      file.status === 'DISABLED' &&
                        'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
                      file.status === 'FAILED' &&
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
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
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                        ) : (
                          <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
                          <PowerOff className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        ) : (
                          <Power className="h-4 w-4 text-slate-600 dark:text-slate-400" />
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

