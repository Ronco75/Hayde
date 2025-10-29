import type { Group } from '../../types';
import { Pencil, Trash2, Users } from 'lucide-react';
import Button from '../common/Button';
import Tooltip from '../common/Tooltip';

interface GroupCardProps {
    group: Group;
    guestCount: number;
    onEdit: (group: Group) => void;
    onDelete: (groupId: number) => void;
}

function GroupCard({ group, guestCount, onEdit, onDelete }: GroupCardProps) {
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
        relative
        flex
        flex-col">

            {/* Group Name */}
            <h2 className="text-2xl font-bold text-primary-200 mb-3 hover:text-primary-100 transition-colors leading-snug">
                {group.name}
            </h2>

            {/* Guest Count */}
            <div className="flex items-center gap-2 text-gray-400 mb-4">
                <Users size={16} />
                <span className="text-sm">
                    {guestCount === 0 ? 'אין מוזמנים' : `${guestCount} מוזמנים`}
                </span>
            </div>

            {/* Action Buttons - at bottom */}
            <div className="flex gap-2 mt-auto justify-center">
                <div onClick={(e) => { e.stopPropagation(); onEdit(group); }}>
                    <Tooltip content="עריכת שם הקבוצה">
                        <Button size="sm" variant="ghost">
                            <Pencil size={16} />
                        </Button>
                    </Tooltip>
                </div>
                <div onClick={(e) => { e.stopPropagation(); onDelete(group.id); }}>
                    <Tooltip content="מחיקת קבוצה">
                        <Button size="sm" variant="ghost">
                            <Trash2 size={16} />
                        </Button>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

export default GroupCard;