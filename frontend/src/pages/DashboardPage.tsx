/**
 * DashboardPage - Modern dashboard with animated statistics and charts
 * Displays wedding planning overview with guest stats and expense breakdown
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { guestsApi } from '../services/api';
import type { GuestStats as GuestStatsType } from '../types';
import Loading from '../components/common/Loading';
import Header from '../components/common/Header';
import GuestStatsComponent from '../components/guests/GuestStats';
import QuickSummaryCards from '../components/dashboard/QuickSummaryCards';
import ExpensesPieChart from '../components/dashboard/ExpensesPieChart';
import { slideUp, staggerContainer, staggerItem } from '../utils/motion';
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

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Decorative Background */}
      <div className="fixed inset-0 bg-gradient-mesh opacity-20" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary-900/10 via-background-primary to-background-primary" />

      {/* Content */}
      <div className="relative z-10">
        <Header title="דף בית" />

        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          variants={slideUp}
          initial="hidden"
          animate="visible"
        >
          {/* Quick Summary Cards */}
          <motion.div variants={staggerItem}>
            <QuickSummaryCards />
          </motion.div>

          {/* Main Content Grid */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Expenses Pie Chart */}
            <motion.div variants={staggerItem}>
              <ExpensesPieChart />
            </motion.div>

            {/* Guest Stats */}
            <motion.div
              variants={staggerItem}
              className="w-full"
            >
              <GuestStatsComponent stats={stats} />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default DashboardPage;
