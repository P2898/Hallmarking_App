
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  List, 
  ArrowUpRight,
  AlertTriangle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { useUsersStore } from '../store/usersStore';
import { useListingsStore } from '../store/listingsStore';
import { useAnalyticsStore } from '../store/analyticsStore';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { users, subscribeToUsers } = useUsersStore();
  const { listings, subscribeToListings } = useListingsStore();
  const { getMonthlyRegs, getMonthlyListings, refreshStats, getSummaryStats } = useAnalyticsStore();

  const monthlyRegs = getMonthlyRegs();
  const monthlyListings = getMonthlyListings();
  const summaryStats = getSummaryStats();

  // Subscribe to live Firestore streams and fetch stats on mount
  useEffect(() => {
    subscribeToUsers();
    subscribeToListings();
    refreshStats();
  }, [subscribeToUsers, subscribeToListings, refreshStats]);

  // Use the accurate stats directly from the backend rather than computing locally
  const totalUsers = summaryStats.totalUsers || users.length;
  const activeListings = summaryStats.activeListings || listings.filter(l => l.status === 'active').length;
  const pendingReports = summaryStats.pendingListings || 0;


  return (
    <div className="p-6 space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Users */}
        <div 
          onClick={() => navigate('/users')}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300 group cursor-pointer"
        >
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-500">Total Users</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-800">{totalUsers}</span>
            </div>
            <p className="text-xs text-gray-400">Active jewellers, centres, refiners</p>
          </div>
          <div className="w-12 h-12 bg-gold/10 text-gold rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Users size={24} />
          </div>
        </div>

        {/* Active Listings */}
        <div 
          onClick={() => navigate('/listings')}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300 group cursor-pointer"
        >
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-500">Active Listings</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-800">{activeListings}</span>
            </div>
            <p className="text-xs text-gray-400">Live machinery listings</p>
          </div>
          <div className="w-12 h-12 bg-dark/10 text-dark rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <List size={24} />
          </div>
        </div>

        {/* Pending Reports */}
        <div 
          onClick={() => navigate('/reports')}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300 group cursor-pointer"
        >
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-500">Pending Reports</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-800">{pendingReports}</span>
            </div>
            <p className="text-xs text-gray-400">Listings awaiting review</p>
          </div>
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <AlertTriangle size={24} />
          </div>
        </div>

      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registration Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-800">User Registrations</h3>
              <p className="text-xs text-gray-400">Monthly growth of jewellers, centres, and refiners</p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">H1 2026</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRegs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorJewellers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCentres" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: '12px', fill: '#9CA3AF' }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: '12px', fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6' }} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="jewellers" name="Jewellers" stroke="#D4AF37" strokeWidth={2.5} fillOpacity={1} fill="url(#colorJewellers)" />
                <Area type="monotone" dataKey="centres" name="Centres" stroke="#1A1A1A" strokeWidth={2} fillOpacity={1} fill="url(#colorCentres)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Listings Created vs Sold Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Listings Performance</h3>
              <p className="text-xs text-gray-400">Monthly newly listed vs successfully sold machinery</p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">H1 2026</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyListings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: '12px', fill: '#9CA3AF' }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: '12px', fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6' }} />
                <Legend iconType="circle" />
                <Bar dataKey="created" name="Listed Machinery" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sold" name="Sold Machinery" fill="#1A1A1A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recently Joined Users */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-800">New Signups</h3>
              <p className="text-xs text-gray-400">Recently registered platform users</p>
            </div>
            <ArrowUpRight className="text-gray-400 hover:text-gray-600 cursor-pointer" size={20} />
          </div>

          <div className="space-y-4">
            {users.slice(0, 5).map(user => (
              <div key={user.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center font-bold text-sm">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{user.role} • {user.city}</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                  active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
