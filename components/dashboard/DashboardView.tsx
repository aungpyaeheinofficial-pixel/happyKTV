
import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Music, DollarSign, Clock, Bell, Calendar } from 'lucide-react';
import { formatCurrency, formatTime, getSessionDuration, calculateBill, getDateRange } from '../../utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Room } from '../../types';

export const DashboardView = () => {
  const { rooms, sessionHistory, t, language } = useApp();
  const [filterType, setFilterType] = useState<'today' | 'yesterday' | 'thisWeek' | 'thisMonth'>('today');
  
  // Custom date state (if needed in future, currently using presets)
  // const [customRange, setCustomRange] = useState({ start: null, end: null });

  // Filter logic
  const filteredHistory = useMemo(() => {
    const { startDate, endDate } = getDateRange(filterType);
    
    return sessionHistory.filter(session => {
       // Check if session start time falls within range
       return session.startTime >= startDate && session.startTime <= endDate;
    });
  }, [sessionHistory, filterType]);

  const stats = useMemo(() => {
    // Current Active Stats (Only count if they started within range? Usually Dashboard shows LIVE + Historic. 
    // Let's assume Live is always relevant, but Historic depends on filter.
    // Or strictly filter everything by date. If 'Yesterday', active rooms don't matter unless they started yesterday.)
    
    // For simplicity and typical POS behavior:
    // If filter is Today, show Current Active + Completed Today.
    // If filter is Yesterday, show Completed Yesterday (Active usually implies Today unless long session).
    
    const { startDate, endDate } = getDateRange(filterType);

    let activeRevenue = 0;
    let activeSessionsInRange = 0;
    
    // Check active rooms that started in the filter range
    rooms.forEach(room => {
      if (room.status === 'occupied' && room.session && room.session.startTime >= startDate && room.session.startTime <= endDate) {
        activeSessionsInRange++;
        const bill = calculateBill(room.session, room);
        activeRevenue += bill.totalAmount;
      }
    });

    let historicalRevenue = 0;
    let totalGuests = 0;
    let totalDurationMs = 0;
    let serviceCalls = 0;

    filteredHistory.forEach(s => {
       historicalRevenue += (s.totalBill || 0);
       totalGuests += s.guestCount;
       totalDurationMs += (s.endTime || Date.now()) - s.startTime - (s.totalPausedDuration || 0);
       serviceCalls += s.serviceCallCount;
    });

    const totalRevenue = activeRevenue + historicalRevenue;
    const totalCount = filteredHistory.length + activeSessionsInRange;
    
    const avgDuration = totalCount > 0 
        ? totalDurationMs / totalCount 
        : 0;

    return { 
      activeCount: rooms.filter(r => r.status === 'occupied').length, // Absolute current active
      relevantActiveCount: activeSessionsInRange, // Active sessions belonging to filter
      totalGuests, 
      totalRevenue, 
      avgDuration, 
      serviceCalls: serviceCalls + rooms.reduce((acc, r) => acc + (r.session?.serviceCallCount || 0), 0)
    };
  }, [rooms, filteredHistory, filterType]);

  const chartData = useMemo(() => {
     // Generate hourly distribution based on filtered history
     const distribution = new Array(24).fill(0);
     filteredHistory.forEach(s => {
        const hour = new Date(s.startTime).getHours();
        distribution[hour] += (s.totalBill || 0);
     });
     
     return distribution.map((val, idx) => ({
        name: idx === 0 ? '12AM' : idx === 12 ? '12PM' : idx > 12 ? `${idx-12}PM` : `${idx}AM`,
        sales: val
     })).filter((_, idx) => idx % 3 === 0); // Sample every 3 hours for cleaner chart
  }, [filteredHistory]);

  const StatCard = ({ title, value, icon: Icon, color, subValue }: any) => (
    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-600 transition-all duration-300">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-${color}-500/20`} />
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-100">{value}</h3>
          {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 bg-${color}-500/20 rounded-xl text-${color}-400`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t.dashboard}</h1>
          <p className="text-slate-400">
             {filterType === 'today' && "Today's Performance"}
             {filterType === 'yesterday' && "Yesterday's Performance"}
             {filterType === 'thisWeek' && "This Week's Performance"}
             {filterType === 'thisMonth' && "This Month's Performance"}
          </p>
        </div>
        
        <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700 overflow-x-auto max-w-full">
           {(['today', 'yesterday', 'thisWeek', 'thisMonth'] as const).map(range => (
              <button
                key={range}
                onClick={() => setFilterType(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  filterType === range 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
                } capitalize`}
              >
                {range.replace(/([A-Z])/g, ' $1').trim()}
              </button>
           ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t.activeRooms} 
          value={`${stats.activeCount} / ${rooms.length}`} 
          icon={Music} 
          color="purple" 
        />
        <StatCard 
          title={t.revenue} 
          value={formatCurrency(stats.totalRevenue, language)} 
          icon={DollarSign} 
          color="emerald"
          subValue={filteredHistory.length + " completed sessions"}
        />
         <StatCard 
          title={t.avgDuration} 
          value={formatTime(stats.avgDuration)} 
          icon={Clock} 
          color="amber" 
        />
        <StatCard 
          title={t.serviceCalls} 
          value={stats.serviceCalls} 
          icon={Bell} 
          color="red" 
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Sessions List (Only showing currently active, regardless of filter, as per standard POS dashboard utility) */}
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-white">{t.activeRooms}</h3>
             <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30">
                Live Updates
             </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
                  <th className="pb-4 font-medium pl-4">Room</th>
                  <th className="pb-4 font-medium">{t.guests}</th>
                  <th className="pb-4 font-medium">{t.waiter}</th>
                  <th className="pb-4 font-medium">{t.duration}</th>
                  <th className="pb-4 font-medium text-right pr-4">{t.total}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {rooms.filter(r => r.status === 'occupied' && r.session).map(room => (
                  <ActiveSessionRow key={room.id} room={room} />
                ))}
                {rooms.filter(r => r.status === 'occupied').length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 flex flex-col items-center justify-center w-full">
                      <Music size={32} className="mb-3 opacity-20" />
                      No active sessions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mini Chart */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Revenue Trend ({filterType})</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                  cursor={{ fill: '#334155', opacity: 0.2 }}
                />
                <Bar dataKey="sales" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActiveSessionRow: React.FC<{ room: Room }> = ({ room }) => {
  const { language } = useApp();
  const [now, setNow] = React.useState(Date.now());
  
  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  if (!room.session) return null;

  const bill = calculateBill(room.session, room);
  const duration = getSessionDuration(room.session);

  return (
    <tr className="hover:bg-slate-700/30 transition-colors group">
      <td className="py-4 pl-4">
         <div className="flex flex-col">
            <span className="font-bold text-white">{language === 'en' ? room.name.en : room.name.mm}</span>
            <span className="text-xs text-slate-500">{room.type}</span>
         </div>
      </td>
      <td className="py-4 text-slate-300">{room.session.guestCount}</td>
      <td className="py-4 text-slate-400 text-sm">
        {room.session.assignedWaiter || '-'}
      </td>
      <td className="py-4">
         <div className={`font-mono text-sm ${room.session.isPaused ? 'text-amber-400' : 'text-purple-400'}`}>
            {formatTime(duration)}
            {room.session.isPaused && <span className="text-[10px] ml-1 border border-amber-500/30 px-1 rounded">PAUSE</span>}
         </div>
      </td>
      <td className="py-4 pr-4 text-right">
         <span className="font-mono font-medium text-emerald-400">
            {formatCurrency(bill.totalAmount, language)}
         </span>
      </td>
    </tr>
  );
};
