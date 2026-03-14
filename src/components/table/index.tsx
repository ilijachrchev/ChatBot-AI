import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

type DataTableProps = {
  headers: string[]
  children: React.ReactNode
}

export const DataTable = ({ headers, children }: DataTableProps) => {
  return (
    <Table
      className={cn(
        "rounded-xl overflow-hidden border",
        "border-[var(--border-default)]/70",
        "bg-[var(--bg-page)]/40"
      )}
    >
      <TableHeader>
        <TableRow className="
          bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)]
          dark:from-[var(--primary)] dark:to-[var(--primary-light)]
        ">
          {headers.map((header, key) => (
            <TableHead
              key={key}
              className={cn(
                'px-4 py-3 text-xs font-semibold uppercase tracking-wide',
                'text-[var(--text-primary)]',
                key === headers.length - 1 && 'text-right'
              )}
            >
              {header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>{children}</TableBody>
    </Table>
  )
}
