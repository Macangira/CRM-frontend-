import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  Modifier
} from '@dnd-kit/core';
import { Deal, DealStage } from '../../types';
import { Plus, User, Building2, Edit, Trash2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

// Custom Modifier: Snaps dragged card preview center directly to mouse cursor position
const snapCenterToCursor: Modifier = ({ transform, draggingNodeRect, transform: { x, y } }) => {
  if (!draggingNodeRect) {
    return transform;
  }
  return {
    ...transform,
    x: x - draggingNodeRect.width / 2,
    y: y - draggingNodeRect.height / 2,
  };
};

export interface KanbanBoardProps {
  deals: Deal[];
  onStageChange: (dealId: string, newStage: DealStage) => void;
  onAddDeal?: (stage: DealStage) => void;
  onDealClick?: (deal: Deal) => void;
  onEditDeal?: (deal: Deal, e: React.MouseEvent) => void;
  onDeleteDeal?: (deal: Deal, e: React.MouseEvent) => void;
}

const STAGES: { id: DealStage; label: string; color: string; border: string }[] = [
  { id: 'qualification', label: 'Qualification', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', border: 'border-blue-400 dark:border-blue-700' },
  { id: 'proposal', label: 'Proposal Sent', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', border: 'border-purple-400 dark:border-purple-700' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', border: 'border-amber-400 dark:border-amber-700' },
  { id: 'won', label: 'Won 🏆', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500 dark:border-emerald-700' },
  { id: 'lost', label: 'Lost', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', border: 'border-rose-400 dark:border-rose-800' }
];

// Single Deal Card Component with @dnd-kit/core Draggable
const KanbanCard: React.FC<{
  deal: Deal;
  onDealClick?: (deal: Deal) => void;
  onEditDeal?: (deal: Deal, e: React.MouseEvent) => void;
  onDeleteDeal?: (deal: Deal, e: React.MouseEvent) => void;
  isOverlay?: boolean;
}> = ({ deal, onDealClick, onEditDeal, onDeleteDeal, isOverlay = false }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    data: { deal }
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onDealClick && onDealClick(deal)}
      className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 rounded-xl p-4 shadow-sm select-none ${
        isDragging ? 'opacity-25' : 'opacity-100'
      } ${isOverlay ? 'shadow-2xl border-blue-500 scale-105 rotate-1 z-50 w-[240px]' : 'cursor-grab active:cursor-grabbing'}`}
    >
      {/* Title */}
      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2">
        {deal.title}
      </h4>

      {/* Customer & Company Name */}
      <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
        <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        <span className="truncate">
          {deal.customerName && deal.customerName !== '—' ? deal.customerName : (deal.companyName || '—')}
        </span>
      </div>

      {/* Tags */}
      {deal.tags && deal.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {deal.tags.map((t, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded-md font-medium"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Card Footer: Value & Probability & Owner Avatar */}
      <div className="mt-3.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
        <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
          ${(deal.value || 0).toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-400">
            {deal.probability}% win
          </span>
          <Avatar name={deal.assignedUserName || 'User'} size="xs" />
        </div>
      </div>

      {(!isOverlay && (onEditDeal || onDeleteDeal)) && (
        <div className="flex items-center justify-end gap-2 pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800">
          {onEditDeal && (
            <button
              onClick={(e) => { e.stopPropagation(); onEditDeal(deal, e); }}
              className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
          {onDeleteDeal && (
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteDeal(deal, e); }}
              className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Droppable Stage Column Component with @dnd-kit/core Droppable
const KanbanColumn: React.FC<{
  stage: typeof STAGES[number];
  deals: Deal[];
  onAddDeal?: (stage: DealStage) => void;
  onDealClick?: (deal: Deal) => void;
  onEditDeal?: (deal: Deal, e: React.MouseEvent) => void;
  onDeleteDeal?: (deal: Deal, e: React.MouseEvent) => void;
}> = ({ stage, deals, onAddDeal, onDealClick, onEditDeal, onDeleteDeal }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 bg-zinc-50/70 dark:bg-zinc-900/40 border transition-colors ${
        isOver ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-200 dark:border-zinc-800/80'
      } rounded-2xl p-3 flex flex-col max-h-[800px] min-w-[240px]`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stage.color}`}>
            {stage.label}
          </span>
          <span className="text-xs text-zinc-400 font-extrabold">({deals.length})</span>
        </div>
        {onAddDeal && (
          <button
            onClick={() => onAddDeal(stage.id)}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Total Stage Value */}
      <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-1 mb-3">
        Value: <span className="text-zinc-900 dark:text-zinc-100 font-extrabold">${totalValue.toLocaleString()}</span>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {deals.length === 0 ? (
          <div className="text-center py-10 text-xs text-zinc-500 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl">
            No deals in stage
          </div>
        ) : (
          deals.map(deal => (
            <KanbanCard key={deal.id} deal={deal} onDealClick={onDealClick} onEditDeal={onEditDeal} onDeleteDeal={onDeleteDeal} />
          ))
        )}
      </div>
    </div>
  );
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  deals,
  onStageChange,
  onAddDeal,
  onDealClick,
  onEditDeal,
  onDeleteDeal
}) => {
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Prevent accidental drags when clicking
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find(d => d.id === event.active.id);
    if (deal) setActiveDeal(deal);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (over && active) {
      const dealId = String(active.id);
      const targetStage = String(over.id) as DealStage;

      // Only trigger stage change if target stage is different
      const currentDeal = deals.find(d => d.id === dealId);
      if (currentDeal && currentDeal.stage !== targetStage) {
        onStageChange(dealId, targetStage);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      modifiers={[snapCenterToCursor]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full overflow-x-auto pb-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:min-w-[1200px]">
          {STAGES.map(stage => {
            const columnDeals = deals.filter(d => d.stage === stage.id);
            return (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                deals={columnDeals}
                onAddDeal={onAddDeal}
                onDealClick={onDealClick}
                onEditDeal={onEditDeal}
                onDeleteDeal={onDeleteDeal}
              />
            );
          })}
        </div>
      </div>

      {/* Smooth Drag Overlay locked directly under cursor pointer */}
      <DragOverlay dropAnimation={null}>
        {activeDeal ? (
          <div className="w-[260px] pointer-events-none shadow-2xl border-2 border-blue-500 rounded-xl p-4 bg-zinc-900 text-zinc-100 scale-105 opacity-95">
            <h4 className="text-sm font-bold line-clamp-2">
              {activeDeal.title}
            </h4>
            <div className="text-xs font-medium text-zinc-400 mt-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">
                {activeDeal.customerName && activeDeal.customerName !== '—' ? activeDeal.customerName : (activeDeal.companyName || '—')}
              </span>
            </div>
            <div className="mt-3.5 pt-2.5 border-t border-zinc-800 flex items-center justify-between text-xs">
              <div className="font-extrabold text-emerald-400 text-sm">
                ${(activeDeal.value || 0).toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-zinc-400">
                  {activeDeal.probability}% win
                </span>
                <Avatar name={activeDeal.assignedUserName || 'User'} size="xs" />
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
