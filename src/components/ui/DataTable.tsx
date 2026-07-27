import React, { useState } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { SkeletonTableRow } from './Skeleton';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (item: T) => void;
  emptyState?: React.ReactNode;
  renderMobileCard?: (item: T) => React.ReactNode;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data = [],
  isLoading = false,
  searchPlaceholder = 'Search records...',
  onRowClick,
  emptyState,
  renderMobileCard
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const safeData = Array.isArray(data) ? data : [];

  // Filter
  const filteredData = safeData.filter(item => {
    if (!searchTerm) return true;
    return Object.values(item as any).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort
  const sortedData = [...filteredData].sort((a: any, b: any) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-3">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            leftIcon={<Search className="w-3.5 h-3.5 text-zinc-400" />}
          />
        </div>
        <div className="text-xs text-zinc-500 text-right">
          Showing <span className="font-medium text-zinc-900 dark:text-zinc-200">{filteredData.length}</span> results
        </div>
      </div>

      {/* Table Box */}
      <div className="crm-table overflow-hidden rounded-2xl border border-white/80 dark:border-white/10 bg-white/65 dark:bg-zinc-900/60 backdrop-blur-2xl shadow-[0_12px_32px_-20px_rgba(15,23,42,0.3)] dark:shadow-black/30">
        
        {renderMobileCard && (
          <div className="sm:hidden flex flex-col divide-y divide-zinc-200/80 dark:divide-white/[0.07]">
            {isLoading ? (
               <div className="p-4 text-center text-xs text-zinc-500">Loading records...</div>
            ) : paginatedData.length === 0 ? (
               <div className="p-8 text-center text-xs text-zinc-500">{emptyState || 'No records found matching your criteria.'}</div>
            ) : (
               paginatedData.map((item, idx) => (
                 <div 
                   key={item.id || idx} 
                   onClick={() => onRowClick && onRowClick(item)}
                   className={onRowClick ? 'cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors' : ''}
                 >
                   {renderMobileCard(item)}
                 </div>
               ))
            )}
          </div>
        )}

        <div className={`overflow-x-auto w-full ${renderMobileCard ? 'hidden sm:block' : ''}`}>
          <table className="w-full text-left text-xs border-collapse min-w-max whitespace-nowrap">
            <thead>
              <tr className="border-b border-zinc-200/80 dark:border-white/10 bg-white/45 dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 font-medium">
                {columns.map(col => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`px-4 py-3 select-none ${col.sortable ? 'cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-200' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && sortKey === col.key && (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-500" /> : <ChevronDown className="w-3 h-3 text-blue-500" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/80 dark:divide-white/[0.07] text-zinc-800 dark:text-zinc-200">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <SkeletonTableRow key={idx} columnsCount={columns.length} />
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center">
                    {emptyState || <p className="text-zinc-400">No records found in database.</p>}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => (
                  <tr
                    key={(item as any).id || (item as any)._id || idx}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`transition-colors ${
                      onRowClick ? 'cursor-pointer hover:bg-blue-50/70 dark:hover:bg-blue-400/[0.06]' : ''
                    }`}
                  >
                    {columns.map(col => {
                      const cellValue = col.render ? col.render(item) : col.accessor ? col.accessor(item) : (item as any)[col.key] ?? '—';
                      return (
                        <td key={col.key} className="px-4 py-3">
                          {cellValue}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-2.5 border-t border-zinc-200/80 dark:border-white/10 bg-white/35 dark:bg-white/[0.02] flex items-center justify-between text-xs text-zinc-500">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
