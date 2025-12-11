/**
 * CategoryCard - Animated category card with hover effects
 * Displays category information with totals and action buttons
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Category, CategoryTotals } from '../../types';
import { Pencil, Trash2, ArrowLeft, FolderOpen } from 'lucide-react';
import { formatNis } from '../../utils/format';
import { cardHover } from '../../utils/motion';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number) => void;
  totals?: CategoryTotals;
}

function CategoryCard({ category, onEdit, onDelete, totals }: CategoryCardProps) {
  const navigate = useNavigate();

  const hasTotals = totals && parseFloat(totals.total_cost) > 0;

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
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header with Actions */}
        <div className="flex items-start justify-between mb-4">
          {/* Category Icon and Name */}
          <div className="flex items-start gap-3 flex-1">
            <motion.div
              className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center flex-shrink-0"
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <FolderOpen className="w-6 h-6 text-primary-400" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-display font-bold text-gray-50 mb-1 truncate group-hover:text-primary-300 transition-colors">
                {category.name}
              </h3>
              {hasTotals && (
                <p className="text-xs text-gray-500 font-numeric">
                  {totals.expense_count || 0} הוצאות
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(category);
              }}
              className="
                p-2
                rounded-lg
                text-gray-400
                hover:text-primary-300
                hover:bg-surface-secondary
                transition-colors
                duration-200
              "
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="עריכה"
            >
              <Pencil className="w-4 h-4" />
            </motion.button>

            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(category.id);
              }}
              className="
                p-2
                rounded-lg
                text-gray-400
                hover:text-rose-400
                hover:bg-rose-500/10
                transition-colors
                duration-200
              "
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="מחיקה"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Totals */}
        {hasTotals ? (
          <motion.div
            className="space-y-3 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Total Cost */}
            <div className="flex items-center justify-between p-3 bg-primary-500/5 border border-primary-500/10 rounded-lg">
              <span className="text-sm text-gray-400 font-medium">סה"כ עלות</span>
              <span className="text-primary-400 font-numeric font-semibold text-lg">
                {formatNis(totals.total_cost)}
              </span>
            </div>

            {/* Amount Paid */}
            <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
              <span className="text-sm text-emerald-400 font-medium">שולם</span>
              <span className="text-emerald-400 font-numeric font-semibold text-lg">
                {formatNis(totals.amount_paid)}
              </span>
            </div>

            {/* Remaining */}
            <div className="flex items-center justify-between p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg">
              <span className="text-sm text-rose-400 font-medium">נשאר</span>
              <span className="text-rose-400 font-numeric font-semibold text-lg">
                {formatNis(totals.remaining_amount)}
              </span>
            </div>
          </motion.div>
        ) : (
          <div className="mb-4 p-4 bg-surface-secondary/50 rounded-lg text-center">
            <p className="text-gray-500 text-sm">אין הוצאות עדיין</p>
          </div>
        )}

        {/* View Expenses Link */}
        <motion.button
          onClick={() => navigate(`/categories/${category.id}/expenses`)}
          className="
            w-full
            flex items-center justify-center gap-2
            px-4 py-3
            bg-surface-secondary
            hover:bg-surface-elevated
            border border-border-subtle
            hover:border-primary-500/30
            rounded-lg
            text-gray-300
            hover:text-primary-300
            text-sm
            font-medium
            transition-all
            duration-200
            group/link
          "
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>לצפייה בהוצאות</span>
          <motion.div
            animate={{ x: [0, -4, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.div>
        </motion.button>
      </div>
    </motion.div>
  );
}

export default CategoryCard;
