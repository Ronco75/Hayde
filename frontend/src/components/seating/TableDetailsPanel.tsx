import { useState } from 'react';
import { X, Edit2, Trash2, Users, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GuestChip } from './GuestChip';
import type { TableWithAssignments, UpdateTableDto } from '@/types';
import { cn } from '@/lib/utils';

// Confirmation Dialog component
const ConfirmDialog = ({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'אישור',
  cancelText = 'ביטול',
  isLoading = false,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-background rounded-lg shadow-lg p-6 w-full max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-2">
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'מוחק...' : confirmText}
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface TableDetailsPanelProps {
  table: TableWithAssignments;
  onClose: () => void;
  onUpdate: (id: number, data: UpdateTableDto) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onUnassignGuest: (tableId: number, guestId: number) => Promise<void>;
}

export function TableDetailsPanel({
  table,
  onClose,
  onUpdate,
  onDelete,
  onUnassignGuest,
}: TableDetailsPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(table.table_number);
  const [editedCapacity, setEditedCapacity] = useState<12 | 24>(table.capacity as 12 | 24);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    if (!editedName.trim()) return;

    setIsSaving(true);
    try {
      await onUpdate(table.id, {
        table_number: editedName.trim(),
        capacity: editedCapacity,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(table.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleUnassign = async (guestId: number) => {
    await onUnassignGuest(table.id, guestId);
  };

  const fillPercentage = table.capacity > 0 ? (table.assigned_count / table.capacity) * 100 : 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">פרטי שולחן</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Table name and capacity */}
        {isEditing ? (
          <div className="space-y-3">
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="מספר/שם שולחן"
              className="text-right"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant={editedCapacity === 12 ? 'default' : 'outline'}
                size="sm"
                className={cn('flex-1', editedCapacity === 12 && 'bg-purple-600 hover:bg-purple-700')}
                onClick={() => setEditedCapacity(12)}
              >
                12
              </Button>
              <Button
                type="button"
                variant={editedCapacity === 24 ? 'default' : 'outline'}
                size="sm"
                className={cn('flex-1', editedCapacity === 24 && 'bg-purple-600 hover:bg-purple-700')}
                onClick={() => setEditedCapacity(24)}
              >
                24
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving || !editedName.trim()}
                size="sm"
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Save className="w-4 h-4 ml-1" />
                {isSaving ? 'שומר...' : 'שמור'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditedName(table.table_number);
                  setEditedCapacity(table.capacity as 12 | 24);
                }}
                className="flex-1"
              >
                ביטול
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">שולחן {table.table_number}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={fillPercentage >= 100 ? 'default' : 'secondary'}
                  className={cn(
                    fillPercentage >= 100 && 'bg-green-600'
                  )}
                >
                  <Users className="w-3 h-3 ml-1" />
                  <span className="font-numeric">{table.assigned_count}/{table.capacity}</span>
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ({table.available_seats} פנויים)
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Assigned guests */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            אורחים משובצים ({table.assignments.length})
          </h4>
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {table.assignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                אין אורחים משובצים לשולחן זה
                <br />
                <span className="text-xs">גרור אורחים מהרשימה לכאן</span>
              </div>
            ) : (
              table.assignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <GuestChip
                      guest={assignment}
                      isFromTable
                      tableId={table.id}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-red-600"
                    onClick={() => handleUnassign(assignment.guest_id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        title="מחיקת שולחן"
        message={`האם למחוק את שולחן ${table.table_number}? כל האורחים יוסרו משיבוץ.`}
        confirmText="מחק"
        isLoading={isDeleting}
      />
    </Card>
  );
}
