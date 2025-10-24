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
        <div className="bg-slate-800/70 border border-white/10 rounded-lg p-5 flex flex-col justify-between min-h-[120px] hover:bg-slate-800 transition-colors">
          <div className="text-gray-400 text-sm font-medium mb-2">סה"כ מוזמנים</div>
          <div className="flex flex-col">
            <div className="text-primary-300 font-extrabold text-3xl mb-1">{stats.total_attendees}</div>
            <div className="text-gray-500 text-xs">
              {stats.total_guests} רשומות
            </div>
          </div>
        </div>

        {/* Confirmed */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-5 flex flex-col justify-between min-h-[120px] hover:bg-green-500/15 transition-colors">
          <div className="text-green-400 text-sm font-medium mb-2">אישרו הגעה</div>
          <div className="flex flex-col">
            <div className="text-green-300 font-extrabold text-3xl mb-1">{stats.confirmed_attendees}</div>
            <div className="text-green-400/60 text-xs">
              {stats.confirmed_guests} רשומות
            </div>
          </div>
        </div>

        {/* Declined */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-5 flex flex-col justify-between min-h-[120px] hover:bg-red-500/15 transition-colors">
          <div className="text-red-400 text-sm font-medium mb-2">לא מגיעים</div>
          <div className="flex flex-col">
            <div className="text-red-300 font-extrabold text-3xl mb-1">{stats.declined_guests}</div>
            <div className="text-red-400/60 text-xs">
              {stats.declined_guests} {stats.declined_guests === 1 ? 'רשומה' : 'רשומות'}
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-5 flex flex-col justify-between min-h-[120px] hover:bg-amber-500/15 transition-colors">
          <div className="text-amber-400 text-sm font-medium mb-2">ממתינים לתשובה</div>
          <div className="flex flex-col">
            <div className="text-amber-300 font-extrabold text-3xl mb-1">{stats.pending_guests}</div>
            <div className="text-amber-400/60 text-xs">
              {stats.pending_guests} {stats.pending_guests === 1 ? 'רשומה' : 'רשומות'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuestStats;
