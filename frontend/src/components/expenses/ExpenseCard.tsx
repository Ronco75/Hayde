import { Pencil, Trash2 } from 'lucide-react';
import type { Expense } from '../../types';
import Button from '../common/Button';

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
      rounded-xl
      shadow-elev-2
      hover:shadow-elev-3
      p-6
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
        <Button size="icon" variant="ghost" onClick={() => onEdit(expense)}>
          <Pencil size={18} />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onDelete(expense.id)}>
          <Trash2 size={18} />
        </Button>
      </div>

      <h3 className="text-2xl font-bold text-primary-200 mb-5 pb-3 border-b border-white/10 pr-20">
        {expense.name}
      </h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center py-1">
          <span className="text-gray-300 font-medium text-sm">מחיר ליחידה:</span>
          <span className="font-semibold text-gray-100 text-base">₪{expense.price_per_unit}</span>
        </div>

        <div className="flex justify-between items-center py-1">
          <span className="text-gray-300 font-medium text-sm">כמות:</span>
          <span className="font-semibold text-gray-100 text-base">{expense.quantity}</span>
        </div>

        <div className="flex justify-between items-center pt-3 mt-2 border-t border-white/10">
          <span className="text-primary-200 font-bold text-base">סה"כ עלות:</span>
          <span className="font-bold text-primary-300 text-lg">₪{expense.total_cost}</span>
        </div>

        <div className="flex justify-between items-center bg-green-500/10 px-3 py-2 rounded-lg -mx-1">
          <span className="text-green-400 font-semibold text-sm">שולם:</span>
          <span className="font-bold text-green-300 text-base">₪{expense.amount_paid}</span>
        </div>

        <div className="flex justify-between items-center border-t bg-rose-500/10 border-white/10 px-3 py-2 rounded-lg -mx-1 mt-2">
          <span className="text-rose-400 font-bold text-base">נשאר לתשלום:</span>
          <span className="font-bold text-rose-300 text-lg">₪{expense.remaining_amount}</span>
        </div>
      </div>
    </div>
  );
}

export default ExpenseCard;