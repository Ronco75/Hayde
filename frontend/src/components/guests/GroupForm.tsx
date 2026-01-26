import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
            <div className="space-y-2">
                <Label htmlFor="groupName">שם הקבוצה</Label>
                <Input
                    id="groupName"
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="למשל: משפחה, חברים, עבודה..."
                    required
                    autoFocus
                />
            </div>

            <div className="flex justify-end gap-2">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        ביטול
                    </Button>
                )}
                <Button type="submit" disabled={!groupName.trim()}>
                    שמור
                </Button>
            </div>
        </form>
    );
}

export default GroupForm;