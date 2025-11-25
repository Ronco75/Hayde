/**
 * QuickSummaryCards - Animated statistics cards with hover effects
 * Displays budget, expenses, and guest statistics with staggered animations
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { guestsApi, expensesApi } from '../../services/api';
import type { GuestStats, CategoryTotals } from '../../types';
import { formatNis } from '../../utils/format';
import { staggerContainer, staggerItem, scaleIn } from '../../utils/motion';
import {
  DollarSign,
  CheckCircle,
  AlertCircle,
  Users,
  UserCheck,
  TrendingUp,
  Wallet,
  CreditCard
} from 'lucide-react';
import Skeleton from '../common/Skeleton';

interface QuickSummaryCardsProps {
  className?: string;
}

interface SummaryData {
  totalBudget: number;
  totalPaid: number;
  remainingBudget: number;
  totalGuests: number;
  confirmedAttendees: number;
  budgetPerGuest: number;
}

interface StatCard {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  variant: 'purple' | 'emerald' | 'rose' | 'gold' | 'blue';
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

function QuickSummaryCards({ className = '' }: QuickSummaryCardsProps) {
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalBudget: 0,
    totalPaid: 0,
    remainingBudget: 0,
    totalGuests: 0,
    confirmedAttendees: 0,
    budgetPerGuest: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [guestsResponse, expensesResponse] = await Promise.all([
        guestsApi.getStats(),
        expensesApi.getTotals(),
      ]);

      const guestStats: GuestStats = guestsResponse.data;
      const expensesTotals: CategoryTotals[] = expensesResponse.data;

      // Calculate budget totals
      const totalBudget = expensesTotals.reduce((sum, total) => sum + parseFloat(total.total_cost), 0);
      const totalPaid = expensesTotals.reduce((sum, total) => sum + parseFloat(total.amount_paid), 0);
      const remainingBudget = totalBudget - totalPaid;

      // Calculate budget per guest (only if there are confirmed attendees)
      const budgetPerGuest = guestStats.confirmed_attendees > 0
        ? totalBudget / guestStats.confirmed_attendees
        : 0;

      setSummaryData({
        totalBudget,
        totalPaid,
        remainingBudget,
        totalGuests: guestStats.total_attendees,
        confirmedAttendees: guestStats.confirmed_attendees,
        budgetPerGuest,
      });
    } catch (error) {
      console.error('Error loading summary data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`mb-8 ${className}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    );
  }

  const paidPercentage = summaryData.totalBudget > 0
    ? ((summaryData.totalPaid / summaryData.totalBudget) * 100).toFixed(0)
    : '0';

  const confirmedPercentage = summaryData.totalGuests > 0
    ? ((summaryData.confirmedAttendees / summaryData.totalGuests) * 100).toFixed(0)
    : '0';

  const cards: StatCard[] = [
    {
      title: 'סה"כ תקציב',
      value: formatNis(summaryData.totalBudget || 0),
      subtitle: 'כל ההוצאות',
      icon: Wallet,
      variant: 'purple',
    },
    {
      title: 'שולם',
      value: formatNis(summaryData.totalPaid || 0),
      subtitle: `${paidPercentage}% מהתקציב`,
      icon: CheckCircle,
      variant: 'emerald',
      trend: {
        value: paidPercentage + '%',
        isPositive: true,
      },
    },
    {
      title: 'נשאר לתשלום',
      value: formatNis(summaryData.remainingBudget || 0),
      subtitle: (summaryData.remainingBudget || 0) > 0 ? 'נשאר לתשלום' : 'שולם במלואו',
      icon: (summaryData.remainingBudget || 0) > 0 ? AlertCircle : CheckCircle,
      variant: (summaryData.remainingBudget || 0) > 0 ? 'rose' : 'emerald',
    },
    {
      title: 'סה"כ מוזמנים',
      value: (summaryData.totalGuests || 0).toString(),
      subtitle: `${summaryData.confirmedAttendees || 0} אישרו הגעה`,
      icon: Users,
      variant: 'blue',
    },
    {
      title: 'משתתפים מאושרים',
      value: (summaryData.confirmedAttendees || 0).toString(),
      subtitle: `${confirmedPercentage}% מהמוזמנים`,
      icon: UserCheck,
      variant: 'emerald',
      trend: {
        value: confirmedPercentage + '%',
        isPositive: true,
      },
    },
    {
      title: 'תקציב למשתתף',
      value: formatNis(summaryData.budgetPerGuest || 0),
      subtitle: 'עלות ממוצעת',
      icon: TrendingUp,
      variant: 'gold',
    },
  ];

  const getVariantClasses = (variant: StatCard['variant']) => {
    const variants = {
      purple: {
        bg: 'bg-primary-500/10',
        border: 'border-primary-500/20',
        text: 'text-primary-400',
        iconBg: 'bg-primary-500/20',
        hoverBorder: 'hover:border-primary-500/40',
      },
      emerald: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        text: 'text-emerald-400',
        iconBg: 'bg-emerald-500/20',
        hoverBorder: 'hover:border-emerald-500/40',
      },
      rose: {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        text: 'text-rose-400',
        iconBg: 'bg-rose-500/20',
        hoverBorder: 'hover:border-rose-500/40',
      },
      gold: {
        bg: 'bg-gold-500/10',
        border: 'border-gold-500/20',
        text: 'text-gold-400',
        iconBg: 'bg-gold-500/20',
        hoverBorder: 'hover:border-gold-500/40',
      },
      blue: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
        iconBg: 'bg-blue-500/20',
        hoverBorder: 'hover:border-blue-500/40',
      },
    };
    return variants[variant];
  };

  return (
    <div className={`mb-8 ${className}`}>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {cards.map((card, index) => {
          const Icon = card.icon;
          const variantClasses = getVariantClasses(card.variant);

          return (
            <motion.div
              key={index}
              variants={staggerItem}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ duration: 0.2 }}
              className={`
                ${variantClasses.bg}
                ${variantClasses.border}
                ${variantClasses.hoverBorder}
                bg-surface-primary/50
                backdrop-blur-sm
                border
                rounded-xl
                p-5
                shadow-lg
                hover:shadow-xl
                transition-all
                duration-200
                cursor-default
              `}
            >
              {/* Header with Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm font-medium mb-1">
                    {card.title}
                  </p>
                  <motion.h3
                    className={`${variantClasses.text} font-display font-bold text-2xl sm:text-3xl`}
                    variants={scaleIn}
                  >
                    {card.value}
                  </motion.h3>
                </div>

                {/* Icon */}
                <motion.div
                  className={`${variantClasses.iconBg} rounded-lg p-2.5`}
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className={`w-5 h-5 ${variantClasses.text}`} />
                </motion.div>
              </div>

              {/* Footer with Subtitle and Optional Trend */}
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-xs">
                  {card.subtitle}
                </p>

                {card.trend && (
                  <div className={`flex items-center gap-1 ${variantClasses.text} text-xs font-semibold`}>
                    <TrendingUp className="w-3 h-3" />
                    {card.trend.value}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export default QuickSummaryCards;
