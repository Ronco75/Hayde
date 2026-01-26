/**
 * ExpensesPieChart - Animated pie chart for expense breakdown
 * Displays expense distribution by category with interactive tooltips
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { categoriesApi, expensesApi } from '../../services/api';
import { formatNis } from '../../utils/format';
import { fadeIn, scaleIn } from '../../utils/motion';
import { PieChartIcon } from 'lucide-react';
import Skeleton from '../common/Skeleton';
import EmptyState from '../common/EmptyState';

interface ExpensesPieChartProps {
  className?: string;
}

interface ChartData {
  name: string;
  value: number;
  totalCost: number;
  amountPaid: number;
  remaining: number;
  color: string;
  [key: string]: any;
}

const COLORS = [
  '#A855F7', // purple-500
  '#F59E0B', // gold-500
  '#FB7185', // rose-400
  '#14B8A6', // teal-500
  '#3B82F6', // blue-500
  '#8B5CF6', // violet-500
  '#10B981', // emerald-500
  '#F97316', // orange-500
  '#EC4899', // pink-500
];

function ExpensesPieChart({ className = '' }: ExpensesPieChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesResponse, totalsResponse] = await Promise.all([
        categoriesApi.getAll(),
        expensesApi.getTotals(),
      ]);

      const categories = categoriesResponse.data;
      const totals = totalsResponse.data;

      // Filter categories that have expenses and create chart data
      const data: ChartData[] = totals
        .filter((total) => parseFloat(total.total_cost) > 0)
        .map((total, index) => {
          const category = categories.find((cat) => cat.id === total.category_id);
          return {
            name: category?.name || 'Unknown',
            value: parseFloat(total.total_cost),
            totalCost: parseFloat(total.total_cost),
            amountPaid: parseFloat(total.amount_paid),
            remaining: parseFloat(total.remaining_amount),
            color: COLORS[index % COLORS.length],
          };
        });

      setChartData(data);
    } catch (error) {
      console.error('Error loading expenses data:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div
          className="bg-popover text-popover-foreground border border-border rounded-xl p-4 shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
        >
          <p className="font-semibold mb-3 text-lg">
            {data.name}
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-6">
              <span className="text-muted-foreground">סה"כ עלות:</span>
              <span className="font-semibold font-numeric">
                {formatNis(data.totalCost)}
              </span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-emerald-500">שולם:</span>
              <span className="text-emerald-500 font-semibold font-numeric">
                {formatNis(data.amountPaid)}
              </span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-rose-500">נשאר:</span>
              <span className="text-rose-500 font-semibold font-numeric">
                {formatNis(data.remaining)}
              </span>
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={`bg-card border border-border rounded-xl shadow-sm p-6 ${className}`}>
        <Skeleton variant="card" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <motion.div
        className={`bg-card text-card-foreground border border-border rounded-xl shadow-sm p-6 ${className}`}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <PieChartIcon className="w-6 h-6 text-primary" />
          חלוקת הוצאות לפי קטגוריה
        </h2>
        <EmptyState
          icon={<PieChartIcon className="w-12 h-12" />}
          title="אין הוצאות עדיין"
          description="הוסף הוצאות כדי לראות את החלוקה בגרף"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`bg-card text-card-foreground border border-border rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300 ${className}`}
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <PieChartIcon className="w-6 h-6 text-primary" />
        </motion.div>
        חלוקת הוצאות לפי קטגוריה
      </h2>

      {/* Chart */}
      <motion.div
        className="h-72"
        variants={scaleIn}
        initial="hidden"
        animate="visible"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              label={false}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                  stroke="hsl(var(--card))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Legend */}
      <motion.div
        className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        {chartData.map((item, index) => {
          const total = chartData.reduce((sum, d) => sum + d.value, 0);
          const percent = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
          return (
            <motion.div
              key={index}
              className="flex items-center gap-3 text-sm bg-muted/50 rounded-lg p-2.5 hover:bg-muted transition-colors duration-200"
              whileHover={{ scale: 1.02, x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.2 }}
              />
              <span className="text-muted-foreground flex-1 truncate">{item.name}</span>
              <span className="text-xs text-muted-foreground">{percent}%</span>
              <span className="font-numeric font-semibold">
                {formatNis(item.value)}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

export default ExpensesPieChart;
