import type { Expense } from '../../types';

interface ExpenseCardProps {
  expense: Expense;
}

function ExpenseCard({ expense }: ExpenseCardProps) {
  return (
    <div className="
      bg-white
      rounded-xl
      shadow-lg
      hover:shadow-2xl
      p-6
      transition-all
      duration-300
      ease-in-out
      transform
      hover:scale-102
      border-2
      border-transparent
      hover:border-purple-200
    ">
      <h3 className="text-2xl font-bold text-purple-900 mb-5 pb-3 border-b-2 border-purple-100">
        {expense.name}
      </h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center py-1">
          <span className="text-gray-600 font-medium text-sm">מחיר ליחידה:</span>
          <span className="font-semibold text-gray-800 text-base">₪{expense.price_per_unit}</span>
        </div>

        <div className="flex justify-between items-center py-1">
          <span className="text-gray-600 font-medium text-sm">כמות:</span>
          <span className="font-semibold text-gray-800 text-base">{expense.quantity}</span>
        </div>

        <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-purple-100">
          <span className="text-purple-900 font-bold text-base">סה"כ עלות:</span>
          <span className="font-bold text-purple-700 text-lg">₪{expense.total_cost}</span>
        </div>

        <div className="flex justify-between items-center py-1 bg-green-50 px-3 py-2 rounded-lg -mx-1">
          <span className="text-green-700 font-semibold text-sm">שולם:</span>
          <span className="font-bold text-green-600 text-base">₪{expense.amount_paid}</span>
        </div>

        <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-red-100 bg-red-50 px-3 py-2 rounded-lg -mx-1">
          <span className="text-red-700 font-bold text-base">נשאר לתשלום:</span>
          <span className="font-bold text-red-600 text-lg">₪{expense.remaining_amount}</span>
        </div>
      </div>
    </div>
  );
}

export default ExpenseCard;