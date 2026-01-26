import { useState, useEffect } from 'react';
import { Plus, Search, Phone, Users, Trash2, X, CheckSquare } from 'lucide-react';
import type { Guest, Group, RsvpStatus } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface GuestListProps {
  guests: Guest[];
  groups: Group[];
  onEdit: (guest: Guest) => void;
  onDelete: (guestId: number) => void;
  onAdd: () => void;
  onImport: () => void;
  onManageGroups: () => void;
  onManageInvitationImage?: () => void;
  onGuestUpdate?: (updatedGuest: Guest) => void;
  onBulkUpdate?: (updatedGuests: Guest[]) => void;
  onBulkDelete?: (ids: number[]) => void;
  onBulkUpdateRsvp?: (ids: number[], rsvpStatus: RsvpStatus) => void;
  onBulkUpdateGroup?: (ids: number[], groupId: number) => void;
}

function GuestList({ 
  guests, 
  groups, 
  onEdit, 
  onDelete, 
  onAdd, 
  onImport,
  onBulkDelete,
  onBulkUpdateRsvp,
  onBulkUpdateGroup,
}: GuestListProps) {
  const [filterGroup, setFilterGroup] = useState<number | null>(null);
  const [filterRsvp, setFilterRsvp] = useState<RsvpStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Filter guests based on selected filters
  const filteredGuests = guests.filter((guest) => {
    const matchesGroup = filterGroup === null || guest.group_id === filterGroup;
    const matchesRsvp = filterRsvp === null || guest.rsvp_status === filterRsvp;
    const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.phone_number.includes(searchQuery);
    return matchesGroup && matchesRsvp && matchesSearch;
  });

  // Clear selection when guests list changes (after bulk operations)
  useEffect(() => {
    setSelectedIds(new Set());
  }, [guests]);

  // Get group name by ID
  const getGroupName = (groupId: number) => {
    return groups.find(g => g.id === groupId)?.name || 'ללא קבוצה';
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'declined': return 'destructive';
      case 'maybe': return 'secondary';
      default: return 'outline';
    }
  };

  const statusLabels: Record<string, string> = {
    confirmed: 'מגיע',
    pending: 'ממתין',
    declined: 'לא מגיע',
    maybe: 'אולי',
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredGuests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredGuests.map(g => g.id)));
    }
  };

  const toggleSelectGuest = (guestId: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(guestId)) {
      newSelected.delete(guestId);
    } else {
      newSelected.add(guestId);
    }
    setSelectedIds(newSelected);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const isAllSelected = filteredGuests.length > 0 && selectedIds.size === filteredGuests.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < filteredGuests.length;
  const hasSelection = selectedIds.size > 0;

  // Bulk action handlers
  const handleBulkDelete = () => {
    if (onBulkDelete && selectedIds.size > 0) {
      onBulkDelete(Array.from(selectedIds));
    }
  };

  const handleBulkRsvpChange = (status: RsvpStatus) => {
    if (onBulkUpdateRsvp && selectedIds.size > 0) {
      onBulkUpdateRsvp(Array.from(selectedIds), status);
    }
  };

  const handleBulkGroupChange = (groupId: number) => {
    if (onBulkUpdateGroup && selectedIds.size > 0) {
      onBulkUpdateGroup(Array.from(selectedIds), groupId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Functionality Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card rounded-lg border p-4 shadow-sm">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חיפוש לפי שם או טלפון..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 w-full sm:w-[250px]"
            />
          </div>

          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={filterGroup || ''}
            onChange={(e) => setFilterGroup(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">כל הקבוצות</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={filterRsvp || ''}
            onChange={(e) => setFilterRsvp((e.target.value as RsvpStatus) || null)}
          >
            <option value="">כל הסטטוסים</option>
            <option value="confirmed">מגיעים ✅</option>
            <option value="pending">ממתינים ⏳</option>
            <option value="declined">לא מגיעים ❌</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          <Button variant="outline" size="sm" onClick={onImport}>
            ייבוא מאקסל
          </Button>
          <Button size="sm" onClick={onAdd}>
            <Plus className="w-4 h-4 mr-2" />
            הוסף מוזמן
          </Button>
        </div>
      </div>

      {/* Floating Selection Action Bar */}
      {hasSelection && (
        <div className="sticky top-4 z-10 flex flex-wrap items-center gap-3 bg-primary text-primary-foreground rounded-lg p-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 font-medium">
            <CheckSquare className="w-5 h-5" />
            <span>{selectedIds.size} מוזמנים נבחרו</span>
          </div>
          
          <div className="h-6 w-px bg-primary-foreground/30" />
          
          {/* RSVP Status Dropdown */}
          <select
            className="h-8 rounded-md bg-primary-foreground/10 border-primary-foreground/30 px-2 py-1 text-sm text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground/50 [&>option]:text-foreground [&>option]:bg-background"
            onChange={(e) => {
              if (e.target.value) {
                handleBulkRsvpChange(e.target.value as RsvpStatus);
                e.target.value = '';
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>שנה סטטוס</option>
            <option value="confirmed">מגיע ✅</option>
            <option value="pending">ממתין ⏳</option>
            <option value="declined">לא מגיע ❌</option>
            <option value="maybe">אולי 🤔</option>
          </select>

          {/* Group Dropdown */}
          <select
            className="h-8 rounded-md bg-primary-foreground/10 border-primary-foreground/30 px-2 py-1 text-sm text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground/50 [&>option]:text-foreground [&>option]:bg-background"
            onChange={(e) => {
              if (e.target.value) {
                handleBulkGroupChange(parseInt(e.target.value));
                e.target.value = '';
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>העבר לקבוצה</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          <div className="h-6 w-px bg-primary-foreground/30" />

          {/* Delete Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary-foreground hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleBulkDelete}
          >
            <Trash2 className="w-4 h-4 ml-1" />
            מחק
          </Button>

          {/* Clear Selection */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary-foreground hover:bg-primary-foreground/20 mr-auto"
            onClick={clearSelection}
          >
            <X className="w-4 h-4 ml-1" />
            ביטול
          </Button>
        </div>
      )}

      {/* Main Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomeSelected;
                  }}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  aria-label="בחר הכל"
                />
              </TableHead>
              <TableHead className="text-right">שם מלא</TableHead>
              <TableHead className="text-right">טלפון</TableHead>
              <TableHead className="text-right">קבוצה</TableHead>
              <TableHead className="text-center">כמות</TableHead>
              <TableHead className="text-center">סטטוס</TableHead>
              <TableHead className="text-left">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGuests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                  לא נמצאו מוזמנים
                </TableCell>
              </TableRow>
            ) : (
              filteredGuests.map((guest) => (
                <TableRow 
                  key={guest.id} 
                  className={selectedIds.has(guest.id) ? 'bg-primary/5' : ''}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(guest.id)}
                      onChange={() => toggleSelectGuest(guest.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      aria-label={`בחר ${guest.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{guest.name}</TableCell>
                  <TableCell>
                    <a href={`tel:${guest.phone_number}`} className="flex items-center gap-1 hover:text-primary">
                      <Phone className="w-3 h-3" />
                      {guest.phone_number}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {getGroupName(guest.group_id)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      {guest.number_of_guests}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getStatusBadgeVariant(guest.rsvp_status)}>
                      {statusLabels[guest.rsvp_status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(guest)}>
                        עריכה
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDelete(guest.id)}>
                        מחיקה
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

    </div>
  );
}

export default GuestList;
