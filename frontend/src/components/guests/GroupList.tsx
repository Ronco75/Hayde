import type { Group, Guest } from '../../types';
import GroupCard from './GroupCard';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';

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
        <div className="space-y-6">
            {/* Add new group button */}
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                    סה"כ {groups.length} קבוצות
                </p>
                <Button onClick={onAdd} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    הוספת קבוצה
                </Button>
            </div>

            {/* Group list or empty state */}
            {groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-accent/50">
                    <div className="bg-background p-4 rounded-full mb-4">
                        <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-semibold mb-1">
                        אין קבוצות עדיין
                    </h2>
                    <p className="text-muted-foreground mb-4 max-w-xs">
                        חלק את המוזמנים שלך לקבוצות כדי לנהל אותם בצורה נוחה יותר.
                    </p>
                    <Button onClick={onAdd} variant="outline">
                        צור קבוצה ראשונה
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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