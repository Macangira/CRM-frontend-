import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileCode, Check } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ExportButtonProps {
  filename?: string;
  data?: any[];
}

export const ExportButton: React.FC<ExportButtonProps> = ({ filename = 'export_report', data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportedFormat, setExportedFormat] = useState<string | null>(null);

  const handleExport = (format: 'CSV' | 'Excel' | 'PDF') => {
    setExportedFormat(format);
    setIsOpen(false);
    
    // Simulate Download Action
    setTimeout(() => {
      const mimeTypes = {
        CSV: 'text/csv',
        Excel: 'application/vnd.ms-excel',
        PDF: 'application/pdf'
      };
      const extension = format.toLowerCase() === 'excel' ? 'xlsx' : format.toLowerCase();
      const content = `Enterprise CRM Report - Generated Export (${format})\nDate: ${new Date().toISOString()}\nTotal Records: ${data ? data.length : 12}`;
      const blob = new Blob([content], { type: mimeTypes[format] });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}_${Date.now()}.${extension}`;
      a.click();
      URL.revokeObjectURL(url);
      setExportedFormat(null);
    }, 400);
  };

  return (
    <div className="relative inline-block">
      <Button
        variant="outline"
        size="sm"
        leftIcon={<Download className="w-4 h-4" />}
        onClick={() => setIsOpen(prev => !prev)}
      >
        {exportedFormat ? `Exporting ${exportedFormat}...` : 'Export Report'}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-30 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 animate-fadeIn">
          <button
            onClick={() => handleExport('CSV')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FileCode className="w-4 h-4 text-emerald-500" />
            <span>Export as CSV</span>
          </button>
          <button
            onClick={() => handleExport('Excel')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-500" />
            <span>Export as Excel (.xlsx)</span>
          </button>
          <button
            onClick={() => handleExport('PDF')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4 text-red-500" />
            <span>Export as PDF Document</span>
          </button>
        </div>
      )}
    </div>
  );
};
