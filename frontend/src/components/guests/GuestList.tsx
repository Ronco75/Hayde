import { useState } from 'react';
import type { Guest, Group, RsvpStatus } from '../../types';
import GuestCard from './GuestCard';
import Button from '../common/Button';

interface GuestListProps {
  guests: Guest[];
  groups: Group[];
  onEdit: (guest: Guest) => void;
  onDelete: (guestId: number) => void;
  onAdd: () => void;
  onImport: () => void;
}

function GuestList({ guests, groups, onEdit, onDelete, onAdd, onImport }: GuestListProps) {
  const [filterGroup, setFilterGroup] = useState<number | null>(null);
  const [filterRsvp, setFilterRsvp] = useState<RsvpStatus | null>(null);

  // Filter guests based on selected filters
  const filteredGuests = guests.filter((guest) => {
    const matchesGroup = filterGroup === null || guest.group_id === filterGroup;
    const matchesRsvp = filterRsvp === null || guest.rsvp_status === filterRsvp;
    return matchesGroup && matchesRsvp;
  });

  // Get group name by ID
  const getGroupName = (groupId: number) => {
    return groups.find(g => g.id === groupId)?.name || 'לא ידוע';
  };

  return (
    <div>
      {/* Filters and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Group Filter */}
          <select
            value={filterGroup || ''}
            onChange={(e) => setFilterGroup(e.target.value ? parseInt(e.target.value) : null)}
            className="
              px-4 py-2 text-sm rounded-lg
              bg-slate-800 text-gray-100
              border border-white/10 focus:outline-none focus:ring-2
              focus:ring-primary-300 focus:border-primary-600
              transition-all duration-200
            "
          >
            <option value="">כל הקבוצות</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>

          {/* RSVP Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterRsvp(null)}
              className={`
                px-4 py-2 text-sm rounded-lg font-semibold transition-all
                ${filterRsvp === null 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}
              `}
            >
              הכל
            </button>
            <button
              onClick={() => setFilterRsvp('confirmed')}
              className={`
                px-4 py-2 text-sm rounded-lg font-semibold transition-all
                ${filterRsvp === 'confirmed' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}
              `}
            >
              אישרו
            </button>
            <button
              onClick={() => setFilterRsvp('pending')}
              className={`
                px-4 py-2 text-sm rounded-lg font-semibold transition-all
                ${filterRsvp === 'pending' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}
              `}
            >
              ממתינים
            </button>
            <button
              onClick={() => setFilterRsvp('declined')}
              className={`
                px-4 py-2 text-sm rounded-lg font-semibold transition-all
                ${filterRsvp === 'declined' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}
              `}
            >
              לא מגיעים
            </button>
          </div>
        </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="secondary" onClick={onImport}>
          ייבא מאקסל 📊 
        </Button>
        <Button type="button" variant="primary" onClick={onAdd}>
          הוספת מוזמן + 
        </Button>
      </div>
      </div>

      {/* Guest List or Empty State */}
      {filteredGuests.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-12 text-center">
          <div className="text-6xl sm:text-5xl mb-4">👥</div>
          <h2 className="text-2xl sm:text-xl font-bold text-white mb-2 leading-tight">
            {guests.length === 0 ? 'אין מוזמנים עדיין' : 'לא נמצאו מוזמנים'}
          </h2>
          <p className="text-purple-100 text-lg sm:text-base">
            {guests.length === 0 
              ? 'התחל על ידי הוספת המוזמן הראשון שלך!' 
              : 'נסה לשנות את הפילטרים'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-6 md:gap-5">
          {filteredGuests.map((guest) => (
            <GuestCard 
              key={guest.id} 
              guest={guest} 
              groupName={getGroupName(guest.group_id)}
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default GuestList;
