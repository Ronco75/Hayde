import { useState } from 'react';
import type { Guest, Group, RsvpStatus, CreateGuestDto, UpdateGuestDto } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { normalizePhone } from '../../utils/format';

interface GuestFormProps {
  onSubmit: (data: CreateGuestDto | UpdateGuestDto) => void;
  initialValue?: Guest;
  groups: Group[];
  onCancel?: () => void;
  onCreateGroup?: (name: string) => Promise<Group>;
}

function GuestForm({ onSubmit, initialValue, groups, onCancel, onCreateGroup }: GuestFormProps) {
  const [formData, setFormData] = useState({
    name: initialValue?.name || '',
    phone_number: initialValue?.phone_number || '',
    group_id: initialValue?.group_id || (groups[0]?.id || 0),
    number_of_guests: initialValue?.number_of_guests || 1,
    rsvp_status: (initialValue?.rsvp_status || 'pending') as RsvpStatus,
    notes: initialValue?.notes || '',
  });

  const [showNewGroupInput, setShowNewGroupInput] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !onCreateGroup) return;

    setIsCreatingGroup(true);
    try {
      const newGroup = await onCreateGroup(newGroupName.trim());
      setFormData({ ...formData, group_id: newGroup.id });
      setNewGroupName('');
      setShowNewGroupInput(false);
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone_number.trim()) return;

    // Normalize phone number before submitting
    const normalizedData = {
      ...formData,
      phone_number: normalizePhone(formData.phone_number),
    };

    onSubmit(normalizedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          שם המוזמן *
        </label>
        <Input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="שם מלא"
          required
          autoFocus
        />
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          מספר טלפון *
        </label>
        <Input
          type="tel"
          value={formData.phone_number}
          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          placeholder="050-1234567"
          required
        />
      </div>

      {/* Group */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            קבוצה *
          </label>
          {onCreateGroup && !showNewGroupInput && (
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => setShowNewGroupInput(true)}
              className="h-auto p-0 text-xs"
            >
              + קבוצה חדשה
            </Button>
          )}
        </div>

        {showNewGroupInput ? (
          <div className="flex gap-2">
            <Input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="שם הקבוצה החדשה..."
              disabled={isCreatingGroup}
              autoFocus
            />
            <Button
              type="button"
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim() || isCreatingGroup}
            >
              צור
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowNewGroupInput(false);
                setNewGroupName('');
              }}
              disabled={isCreatingGroup}
            >
              ביטול
            </Button>
          </div>
        ) : (
          <select
            value={formData.group_id}
            onChange={(e) => setFormData({ ...formData, group_id: parseInt(e.target.value) })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Number of Guests */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          מספר משתתפים
        </label>
        <Input
          type="number"
          value={formData.number_of_guests}
          onChange={(e) => setFormData({ ...formData, number_of_guests: parseInt(e.target.value) || 1 })}
          min="1"
        />
      </div>

      {/* RSVP Status */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          סטטוס אישור
        </label>
        <select
          value={formData.rsvp_status}
          onChange={(e) => setFormData({ ...formData, rsvp_status: e.target.value as RsvpStatus })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="pending">ממתין לתשובה</option>
          <option value="confirmed">אישר הגעה</option>
          <option value="declined">לא מגיע</option>
          <option value="maybe">אולי</option>
        </select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          הערות
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="הערות נוספות..."
          rows={3}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            ביטול
          </Button>
        )}
        <Button type="submit">
          שמור
        </Button>
      </div>
    </form>
  );
}

export default GuestForm;
