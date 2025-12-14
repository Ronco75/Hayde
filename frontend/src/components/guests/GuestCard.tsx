import { useState } from 'react';
import type { Guest } from '../../types';
import { Pencil, Trash2, Phone, Users, Gift, Check, X } from 'lucide-react';
import Button from '../common/Button';
import Tooltip from '../common/Tooltip';
import { formatPhoneDisplay, formatNis } from '../../utils/format';
import { guestsApi } from '../../services/api';
import toast from 'react-hot-toast';

interface GuestCardProps {
  guest: Guest;
  groupName: string;
  onEdit: (guest: Guest) => void;
  onDelete: (guestId: number) => void;
  onGiftUpdated?: (updatedGuest: Guest) => void;
}

// RSVP status configuration
const rsvpConfig = {
  confirmed: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'אישר' },
  declined: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'לא מגיע' },
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'ממתין' },
  maybe: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'אולי' },
};

function GuestCard({ guest, groupName, onEdit, onDelete, onGiftUpdated }: GuestCardProps) {
  const statusStyle = rsvpConfig[guest.rsvp_status];
  const [isEditingGift, setIsEditingGift] = useState(false);
  const [giftAmount, setGiftAmount] = useState(guest.gift_amount || 0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveGift = async () => {
    setIsSaving(true);
    try {
      const response = await guestsApi.updateGiftAmount(guest.id, { gift_amount: giftAmount });
      toast.success('סכום המתנה עודכן בהצלחה');
      setIsEditingGift(false);
      if (onGiftUpdated) {
        onGiftUpdated(response.data);
      }
    } catch {
      // Error toast is handled by API interceptor
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setGiftAmount(guest.gift_amount || 0);
    setIsEditingGift(false);
  };

  return (
    <div className="
      bg-slate-900
      text-gray-100
      rounded-lg
      shadow-elev-2
      hover:shadow-elev-3
      p-6
      transition-all
      duration-300
      border
      border-white/10
      relative">

      {/* Action buttons */}
      <div className="absolute top-4 left-4 flex gap-2">
        <div onClick={(e) => { e.stopPropagation(); onEdit(guest); }}>
          <Tooltip content="עריכה">
            <Button size="icon" variant="ghost">
              <Pencil size={18} />
            </Button>
          </Tooltip>
        </div>
        <div onClick={(e) => { e.stopPropagation(); onDelete(guest.id); }}>
          <Tooltip content="מחיקה">
            <Button size="icon" variant="ghost">
              <Trash2 size={18} />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Guest Name */}
      <h2 className="text-2xl font-bold text-primary-200 mb-3 hover:text-primary-100 transition-colors leading-snug pl-20">
        {guest.name}
      </h2>

      {/* Phone Number */}
      <div className="flex items-center gap-2 text-gray-300 mb-2">
        <Phone size={16} />
        <span className="text-sm font-numeric">{formatPhoneDisplay(guest.phone_number)}</span>
      </div>

      {/* Group */}
      <div className="text-sm text-gray-400 mb-3">
        קבוצה: <span className="text-primary-300">{groupName}</span>
      </div>

      {/* Bottom section: RSVP badge and attendee count */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
        {/* RSVP Status Badge */}
        <span className={`${statusStyle.bg} ${statusStyle.text} px-3 py-1 rounded-full text-xs font-semibold`}>
          {statusStyle.label}
        </span>

        {/* Total Attendees Count */}
        <div className="flex items-center gap-1 text-gray-400 text-sm">
          <Users size={16} />
          <span>{guest.number_of_guests} משתתפים</span>
        </div>
      </div>

      {/* Gift Amount Section - Only show for confirmed guests */}
      {guest.rsvp_status === 'confirmed' && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Gift size={16} className="text-gold-400" />
              <span>מתנה:</span>
            </div>

            {isEditingGift ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={giftAmount}
                  onChange={(e) => setGiftAmount(parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-1 text-sm rounded bg-slate-800 border border-white/20 text-gray-100 focus:border-gold-400 focus:outline-none"
                  min="0"
                  step="100"
                  disabled={isSaving}
                />
                <Tooltip content="שמור">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSaveGift}
                    disabled={isSaving}
                    className="text-green-400 hover:text-green-300"
                  >
                    <Check size={16} />
                  </Button>
                </Tooltip>
                <Tooltip content="ביטול">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X size={16} />
                  </Button>
                </Tooltip>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-gold-400 font-semibold font-numeric">
                  {formatNis(guest.gift_amount || 0)}
                </span>
                <Tooltip content="עדכון מתנה">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsEditingGift(true)}
                    className="text-gray-400 hover:text-gold-400"
                  >
                    <Pencil size={14} />
                  </Button>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GuestCard;
