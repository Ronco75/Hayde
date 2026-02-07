import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TableCard } from './TableCard';
import type { TableWithAssignments } from '@/types';

interface SeatingCanvasProps {
  tables: TableWithAssignments[];
  selectedTableId: number | null;
  onSelectTable: (table: TableWithAssignments | null) => void;
  onAddTable: () => void;
  activeGuestData?: { neededSeats: number } | null;
}

export function SeatingCanvas({
  tables,
  selectedTableId,
  onSelectTable,
  onAddTable,
  activeGuestData,
}: SeatingCanvasProps) {
  const handleCanvasClick = () => {
    onSelectTable(null);
  };

  return (
    <Card className="flex-1 overflow-hidden relative flex flex-col">
      {/* Header with add button */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card">
        <span className="text-sm text-muted-foreground">
          {tables.length > 0 ? `${tables.length} שולחנות` : 'אין שולחנות'}
        </span>
        <Button
          onClick={onAddTable}
          className="bg-purple-600 hover:bg-purple-700"
          size="sm"
        >
          <Plus className="w-4 h-4 ml-1" />
          הוסף שולחן
        </Button>
      </div>

      {/* Canvas area */}
      <div
        onClick={handleCanvasClick}
        className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6"
      >
        {tables.length === 0 ? (
          <div className="flex flex-col items-center pt-8 text-muted-foreground">
            <p className="text-lg mb-2">אין שולחנות עדיין</p>
            <p className="text-sm">לחץ על הכפתור למעלה להוספת שולחן ראשון</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                isSelected={selectedTableId === table.id}
                onClick={() => onSelectTable(table)}
                canAcceptGuest={
                  activeGuestData
                    ? {
                        canAccept: table.available_seats >= activeGuestData.neededSeats,
                        neededSeats: activeGuestData.neededSeats,
                      }
                    : null
                }
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
