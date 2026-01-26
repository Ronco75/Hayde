import type { GuestStats as GuestStatsType } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';

interface GuestStatsProps {
  stats: GuestStatsType;
}

function GuestStats({ stats }: GuestStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Guests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">סה"כ מוזמנים</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_attendees}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total_guests} רשומות
          </p>
        </CardContent>
      </Card>

      {/* Confirmed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">אישרו הגעה</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.confirmed_attendees}</div>
          <p className="text-xs text-muted-foreground">
            {stats.confirmed_guests} רשומות
          </p>
        </CardContent>
      </Card>

      {/* Pending */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ממתינים לתשובה</CardTitle>
          <Clock className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-500">{stats.pending_guests}</div>
          <p className="text-xs text-muted-foreground">
            {stats.pending_guests} רשומות
          </p>
        </CardContent>
      </Card>

      {/* Declined */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">לא מגיעים</CardTitle>
          <XCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{stats.declined_guests}</div>
          <p className="text-xs text-muted-foreground">
            {stats.declined_guests} רשומות
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default GuestStats;
