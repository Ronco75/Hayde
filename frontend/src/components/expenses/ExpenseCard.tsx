import { Pencil, Trash2 } from 'lucide-react';
import type { Expense } from '../../types';
import Button from '../common/Button';
import Tooltip from '../common/Tooltip';
import { formatNis } from '../../utils/format';

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: number) => void;
}

function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  return (
    <div className="
      bg-slate-900
      text-gray-100
      rounded-lg sm:rounded-md
      shadow-elev-2
      hover:shadow-elev-3
      p-5 sm:p-4
      transition-all
      duration-300
      ease-in-out
      transform
      hover:scale-102
      border
      border-white/10
      relative
    ">
      
      {/* Action buttons */}
      <div className="absolute top-4 left-4 flex gap-2">
        <Tooltip content="עריכה">
          <Button size="icon" variant="ghost" onClick={() => onEdit(expense)}>
            <Pencil size={18} />
          </Button>
        </Tooltip>
        <Tooltip content="מחיקה">
          <Button size="icon" variant="ghost" onClick={() => onDelete(expense.id)}>
            <Trash2 size={18} />
          </Button>
        </Tooltip>
      </div>

      <h3 className="text-2xl sm:text-xl md:text-lg font-bold text-primary-200 mb-4 sm:mb-3 pb-2 border-b border-white/10 pl-20 leading-snug">
        {expense.name}
      </h3>

      <div className="space-y-2.5 sm:space-y-2">
        <div className="flex justify-between items-center py-1">
          <span className="text-gray-300 font-medium text-sm sm:text-xs">מחיר ליחידה:</span>
          <span className="font-semibold text-gray-100 text-base sm:text-sm">{formatNis(expense.price_per_unit)}</span>
        </div>

        <div className="flex justify-between items-center py-1">
          <span className="text-gray-300 font-medium text-sm sm:text-xs">כמות:</span>
          <span className="font-semibold text-gray-100 text-base sm:text-sm">{expense.quantity}</span>
        </div>

        <div className="flex justify-between items-center pt-3 mt-2 border-t border-white/10">
          <span className="text-primary-200 font-bold text-base sm:text-sm">סה"כ עלות:</span>
          <span className="font-bold text-primary-300 text-lg sm:text-base">{formatNis(expense.total_cost)}</span>
        </div>

        <div className="flex justify-between items-center bg-green-500/10 px-3 py-2 rounded-md -mx-1">
          <span className="text-green-400 font-semibold text-sm sm:text-xs">שולם:</span>
          <span className="font-bold text-green-300 text-base sm:text-sm">{formatNis(expense.amount_paid)}</span>
        </div>

        <div className="flex justify-between items-center border-t bg-rose-500/10 border-white/10 px-3 py-2 rounded-md -mx-1 mt-2">
          <span className="text-rose-400 font-bold text-base sm:text-sm">נשאר לתשלום:</span>
          <span className="font-bold text-rose-300 text-lg sm:text-base">{formatNis(expense.remaining_amount)}</span>
        </div>
      </div>
    </div>
  );
}

export default ExpenseCard;