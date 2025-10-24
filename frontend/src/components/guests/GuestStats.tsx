import type { GuestStats as GuestStatsType } from '../../types';

interface GuestStatsProps {
  stats: GuestStatsType;
}

function GuestStats({ stats }: GuestStatsProps) {
  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl shadow-elev-2 p-6 mb-8">
      <h2 className="text-xl font-bold text-primary-200 mb-4">סטטיסטיקת מוזמנים</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Guests */}
        <div className="bg-slate-800/70 border border-white/10 rounded-md p-4">
          <div className="text-gray-300 text-sm">סה"כ מוזמנים</div>
          <div className="text-primary-300 font-extrabold text-2xl">{stats.total_guests}</div>
          <div className="text-gray-400 text-xs mt-1">
            {stats.total_attendees} משתתפים
          </div>
        </div>

        {/* Confirmed */}
        <div className="bg-green-500/10 border border-white/10 rounded-md p-4">
          <div className="text-green-400 text-sm">אישרו הגעה</div>
          <div className="text-green-300 font-extrabold text-2xl">{stats.confirmed_guests}</div>
          <div className="text-green-400/70 text-xs mt-1">
            {stats.confirmed_attendees} משתתפים
          </div>
        </div>

        {/* Declined */}
        <div className="bg-red-500/10 border border-white/10 rounded-md p-4">
          <div className="text-red-400 text-sm">לא מגיעים</div>
          <div className="text-red-300 font-extrabold text-2xl">{stats.declined_guests}</div>
        </div>

        {/* Pending */}
        <div className="bg-amber-500/10 border border-white/10 rounded-md p-4">
          <div className="text-amber-400 text-sm">ממתינים לתשובה</div>
          <div className="text-amber-300 font-extrabold text-2xl">{stats.pending_guests}</div>
        </div>
      </div>
    </div>
  );
}

export default GuestStats;
