import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import toast from 'react-hot-toast';

import { tablesApi, groupsApi } from '@/services/api';
import type {
  TableWithAssignments,
  UnassignedGuest,
  SeatingOverview,
  Group,
  UpdateTableDto,
  TableAssignment,
} from '@/types';

import { SeatingStats } from '@/components/seating/SeatingStats';
import { GuestPool } from '@/components/seating/GuestPool';
import { SeatingCanvas } from '@/components/seating/SeatingCanvas';
import { TableDetailsPanel } from '@/components/seating/TableDetailsPanel';
import { TableForm } from '@/components/seating/TableForm';
import { GuestChipOverlay } from '@/components/seating/GuestChip';

// Simple Dialog component
const SimpleDialog = ({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative bg-background rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        {children}
      </div>
    </div>
  );
};

export default function SeatingPage() {
  // Data state
  const [tables, setTables] = useState<TableWithAssignments[]>([]);
  const [unassignedGuests, setUnassignedGuests] = useState<UnassignedGuest[]>([]);
  const [overview, setOverview] = useState<SeatingOverview | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<TableWithAssignments | null>(null);
  const [showAddTableModal, setShowAddTableModal] = useState(false);

  // Drag state - only for guests now
  const [activeGuest, setActiveGuest] = useState<{
    data: UnassignedGuest | TableAssignment;
    neededSeats: number;
  } | null>(null);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [tablesRes, unassignedRes, overviewRes, groupsRes] = await Promise.all([
        tablesApi.getAll(),
        tablesApi.getUnassignedGuests(),
        tablesApi.getOverview(),
        groupsApi.getAll(),
      ]);

      setTables(tablesRes.data);
      setUnassignedGuests(unassignedRes.data);
      setOverview(overviewRes.data);
      setGroups(groupsRes.data);

      // Update selected table if it exists
      if (selectedTable) {
        const updated = tablesRes.data.find((t) => t.id === selectedTable.id);
        setSelectedTable(updated || null);
      }
    } catch (error) {
      // Error handled by API interceptor
    } finally {
      setLoading(false);
    }
  }, [selectedTable?.id]);

  useEffect(() => {
    loadData();
  }, []);

  // Table CRUD operations
  const handleCreateTables = async (data: { count: number; capacity: 12 | 24 }) => {
    const { count, capacity } = data;
    const startNumber = tables.length + 1;

    // Create tables sequentially
    for (let i = 0; i < count; i++) {
      await tablesApi.create({
        table_number: `${startNumber + i}`,
        capacity,
      });
    }

    toast.success(count === 1 ? 'שולחן נוסף בהצלחה' : `${count} שולחנות נוספו בהצלחה`);
    setShowAddTableModal(false);
    loadData();
  };

  const handleUpdateTable = async (id: number, data: UpdateTableDto) => {
    await tablesApi.update(id, data);
    toast.success('שולחן עודכן בהצלחה');
    loadData();
  };

  const handleDeleteTable = async (id: number) => {
    await tablesApi.delete(id);
    toast.success('שולחן נמחק');
    setSelectedTable(null);
    loadData();
  };

  // Guest assignment operations
  const handleAssignGuest = async (tableId: number, guestId: number) => {
    await tablesApi.assignGuest(tableId, { guest_id: guestId });
    loadData();
  };

  const handleUnassignGuest = async (tableId: number, guestId: number) => {
    await tablesApi.unassignGuest(tableId, guestId);
    toast.success('אורח הוסר מהשולחן');
    loadData();
  };

  // Drag and drop handlers - simplified for guests only
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current;

    if (data?.type === 'unassigned-guest') {
      const guest = data.guest as UnassignedGuest;
      setActiveGuest({
        data: guest,
        neededSeats: guest.number_of_guests,
      });
    } else if (data?.type === 'assigned-guest') {
      const guest = data.guest as TableAssignment;
      setActiveGuest({
        data: guest,
        neededSeats: guest.number_of_guests,
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveGuest(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Handle guest assignment/move
    if (activeData?.type === 'unassigned-guest' || activeData?.type === 'assigned-guest') {
      const guestId = activeData.guestId as number;
      const sourceTableId = activeData.tableId as number | undefined;

      // Dropped on a table
      if (overData?.type === 'table') {
        const targetTableId = overData.tableId as number;

        // Don't do anything if dropping on the same table
        if (sourceTableId === targetTableId) return;

        try {
          await handleAssignGuest(targetTableId, guestId);
          toast.success('אורח שובץ לשולחן');
        } catch {
          // Error handled by API interceptor
        }
        return;
      }

      // Dropped on the guest pool (unassign)
      if (overData?.type === 'pool' && sourceTableId) {
        await handleUnassignGuest(sourceTableId, guestId);
        return;
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col gap-4 p-4">
        {/* Stats header */}
        <SeatingStats overview={overview} loading={loading} />

        {/* Main content */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Guest Pool - Right side in RTL */}
          <div className="w-72 shrink-0">
            <GuestPool
              guests={unassignedGuests}
              groups={groups}
              loading={loading}
            />
          </div>

          {/* Canvas - Center */}
          <SeatingCanvas
            tables={tables}
            selectedTableId={selectedTable?.id ?? null}
            onSelectTable={setSelectedTable}
            onAddTable={() => setShowAddTableModal(true)}
            activeGuestData={activeGuest ? { neededSeats: activeGuest.neededSeats } : null}
          />

          {/* Table Details Panel - Left side in RTL */}
          {selectedTable && (
            <div className="w-72 shrink-0">
              <TableDetailsPanel
                table={selectedTable}
                onClose={() => setSelectedTable(null)}
                onUpdate={handleUpdateTable}
                onDelete={handleDeleteTable}
                onUnassignGuest={handleUnassignGuest}
              />
            </div>
          )}
        </div>
      </div>

      {/* Drag Overlay - only for guests */}
      <DragOverlay>
        {activeGuest && (
          <GuestChipOverlay guest={activeGuest.data} />
        )}
      </DragOverlay>

      {/* Add Table Modal */}
      <SimpleDialog open={showAddTableModal} onOpenChange={setShowAddTableModal}>
        <h2 className="text-lg font-semibold mb-4">הוספת שולחנות</h2>
        <TableForm
          onSubmit={handleCreateTables}
          onCancel={() => setShowAddTableModal(false)}
          currentTableCount={tables.length}
        />
      </SimpleDialog>
    </DndContext>
  );
}
