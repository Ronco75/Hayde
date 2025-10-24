import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { categoriesApi, expensesApi } from '../../services/api';
import { formatNis } from '../../utils/format';

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
  '#a855f7', // purple-500
  '#3b82f6', // blue-500
  '#14b8a6', // teal-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#a855f7', // purple-500 (repeat for more categories)
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
        <div className="bg-slate-800 border border-white/20 rounded-lg p-3 shadow-elev-3">
          <p className="text-primary-300 font-semibold mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-300">סה"כ עלות:</span>
              <span className="text-primary-300 font-semibold">{formatNis(data.totalCost)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-green-400">שולם:</span>
              <span className="text-green-300 font-semibold">{formatNis(data.amountPaid)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-rose-400">נשאר:</span>
              <span className="text-rose-300 font-semibold">{formatNis(data.remaining)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={`bg-slate-900 border border-white/10 rounded-xl shadow-elev-2 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-800 rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className={`bg-slate-900 border border-white/10 rounded-xl shadow-elev-2 p-6 ${className}`}>
        <h2 className="text-xl font-bold text-primary-200 mb-4">חלוקת הוצאות לפי קטגוריה</h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-100 mb-2">אין הוצאות עדיין</h3>
          <p className="text-gray-400">הוסף הוצאות כדי לראות את החלוקה</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-900 border border-white/10 rounded-xl shadow-elev-2 p-6 ${className}`}>
      <h2 className="text-xl font-bold text-primary-200 mb-4">חלוקת הוצאות לפי קטגוריה</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-300">{item.name}</span>
            <span className="text-primary-300 font-semibold">{formatNis(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExpensesPieChart;
