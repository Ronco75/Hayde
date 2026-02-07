import { useState, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GuestChip } from './GuestChip';
import type { UnassignedGuest, Group } from '@/types';
import { cn } from '@/lib/utils';

interface GuestPoolProps {
  guests: UnassignedGuest[];
  groups: Group[];
  loading?: boolean;
}

export function GuestPool({ guests, groups, loading }: GuestPoolProps) {
  const [search, setSearch] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: 'guest-pool',
    data: { type: 'pool' },
  });

  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const matchesSearch = guest.name.toLowerCase().includes(search.toLowerCase());
      const matchesGroup = selectedGroupId === null || guest.group_id === selectedGroupId;
      return matchesSearch && matchesGroup;
    });
  }, [guests, search, selectedGroupId]);

  const totalPeople = useMemo(() => {
    return filteredGuests.reduce((sum, g) => sum + g.number_of_guests, 0);
  }, [filteredGuests]);

  const groupOptions = useMemo(() => {
    const groupsWithGuests = new Set(guests.map((g) => g.group_id));
    return groups.filter((g) => groupsWithGuests.has(g.id));
  }, [guests, groups]);

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        'flex flex-col h-full transition-colors',
        isOver && 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950/20'
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-purple-600" />
          אורחים לשיבוץ
          <span className="text-sm font-normal text-muted-foreground">
            ({filteredGuests.length} רשומות, {totalPeople} אנשים)
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 flex-1 overflow-hidden">
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש אורח..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>

        {/* Group filter */}
        {groupOptions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedGroupId(null)}
              className={cn(
                'px-2 py-1 text-xs rounded-full transition-colors',
                selectedGroupId === null
                  ? 'bg-purple-600 text-white'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              הכל
            </button>
            {groupOptions.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={cn(
                  'px-2 py-1 text-xs rounded-full transition-colors',
                  selectedGroupId === group.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                {group.name}
              </button>
            ))}
          </div>
        )}

        {/* Guest list */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse h-10 bg-muted rounded-lg" />
              ))}
            </div>
          ) : filteredGuests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {guests.length === 0 ? (
                <p>אין אורחים שאישרו הגעה וטרם שובצו</p>
              ) : (
                <p>לא נמצאו אורחים תואמים</p>
              )}
            </div>
          ) : (
            filteredGuests.map((guest) => (
              <GuestChip key={guest.id} guest={guest} />
            ))
          )}
        </div>

        {/* Drop zone indicator */}
        {isOver && (
          <div className="text-center py-2 text-purple-600 font-medium animate-pulse">
            שחרר כאן כדי להסיר מהשולחן
          </div>
        )}
      </CardContent>
    </Card>
  );
}
