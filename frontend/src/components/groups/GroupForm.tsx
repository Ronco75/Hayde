import { useState } from 'react';
import Button from '../common/Button';

interface GroupFormProps {
    onSubmit: (name: string) => void;
    initialValue?: string;
    onCancel?: () => void;
}

function GroupForm({ onSubmit, initialValue = '', onCancel }: GroupFormProps) {
    const [groupName, setGroupName] = useState(initialValue);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!groupName.trim()) return;
        onSubmit(groupName);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                    שם הקבוצה
                </label>
                <input 
                    type="text" 
                    value={groupName} 
                    onChange={(e) => setGroupName(e.target.value)} 
                    placeholder="למשל: משפחה, חברים, עבודה..." 
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

            <div className="flex justify-end gap-3">
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

export default GroupForm;