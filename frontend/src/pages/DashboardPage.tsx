import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Wallet,
  CheckCircle,
  Clock,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';

import { guestsApi, expensesApi } from '../services/api';
import { formatNis } from '../utils/format';
import type { GuestStats } from '../types';
import toast from 'react-hot-toast';
import ExpensesPieChart from '../components/dashboard/ExpensesPieChart';

export default function DashboardPage() {
  const [guestStats, setGuestStats] = useState<GuestStats | null>(null);
  const [expenseStats, setExpenseStats] = useState<{ total: number, paid: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [guestRes, expenseRes] = await Promise.all([
          guestsApi.getStats(),
          expensesApi.getTotals() // Assuming this exists or similar
        ]);

        setGuestStats(guestRes.data);

        // Aggregate expense totals
        const total = expenseRes.data.reduce((acc: number, curr: any) => acc + parseFloat(curr.total_cost || 0), 0);
        const paid = expenseRes.data.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount_paid || 0), 0);
        setExpenseStats({ total, paid });

      } catch (error) {
        console.error("Failed to load dashboard data", error);
        toast.error("שגיאה בטעינת נתונים");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);



  if (loading) return <div className="p-8">טוען נתונים...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">לוח בקרה</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Clock className="w-4 h-4 mr-2" />
            עודכן לאחרונה: {new Date().toLocaleDateString('he-IL')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סה"כ מוזמנים</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guestStats?.total_guests || 0}</div>
            <p className="text-xs text-muted-foreground">
              {guestStats?.confirmed_guests || 0} אישרו הגעה
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תקציב כולל</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNis(expenseStats?.total || 0)}</div>
            <p className="text-xs text-muted-foreground">
              מתוכנן
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">שולם בפועל</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNis(expenseStats?.paid || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {expenseStats && expenseStats.total > 0 ? Math.round((expenseStats.paid / expenseStats.total) * 100) : 0}% מהתקציב
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">יתרה לתשלום</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNis((expenseStats?.total || 0) - (expenseStats?.paid || 0))}</div>
            <p className="text-xs text-muted-foreground">
              נותר לשלם לספקים
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart Card */}
        <ExpensesPieChart className="col-span-4" />

        {/* Detailed Stats Card */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>סטטיסטיקת אורחים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">אישרו הגעה</p>
                  <p className="text-sm text-muted-foreground">
                    {guestStats?.confirmed_guests || 0} אורחים
                  </p>
                </div>
                <div className="mr-auto font-medium text-green-600">
                  {guestStats?.total_guests ? Math.round((guestStats.confirmed_guests / guestStats.total_guests) * 100) : 0}%
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">אולי מגיעים</p>
                  <p className="text-sm text-muted-foreground">
                    {guestStats?.pending_guests || 0} אורחים
                  </p>
                </div>
                <div className="mr-auto font-medium text-yellow-600">
                  {guestStats?.total_guests ? Math.round((guestStats.pending_guests / guestStats.total_guests) * 100) : 0}%
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">לא מגיעים</p>
                  <p className="text-sm text-muted-foreground">
                    {guestStats?.declined_guests || 0} אורחים
                  </p>
                </div>
                <div className="mr-auto font-medium text-red-600">
                  {guestStats?.total_guests ? Math.round((guestStats.declined_guests / guestStats.total_guests) * 100) : 0}%
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <Button className="w-full" variant="outline">
                ניהול רשימת מוזמנים
                <ArrowUpRight className="mr-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
