import type { Group } from '../../types';
import GroupCard from './GroupCard';
import Button from '../common/Button';

interface GroupListProps {
    groups: Group[];
    onEdit: (group: Group) => void;
    onDelete: (groupId: number) => void;
    onAdd: () => void;
}

function GroupList({ groups, onEdit, onDelete, onAdd }: GroupListProps) {
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-6 md:gap-5">
                    {groups.map((group) => (
                        <GroupCard key={group.id} group={group} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default GroupList;