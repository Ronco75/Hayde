import type { Group } from '../../types';
import { Pencil, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import Tooltip from '../common/Tooltip';

interface GroupCardProps {
    group: Group;
    onEdit: (group: Group) => void;
    onDelete: (groupId: number) => void;
}

function GroupCard({ group, onEdit, onDelete }: GroupCardProps) {
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
                <div onClick={(e) => { e.stopPropagation(); onEdit(group); }}>
                    <Tooltip content="עריכה">
                        <Button size="icon" variant="ghost">
                            <Pencil size={18} />
                        </Button>
                    </Tooltip>
                </div>
                <div onClick={(e) => { e.stopPropagation(); onDelete(group.id); }}>
                    <Tooltip content="מחיקה">
                        <Button size="icon" variant="ghost">
                            <Trash2 size={18} />
                        </Button>
                    </Tooltip>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-primary-200 mb-2 hover:text-primary-100 transition-colors leading-snug pl-20">
                {group.name}
            </h2>
        </div>
    );
}

export default GroupCard;