import { useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  RefreshCw
} from 'lucide-react';
import { useAnalyticsStore } from '../store/analyticsStore';
import { useUsersStore } from '../store/usersStore';
import { useListingsStore } from '../store/listingsStore';

export const Analytics = () => {
  const { 
    loading, 
    refreshStats,
    getSummaryStats,
    getMonthlyRegs,
    getMonthlyListings,
    getCategoryDistribution,
    getStateDistribution
  } = useAnalyticsStore();

  const { subscribeToUsers } = useUsersStore();
  const { subscribeToListings } = useListingsStore();

  // Ensure live subscriptions are active
  useEffect(() => {
    subscribeToUsers();
    subscribeToListings();
  }, [subscribeToUsers, subscribeToListings]);

  const summaryStats = getSummaryStats();
  const monthlyRegs = getMonthlyRegs();
  const monthlyListings = getMonthlyListings();
  const categoryDistribution = getCategoryDistribution();
  const stateDistribution = getStateDistribution();

  const totalListings = categoryDistribution.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 text-left">Analytics & Insights</h2>
          <p className="text-xs text-gray-400 text-left">Real-time marketplace transactions, user registrations, and listings distribution</p>
        </div>
        <button 
          onClick={refreshStats}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Refreshing...' : 'Refresh Stats'}
        </button>
      </div>

      {/* Row 1: KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GMV Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estimated GMV</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-800">---</span>
            </div>
            <p className="text-xs text-gray-400">Gross Merchandise Value listed</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Active Deals Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Deals</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-800">---</span>
            </div>
            <p className="text-xs text-gray-400">Total conversation threads</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <ShoppingCart size={24} />
          </div>
        </div>

        {/* Platform Users Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Users</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-800">{summaryStats.totalUsers}</span>
            </div>
            <p className="text-xs text-gray-400">Registered platform members</p>
          </div>
          <div className="w-12 h-12 bg-gold/10 text-gold rounded-xl flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Row 2: Double Chart Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User registrations area chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800 text-left">Registration Growth</h3>
            <p className="text-xs text-gray-400 text-left">Monthly breakdown of Jewellers, Centres, and Refiners signups</p>
          </div>
          <div className="h-80 w-full">
            {monthlyRegs.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRegs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: '#9CA3AF' }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6' }} />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="jewellers" name="Jewellers" stroke="#D4AF37" fill="#D4AF37" strokeWidth={2.5} fillOpacity={0.15} />
                  <Area type="monotone" dataKey="centres" name="Centres" stroke="#1A1A1A" fill="#1A1A1A" strokeWidth={2} fillOpacity={0.1} />
                  <Area type="monotone" dataKey="refiners" name="Refiners" stroke="#4B5563" fill="#4B5563" strokeWidth={1.5} fillOpacity={0.05} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No registration data yet. Users will appear here as they sign up.
              </div>
            )}
          </div>
        </div>

        {/* Machinery listings bar chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800 text-left">Listings Created vs Sold</h3>
            <p className="text-xs text-gray-400 text-left">Compare freshly listed items against closed deals monthly</p>
          </div>
          <div className="h-80 w-full">
            {monthlyListings.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyListings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: '#9CA3AF' }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6' }} />
                  <Legend iconType="circle" />
                  <Bar dataKey="created" name="Listed Ads" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sold" name="Sold Machines" fill="#1A1A1A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No listing data yet. Listings will appear here as users post them.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3 & 4: Geo-State distribution and Category Pie chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* State wise users & listings */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-3 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800 text-left">Geographical Distribution</h3>
            <p className="text-xs text-gray-400 text-left">Total registered users and active advertisements across Indian states</p>
          </div>
          <div className="h-80 w-full">
            {stateDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={stateDistribution} 
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                  <XAxis type="number" tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: '#9CA3AF' }} />
                  <YAxis dataKey="state" type="category" tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: '#9CA3AF' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6' }} />
                  <Legend iconType="circle" />
                  <Bar dataKey="users" name="Users" fill="#D4AF37" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="listings" name="Active Ads" fill="#1A1A1A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No geographic data yet. Distribution will appear as users register.
              </div>
            )}
          </div>
        </div>

        {/* Category distribution pie chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800 text-left">Category Breakdown</h3>
            <p className="text-xs text-gray-400 text-left">Volume distribution of ads by product type</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center relative">
            {categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center text-gray-400 text-sm">
                No category data yet.
              </div>
            )}

            {/* Total Label overlay inside pie */}
            {categoryDistribution.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-3">
                <span className="text-2xl font-black text-gray-800">{totalListings}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Ads</span>
              </div>
            )}
          </div>

          {/* Legend Grid */}
          {categoryDistribution.length > 0 && (
            <div className="grid grid-cols-2 gap-2 text-xs pt-4 border-t border-gray-50">
              {categoryDistribution.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-gray-600 truncate">{cat.name} ({cat.value})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
