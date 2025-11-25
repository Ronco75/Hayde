/**
 * ExpenseCard - Animated expense card component
 * Displays expense details with action buttons
 */

import { motion } from 'framer-motion';
import { Pencil, Trash2, DollarSign } from 'lucide-react';
import type { Expense } from '../../types';
import { formatNis } from '../../utils/format';
import { cardHover } from '../../utils/motion';

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: number) => void;
}

function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  const paymentPercentage =
    expense.total_cost && parseFloat(expense.total_cost) > 0
      ? ((parseFloat(expense.amount_paid) / parseFloat(expense.total_cost)) * 100).toFixed(0)
      : '0';

  return (
    <motion.div
      className="
        bg-surface-primary
        border border-border-subtle
        rounded-2xl
        shadow-lg
        hover:shadow-2xl
        p-6
        transition-all
        duration-300
        group
        relative
        overflow-hidden
      "
      variants={cardHover}
      whileHover="hover"
    >
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 pb-4 border-b border-border-subtle">
          <div className="flex items-start gap-3 flex-1">
            <motion.div
              className="w-10 h-10 bg-gold-500/10 rounded-lg flex items-center justify-center flex-shrink-0"
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <DollarSign className="w-5 h-5 text-gold-400" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-display font-bold text-gray-50 truncate group-hover:text-gold-300 transition-colors">
                {expense.name}
              </h3>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            <motion.button
              onClick={() => onEdit(expense)}
              className="p-2 rounded-lg text-gray-400 hover:text-primary-300 hover:bg-surface-secondary transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="עריכה"
            >
              <Pencil className="w-4 h-4" />
            </motion.button>

            <motion.button
              onClick={() => onDelete(expense.id)}
              className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="מחיקה"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">מחיר ליחידה</span>
            <span className="text-gray-200 font-semibold">{formatNis(expense.price_per_unit)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">כמות</span>
            <span className="text-gray-200 font-semibold">{expense.quantity}</span>
          </div>

          <div className="flex justify-between p-3 bg-primary-500/5 border border-primary-500/10 rounded-lg">
            <span className="text-primary-400 font-medium">סה"כ עלות</span>
            <span className="text-primary-400 font-display font-bold text-lg">
              {formatNis(expense.total_cost ?? 0)}
            </span>
          </div>

          <div className="flex justify-between p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
            <span className="text-emerald-400 font-medium">שולם</span>
            <span className="text-emerald-400 font-display font-semibold">
              {formatNis(expense.amount_paid)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">התקדמות תשלום</span>
              <span className="text-emerald-400 font-semibold">{paymentPercentage}%</span>
            </div>
            <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                initial={{ width: 0 }}
                animate={{ width: `${paymentPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          <div className="flex justify-between p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg">
            <span className="text-rose-400 font-medium">נשאר לתשלום</span>
            <span className="text-rose-400 font-display font-bold">
              {formatNis(expense.remaining_amount ?? 0)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ExpenseCard;
