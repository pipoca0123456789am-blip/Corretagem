import React from 'react'
import { cn } from '@/lib/utils'

export interface TableColumn {
  key: string
  header: string
  sortable?: boolean
  width?: string
}

export interface TableRow {
  id: string | number
  [key: string]: any
}

export interface TableProps {
  columns: TableColumn[]
  rows: TableRow[]
  onRowClick?: (row: TableRow) => void
  className?: string
  striped?: boolean
  hoverable?: boolean
}

export const Table: React.FC<TableProps> = ({
  columns,
  rows,
  onRowClick,
  className,
  striped = true,
  hoverable = true,
}) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className={cn('w-full', className)}>
        <thead>
          <tr className="bg-muted border-b border-border">
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width }}
                className="px-4 py-3 text-left text-sm font-semibold text-foreground"
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && (
                    <svg
                      className="w-4 h-4 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                Nenhum resultado encontrado
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-border transition-colors duration-200',
                  striped && index % 2 === 0 && 'bg-muted/30',
                  hoverable && onRowClick && 'cursor-pointer hover:bg-muted/50'
                )}
              >
                {columns.map((column) => (
                  <td
                    key={`${row.id}-${column.key}`}
                    className="px-4 py-3 text-sm text-foreground"
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
