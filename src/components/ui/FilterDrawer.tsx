import React from 'react';
import { Drawer } from './Drawer';
import { Button } from './button';
import { Select } from './select';
import { Input } from './input';
import { Filter, RotateCcw, Check, Calendar, User, Shield } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterValues {
  status?: string;
  assignedUser?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  [key: string]: string | undefined;
}

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterValues;
  onApplyFilters: (newFilters: FilterValues) => void;
  onResetFilters: () => void;
  statusOptions?: FilterOption[];
  userOptions?: FilterOption[];
  categoryOptions?: FilterOption[];
  title?: string;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
  statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Pending / Prospect', value: 'prospect' },
    { label: 'Completed / Inactive', value: 'inactive' }
  ],
  userOptions = [
    { label: 'All Team Members', value: '' },
    { label: 'Sophia Chen', value: 'Sophia Chen' },
    { label: 'Marcus Vance', value: 'Marcus Vance' },
    { label: 'Elena Rostova', value: 'Elena Rostova' }
  ],
  categoryOptions,
  title = 'Advanced Filters'
}) => {
  const [localFilters, setLocalFilters] = React.useState<FilterValues>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  const handleChange = (key: string, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const emptyFilters: FilterValues = {};
    setLocalFilters(emptyFilters);
    onResetFilters();
    onClose();
  };

  // Active count calculation
  const activeCount = Object.values(filters).filter(v => v && v.trim() !== '').length;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Refine database records with custom status, date, and user filters"
    >
      <form onSubmit={handleApply} className="space-y-5">
        {/* Status Dropdown */}
        <Select
          label="Account / Record Status"
          value={localFilters.status || ''}
          onChange={e => handleChange('status', e.target.value)}
          options={statusOptions}
        />

        {/* Assigned Owner / User Dropdown */}
        <Select
          label="Assigned Team Member"
          value={localFilters.assignedUser || ''}
          onChange={e => handleChange('assignedUser', e.target.value)}
          options={userOptions}
        />

        {/* Category Option if provided */}
        {categoryOptions && (
          <Select
            label="Category / Tag"
            value={localFilters.category || ''}
            onChange={e => handleChange('category', e.target.value)}
            options={categoryOptions}
          />
        )}

        {/* Date Range Picker Section */}
        <div className="space-y-2.5 pt-2 border-t border-zinc-800">
          <label className="block text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" /> Date Range Filter
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="From Date"
              type="date"
              value={localFilters.startDate || ''}
              onChange={e => handleChange('startDate', e.target.value)}
            />
            <Input
              label="To Date"
              type="date"
              value={localFilters.endDate || ''}
              onChange={e => handleChange('endDate', e.target.value)}
            />
          </div>
        </div>

        {/* Active Filters Summary Badge */}
        {activeCount > 0 && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs rounded-xl flex items-center justify-between">
            <span className="font-semibold">{activeCount} Filter(s) Currently Applied</span>
            <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded-full uppercase font-mono">URL Sync Active</span>
          </div>
        )}

        {/* Action Buttons: Apply & Reset */}
        <div className="pt-4 border-t border-zinc-800 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex-1 text-zinc-300 border-zinc-700 hover:bg-zinc-800"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Filters
          </Button>

          <Button
            type="submit"
            variant="primary"
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold"
            leftIcon={<Check className="w-4 h-4" />}
          >
            Apply Filters
          </Button>
        </div>
      </form>
    </Drawer>
  );
};
