import { useEffect, useState } from 'react';
import { guestsApi } from '../services/api';
import type { GuestStats as GuestStatsType } from '../types';
import Loading from '../components/common/Loading';
import Header from '../components/common/Header';
import GuestStatsComponent from '../components/guests/GuestStats';
import QuickSummaryCards from '../components/dashboard/QuickSummaryCards';
import ExpensesPieChart from '../components/dashboard/ExpensesPieChart';
import toast from 'react-hot-toast';

function DashboardPage() {
  const [stats, setStats] = useState<GuestStatsType>({
    total_guests: 0,
    total_attendees: 0,
    confirmed_guests: 0,
    confirmed_attendees: 0,
    declined_guests: 0,
    pending_guests: 0,
    invitations_sent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const statsResponse = await guestsApi.getStats();
      setStats(statsResponse.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      toast.error('שגיאה בטעינת הדף, אנא נסה שנית.');
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <div className="min-h-screen bg-slate-950 p-6 sm:p-7">
      <div className="max-w-6xl mx-auto">
        <Header title="דף בית" />
        
        {/* Quick Summary Cards */}
        <QuickSummaryCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-6">
          {/* Expenses Pie Chart */}
          <ExpensesPieChart />
          
          {/* Guest Stats */}
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-elev-2 p-6">
            <GuestStatsComponent stats={stats} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
