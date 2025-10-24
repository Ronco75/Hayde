import { useState } from 'react';
import type { Guest, Group, RsvpStatus, CreateGuestDto, UpdateGuestDto } from '../../types';
import Button from '../common/Button';
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
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-1.5">
          שם המוזמן *
        </label>
        <input 
          type="text" 
          value={formData.name} 
          onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
          placeholder="שם מלא" 
          className="
            w-full px-4 py-3 text-base rounded-lg
            bg-slate-800 text-gray-100 placeholder:text-gray-400
            border border-white/10 focus:outline-none focus:ring-4
            focus:ring-primary-300 focus:border-primary-600 
            transition-all duration-200
          " 
          required 
        />
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-1.5">
          מספר טלפון *
        </label>
        <input 
          type="tel" 
          value={formData.phone_number} 
          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} 
          placeholder="050-1234567" 
          className="
            w-full px-4 py-3 text-base rounded-lg
            bg-slate-800 text-gray-100 placeholder:text-gray-400
            border border-white/10 focus:outline-none focus:ring-4
            focus:ring-primary-300 focus:border-primary-600 
            transition-all duration-200
          " 
          required 
        />
      </div>

      {/* Group */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-sm font-semibold text-gray-300">
            קבוצה *
          </label>
          {onCreateGroup && !showNewGroupInput && (
            <button
              type="button"
              onClick={() => setShowNewGroupInput(true)}
              className="text-xs text-primary-400 hover:text-primary-300 font-semibold transition-colors"
            >
              + קבוצה חדשה
            </button>
          )}
        </div>

        {showNewGroupInput ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="שם הקבוצה החדשה..."
                className="
                  flex-1 px-4 py-3 text-base rounded-lg
                  bg-slate-800 text-gray-100 placeholder:text-gray-400
                  border border-white/10 focus:outline-none focus:ring-4
                  focus:ring-primary-300 focus:border-primary-600
                  transition-all duration-200
                "
                disabled={isCreatingGroup}
                autoFocus
              />
              <button
                type="button"
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim() || isCreatingGroup}
                className="
                  px-4 py-3 rounded-lg font-semibold text-sm
                  bg-primary-600 text-white
                  hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                {isCreatingGroup ? '...' : 'צור'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewGroupInput(false);
                  setNewGroupName('');
                }}
                disabled={isCreatingGroup}
                className="
                  px-4 py-3 rounded-lg font-semibold text-sm
                  bg-slate-700 text-gray-300
                  hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                ביטול
              </button>
            </div>
          </div>
        ) : (
          <select
            value={formData.group_id}
            onChange={(e) => setFormData({ ...formData, group_id: parseInt(e.target.value) })}
            className="
              w-full px-4 py-3 text-base rounded-lg
              bg-slate-800 text-gray-100
              border border-white/10 focus:outline-none focus:ring-4
              focus:ring-primary-300 focus:border-primary-600
              transition-all duration-200
            "
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
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-1.5">
          מספר משתתפים
        </label>
        <input 
          type="number" 
          value={formData.number_of_guests} 
          onChange={(e) => setFormData({ ...formData, number_of_guests: parseInt(e.target.value) || 1 })} 
          min="1"
          className="
            w-full px-4 py-3 text-base rounded-lg
            bg-slate-800 text-gray-100
            border border-white/10 focus:outline-none focus:ring-4
            focus:ring-primary-300 focus:border-primary-600 
            transition-all duration-200
          " 
        />
      </div>

      {/* RSVP Status */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-1.5">
          סטטוס אישור
        </label>
        <select 
          value={formData.rsvp_status} 
          onChange={(e) => setFormData({ ...formData, rsvp_status: e.target.value as RsvpStatus })} 
          className="
            w-full px-4 py-3 text-base rounded-lg
            bg-slate-800 text-gray-100
            border border-white/10 focus:outline-none focus:ring-4
            focus:ring-primary-300 focus:border-primary-600 
            transition-all duration-200
          "
        >
          <option value="pending">ממתין לתשובה</option>
          <option value="confirmed">אישר הגעה</option>
          <option value="declined">לא מגיע</option>
          <option value="maybe">אולי</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-1.5">
          הערות
        </label>
        <textarea 
          value={formData.notes} 
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
          placeholder="הערות נוספות..." 
          rows={2}
          className="
            w-full px-4 py-3 text-base rounded-lg
            bg-slate-800 text-gray-100 placeholder:text-gray-400
            border border-white/10 focus:outline-none focus:ring-4
            focus:ring-primary-300 focus:border-primary-600
            transition-all duration-200
          "
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-1">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
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
