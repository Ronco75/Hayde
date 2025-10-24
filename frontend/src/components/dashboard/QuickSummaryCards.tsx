import { useEffect, useState } from 'react';
import { guestsApi, expensesApi } from '../../services/api';
import type { GuestStats, CategoryTotals } from '../../types';
import { formatNis } from '../../utils/format';

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
      <div className={`bg-slate-900 border border-white/10 rounded-xl shadow-elev-2 p-6 mb-8 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-800 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-800/70 border border-white/10 rounded-md p-4">
                <div className="h-4 bg-slate-700 rounded mb-2"></div>
                <div className="h-6 bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: 'סה"כ תקציב',
      value: formatNis(summaryData.totalBudget || 0),
      subtitle: 'כל ההוצאות',
      bgColor: 'bg-slate-800/70',
      textColor: 'text-primary-300',
      borderColor: 'border-white/10',
    },
    {
      title: 'שולם',
      value: formatNis(summaryData.totalPaid || 0),
      subtitle: `${summaryData.totalBudget > 0 ? ((summaryData.totalPaid / summaryData.totalBudget) * 100).toFixed(0) : '0'}% מהתקציב`,
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-300',
      borderColor: 'border-green-500/20',
    },
    {
      title: 'נשאר לתשלום',
      value: formatNis(summaryData.remainingBudget || 0),
      subtitle: (summaryData.remainingBudget || 0) > 0 ? 'נשאר לתשלום' : 'שולם במלואו',
      bgColor: (summaryData.remainingBudget || 0) > 0 ? 'bg-rose-500/10' : 'bg-green-500/10',
      textColor: (summaryData.remainingBudget || 0) > 0 ? 'text-rose-300' : 'text-green-300',
      borderColor: (summaryData.remainingBudget || 0) > 0 ? 'border-rose-500/20' : 'border-green-500/20',
    },
    {
      title: 'סה"כ מוזמנים',
      value: (summaryData.totalGuests || 0).toString(),
      subtitle: `${summaryData.confirmedAttendees || 0} אישרו הגעה`,
      bgColor: 'bg-slate-800/70',
      textColor: 'text-primary-300',
      borderColor: 'border-white/10',
    },
    {
      title: 'משתתפים מאושרים',
      value: (summaryData.confirmedAttendees || 0).toString(),
      subtitle: `${summaryData.totalGuests > 0 ? ((summaryData.confirmedAttendees / summaryData.totalGuests) * 100).toFixed(0) : '0'}% מהמוזמנים`,
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-300',
      borderColor: 'border-green-500/20',
    },
    {
      title: 'תקציב למשתתף',
      value: formatNis(summaryData.budgetPerGuest || 0),
      subtitle: 'עלות ממוצעת',
      bgColor: 'bg-slate-800/70',
      textColor: 'text-primary-300',
      borderColor: 'border-white/10',
    },
  ];

  return (
    <div className={`bg-slate-900 border border-white/10 rounded-xl shadow-elev-2 p-6 mb-8 ${className}`}>
      <h2 className="text-xl font-bold text-primary-200 mb-4">סיכום מהיר</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} border ${card.borderColor} rounded-md p-4 transition-all duration-200 hover:shadow-elev-3`}
          >
            <div className="text-gray-300 text-sm mb-1">{card.title}</div>
            <div className={`${card.textColor} font-extrabold text-2xl mb-1`}>
              {card.value}
            </div>
            <div className="text-gray-400 text-xs">{card.subtitle}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuickSummaryCards;
