import React from 'react';
import { Badge } from '../ui/Badge';
import { TaskStatus, Priority, DealStage, LeadStatus, UserStatus } from '../../types';

export const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const map: Record<TaskStatus, { label: string; variant: 'default' | 'primary' | 'warning' | 'success' }> = {
    'Pending': { label: 'Pending', variant: 'default' },
    'To Do': { label: 'To Do', variant: 'default' },
    'In Progress': { label: 'In Progress', variant: 'primary' },
    'In Review': { label: 'In Review', variant: 'warning' },
    'Testing': { label: 'Testing', variant: 'warning' },
    'Changes Requested': { label: 'Changes Requested', variant: 'warning' },
    'Blocked': { label: 'Blocked', variant: 'default' },
    'On Hold': { label: 'On Hold', variant: 'default' },
    'Done': { label: 'Done', variant: 'success' },
    'Cancelled': { label: 'Cancelled', variant: 'default' }
  };
  const conf = map[status] || { label: status, variant: 'default' };
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const map: Record<Priority, { label: string; variant: 'neutral' | 'info' | 'warning' | 'danger' }> = {
    low: { label: 'Low', variant: 'neutral' },
    medium: { label: 'Medium', variant: 'info' },
    high: { label: 'High', variant: 'warning' },
    urgent: { label: 'Urgent 🔥', variant: 'danger' }
  };
  const conf = map[priority] || { label: priority, variant: 'neutral' };
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
};

export const DealStageBadge: React.FC<{ stage: DealStage }> = ({ stage }) => {
  const map: Record<DealStage, { label: string; variant: 'default' | 'info' | 'primary' | 'warning' | 'success' | 'danger' }> = {
    qualification: { label: 'Qualification', variant: 'info' },
    proposal:      { label: 'Proposal Sent', variant: 'primary' },
    negotiation:   { label: 'Negotiation', variant: 'warning' },
    won:           { label: 'Won 🏆', variant: 'success' },
    lost:          { label: 'Lost', variant: 'danger' }
  };
  const conf = map[stage] || { label: stage, variant: 'default' };
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
};

export const LeadStatusBadge: React.FC<{ status: LeadStatus }> = ({ status }) => {
  const map: Record<LeadStatus, { label: string; variant: 'default' | 'info' | 'primary' | 'warning' | 'success' | 'danger' }> = {
    new: { label: 'New', variant: 'info' },
    contacted: { label: 'Contacted', variant: 'primary' },
    qualified: { label: 'Qualified', variant: 'warning' },
    lost: { label: 'Lost', variant: 'danger' },
    converted: { label: 'Converted', variant: 'success' }
  };
  const conf = map[status] || { label: status, variant: 'default' as const };
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
};

export const UserStatusBadge: React.FC<{ status: UserStatus; isDeleted?: boolean }> = ({ status, isDeleted }) => {
  if (isDeleted) return <Badge variant="danger">Soft Deleted</Badge>;
  const map: Record<UserStatus, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
    active: { label: 'Active', variant: 'success' },
    inactive: { label: 'Inactive', variant: 'warning' },
    suspended: { label: 'Suspended', variant: 'danger' }
  };
  const conf = map[status] || { label: status, variant: 'warning' };
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
};
