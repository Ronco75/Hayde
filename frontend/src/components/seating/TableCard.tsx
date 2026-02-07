import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import type { TableWithAssignments } from '@/types';

interface TableCardProps {
  table: TableWithAssignments;
  isSelected: boolean;
  onClick: () => void;
  canAcceptGuest?: { canAccept: boolean; neededSeats: number } | null;
}

export function TableCard({ table, isSelected, onClick, canAcceptGuest }: TableCardProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `table-${table.id}`,
    data: { type: 'table', tableId: table.id, table },
  });

  const fillPercentage = table.capacity > 0 ? (table.assigned_count / table.capacity) * 100 : 0;

  // Color based on fill percentage
  const getColors = () => {
    if (fillPercentage === 0) {
      return {
        bg: 'bg-slate-100 dark:bg-slate-800',
        border: 'border-slate-300 dark:border-slate-600',
        text: 'text-slate-600 dark:text-slate-300',
      };
    }
    if (fillPercentage < 50) {
      return {
        bg: 'bg-blue-100 dark:bg-blue-900/40',
        border: 'border-blue-400 dark:border-blue-600',
        text: 'text-blue-700 dark:text-blue-300',
      };
    }
    if (fillPercentage < 100) {
      return {
        bg: 'bg-purple-100 dark:bg-purple-900/40',
        border: 'border-purple-400 dark:border-purple-600',
        text: 'text-purple-700 dark:text-purple-300',
      };
    }
    return {
      bg: 'bg-green-100 dark:bg-green-900/40',
      border: 'border-green-500 dark:border-green-600',
      text: 'text-green-700 dark:text-green-300',
    };
  };

  const colors = getColors();

  // Calculate if drop would exceed capacity
  const wouldExceedCapacity = canAcceptGuest && !canAcceptGuest.canAccept;

  return (
    <div
      ref={setNodeRef}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        'relative rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all border-2 p-4 min-h-[100px]',
        colors.bg,
        colors.border,
        isSelected && 'ring-4 ring-purple-500 ring-offset-2 dark:ring-offset-background',
        isOver && !wouldExceedCapacity && 'ring-4 ring-green-500 scale-105',
        isOver && wouldExceedCapacity && 'ring-4 ring-red-500 scale-105',
        'hover:shadow-lg'
      )}
    >
      <span className={cn('font-bold text-xl', colors.text)}>שולחן {table.table_number}</span>
      <span className={cn('text-sm font-numeric mt-1', colors.text)}>
        {table.assigned_count}/{table.capacity} מקומות
      </span>

      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
        <div
          className={cn(
            'h-full transition-all rounded-full',
            fillPercentage === 0 && 'bg-slate-300',
            fillPercentage > 0 && fillPercentage < 50 && 'bg-blue-500',
            fillPercentage >= 50 && fillPercentage < 100 && 'bg-purple-500',
            fillPercentage >= 100 && 'bg-green-500'
          )}
          style={{ width: `${Math.min(fillPercentage, 100)}%` }}
        />
      </div>

      {/* Drop feedback */}
      {isOver && canAcceptGuest && (
        <div
          className={cn(
            'absolute -bottom-6 text-xs font-medium whitespace-nowrap z-10',
            canAcceptGuest.canAccept ? 'text-green-600' : 'text-red-600'
          )}
        >
          {canAcceptGuest.canAccept ? 'שחרר כאן' : `חסרים ${canAcceptGuest.neededSeats - table.available_seats} מקומות`}
        </div>
      )}
    </div>
  );
}

// Simple overlay for drag feedback (if needed in future)
export function TableCardOverlay({ table }: { table: TableWithAssignments }) {
  const fillPercentage = table.capacity > 0 ? (table.assigned_count / table.capacity) * 100 : 0;

  const getColors = () => {
    if (fillPercentage === 0) {
      return { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-600' };
    }
    if (fillPercentage < 50) {
      return { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700' };
    }
    if (fillPercentage < 100) {
      return { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700' };
    }
    return { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-700' };
  };

  const colors = getColors();

  return (
    <div
      className={cn(
        'rounded-lg flex flex-col items-center justify-center border-2 shadow-2xl p-4 min-h-[100px]',
        colors.bg,
        colors.border
      )}
    >
      <span className={cn('font-bold text-xl', colors.text)}>שולחן {table.table_number}</span>
      <span className={cn('text-sm font-numeric mt-1', colors.text)}>
        {table.assigned_count}/{table.capacity} מקומות
      </span>
    </div>
  );
}
