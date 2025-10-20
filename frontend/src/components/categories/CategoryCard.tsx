import { useNavigate } from 'react-router-dom';
import type { Category, CategoryTotals } from '../../types';
import { Pencil, Trash2 } from 'lucide-react';
import Button from '../common/Button';

interface CategoryCardProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (categoryId: number) => void;
    totals?: CategoryTotals;
}

function CategoryCard({ category, onEdit, onDelete, totals }: CategoryCardProps) {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(`/categories/${category.id}/expenses`)}
            className="
                bg-slate-900
                text-gray-100
                rounded-xl
                shadow-elev-2
                hover:shadow-elev-3
                p-8
                cursor-pointer
                transition-all
                duration-300
                ease-in-out
                transform
                hover:scale-102
                border
                border-white/10
                group
                relative
            "
        >
            {/* Action buttons */}
            <div className="absolute top-4 left-4 flex gap-2">
                <div onClick={(e) => { e.stopPropagation(); onEdit(category); }}>
                    <Button size="icon" variant="ghost">
                        <Pencil size={18} />
                    </Button>
                </div>
                <div onClick={(e) => { e.stopPropagation(); onDelete(category.id); }}>
                    <Button size="icon" variant="ghost">
                        <Trash2 size={18} />
                    </Button>
                </div>
            </div>
            <h2 className="text-2xl font-bold text-primary-200 mb-2 group-hover:text-primary-100 transition-colors">
                {category.name}
            </h2>
            {totals && (
                <div className="mt-3 space-y-1 bg-slate-800/70 border border-white/10 rounded-lg p-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-300 font-medium">סה"כ עלות:</span>
                        <span className="text-primary-300 font-bold">₪{totals.total_cost}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-green-400 font-medium">שולם:</span>
                        <span className="text-green-400 font-bold">₪{totals.amount_paid}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-rose-400 font-medium">נשאר:</span>
                        <span className="text-rose-400 font-bold">₪{totals.remaining_amount}</span>
                    </div>
                </div>
            )}
            <p className="text-gray-400 text-sm font-medium group-hover:text-gray-300 transition-colors mt-2">
                 לצפייה בהוצאות ←
            </p>
        </div>
    );
}

export default CategoryCard;