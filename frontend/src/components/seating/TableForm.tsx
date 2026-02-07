import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TableFormProps {
  onSubmit: (data: { count: number; capacity: 12 | 24 }) => Promise<void>;
  onCancel: () => void;
  currentTableCount: number;
}

export function TableForm({ onSubmit, onCancel, currentTableCount }: TableFormProps) {
  const [count, setCount] = useState(1);
  const [capacity, setCapacity] = useState<12 | 24>(12);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (count < 1 || count > 50) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ count, capacity });
    } catch {
      // Error handled by API interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview of table names that will be created
  const previewNames = Array.from(
    { length: Math.min(count, 5) },
    (_, i) => `${currentTableCount + i + 1}`
  );
  const hasMore = count > 5;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="count">מספר שולחנות להוספה</Label>
        <Input
          id="count"
          type="number"
          min={1}
          max={50}
          value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
          className="text-right"
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          שולחנות: {previewNames.join(', ')}{hasMore ? ` ...ועוד ${count - 5}` : ''}
        </p>
      </div>

      <div className="space-y-2">
        <Label>קיבולת לכל שולחן</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={capacity === 12 ? 'default' : 'outline'}
            className={`flex-1 ${capacity === 12 ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
            onClick={() => setCapacity(12)}
          >
            12 מושבים
          </Button>
          <Button
            type="button"
            variant={capacity === 24 ? 'default' : 'outline'}
            className={`flex-1 ${capacity === 24 ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
            onClick={() => setCapacity(24)}
          >
            24 מושבים
          </Button>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? 'שומר...' : count === 1 ? 'הוסף שולחן' : `הוסף ${count} שולחנות`}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          ביטול
        </Button>
      </div>
    </form>
  );
}
