import { useNavigate } from 'react-router-dom';
import type { Category, CategoryTotals } from '../../types';
import { Pencil, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import Tooltip from '../common/Tooltip';
import { formatNis } from '../../utils/format';

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
            className="
                bg-slate-900
                text-gray-100
                rounded-lg sm:rounded-md
                shadow-elev-2
                hover:shadow-elev-3
                p-6 sm:p-4
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
                    <Tooltip content="עריכה">
                        <Button size="icon" variant="ghost">
                            <Pencil size={18} />
                        </Button>
                    </Tooltip>
                </div>
                <div onClick={(e) => { e.stopPropagation(); onDelete(category.id); }}>
                    <Tooltip content="מחיקה">
                        <Button size="icon" variant="ghost">
                            <Trash2 size={18} />
                        </Button>
                    </Tooltip>
                </div>
            </div>
            <h2 className="text-2xl sm:text-xl md:text-lg font-bold text-primary-200 mb-2 group-hover:text-primary-100 transition-colors leading-snug pl-20">
                {category.name}
            </h2>
            {totals && (
                <div className="mt-3 space-y-1.5 sm:space-y-1 bg-slate-800/70 border border-white/10 rounded-md p-3 sm:p-2.5">
                    <div className="flex justify-between text-sm sm:text-xs">
                        <span className="text-gray-300 font-medium">סה"כ עלות:</span>
                        <span className="text-primary-300 font-semibold sm:font-bold">{formatNis(totals.total_cost)}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-xs">
                        <span className="text-green-400 font-medium">שולם:</span>
                        <span className="text-green-400 font-semibold sm:font-bold">{formatNis(totals.amount_paid)}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-xs">
                        <span className="text-rose-400 font-medium">נשאר:</span>
                        <span className="text-rose-400 font-semibold sm:font-bold">{formatNis(totals.remaining_amount)}</span>
                    </div>
                </div>
            )}
            <button
                type="button"
                onClick={() => navigate(`/categories/${category.id}/expenses`)}
                className="text-gray-400 text-sm sm:text-xs font-medium transition-colors mt-2 hover:text-primary-200 cursor-pointer"
            >
                לצפייה בהוצאות ←
            </button>
        </div>
    );
}

export default CategoryCard;