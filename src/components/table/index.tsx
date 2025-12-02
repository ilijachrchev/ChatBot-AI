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
        "border-slate-200 dark:border-slate-800/70",
        "bg-white dark:bg-slate-950/40"
      )}
    >
      <TableHeader>
        <TableRow className="
          bg-gradient-to-r from-blue-600 to-blue-700
          dark:from-blue-500 dark:to-blue-600
        ">
          {headers.map((header, key) => (
            <TableHead
              key={key}
              className={cn(
                'px-4 py-3 text-xs font-semibold uppercase tracking-wide',
                'text-slate-50',
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
