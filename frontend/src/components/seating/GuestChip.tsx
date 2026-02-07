import { useDraggable } from '@dnd-kit/core';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { UnassignedGuest, TableAssignment } from '@/types';
import { cn } from '@/lib/utils';

interface GuestChipProps {
  guest: UnassignedGuest | TableAssignment;
  isFromTable?: boolean;
  tableId?: number;
}

export function GuestChip({ guest, isFromTable = false, tableId }: GuestChipProps) {
  const id = isFromTable
    ? `assignment-${(guest as TableAssignment).guest_id}-table-${tableId}`
    : `guest-${guest.id}`;

  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id,
    data: {
      type: isFromTable ? 'assigned-guest' : 'unassigned-guest',
      guest,
      tableId,
      guestId: isFromTable ? (guest as TableAssignment).guest_id : guest.id,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const name = isFromTable ? (guest as TableAssignment).guest_name : (guest as UnassignedGuest).name;
  const numberOfGuests = isFromTable
    ? (guest as TableAssignment).number_of_guests
    : (guest as UnassignedGuest).number_of_guests;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'flex items-center justify-between gap-2 px-3 py-2 rounded-lg border cursor-grab active:cursor-grabbing transition-all',
        'bg-card hover:bg-accent hover:border-purple-400',
        isDragging && 'opacity-50 scale-95 shadow-lg ring-2 ring-purple-500'
      )}
    >
      <span className="text-sm font-medium truncate">{name}</span>
      <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
        <Users className="w-3 h-3" />
        <span className="font-numeric">{numberOfGuests}</span>
      </Badge>
    </div>
  );
}

// Drag overlay version (shown while dragging)
export function GuestChipOverlay({ guest }: { guest: UnassignedGuest | TableAssignment }) {
  const name = 'guest_name' in guest ? guest.guest_name : guest.name;
  const numberOfGuests = guest.number_of_guests;

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border bg-card shadow-xl ring-2 ring-purple-500 cursor-grabbing">
      <span className="text-sm font-medium truncate">{name}</span>
      <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
        <Users className="w-3 h-3" />
        <span className="font-numeric">{numberOfGuests}</span>
      </Badge>
    </div>
  );
}
