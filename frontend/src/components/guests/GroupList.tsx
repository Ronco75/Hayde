import type { Group, Guest } from '../../types';
import GroupCard from './GroupCard';
import Button from '../common/Button';

interface GroupListProps {
    groups: Group[];
    guests?: Guest[];
    onEdit: (group: Group) => void;
    onDelete: (groupId: number) => void;
    onAdd: () => void;
}

function GroupList({ groups, guests = [], onEdit, onDelete, onAdd }: GroupListProps) {
    // Calculate guest count per group
    const getGuestCount = (groupId: number) => {
        return guests.filter(guest => guest.group_id === groupId).length;
    };
    return (
        <div>
            {/* Add new group button */}
            <div className="flex justify-end mb-6">
                <Button type="button" variant="primary" onClick={onAdd}>
                    + הוספת קבוצה
                </Button>
            </div>

            {/* Group list or empty state */}
            {groups.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-12 text-center">
                <div className="text-6xl sm:text-5xl mb-4">👥</div>
                <h2 className="text-2xl sm:text-xl font-bold text-white mb-2 leading-tight">
                    אין קבוצות עדיין
                </h2>
                <p className="text-purple-100 text-lg sm:text-base">
                    התחל על ידי הוספת הקבוצה הראשונה שלך למעלה!
                </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {groups.map((group) => (
                        <GroupCard
                            key={group.id}
                            group={group}
                            guestCount={getGuestCount(group.id)}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default GroupList;