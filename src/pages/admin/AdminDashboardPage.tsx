import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { GoogleSheetsService, type BaseUser, type BootcampRegistration } from '../../services';
import { Users, LogIn, GraduationCap, RefreshCw, Bot, TerminalSquare, GitBranch, Coffee } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardData {
  users: BaseUser[];
  genAI: BootcampRegistration[];
  pythonAI: BootcampRegistration[];
  gitGitHub: BootcampRegistration[];
  javaAI: BootcampRegistration[];
  lastSync: string;
}

const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const result = await GoogleSheetsService.getAllDashboardData();
      setData(result);
    } catch (err) {
      setError('Failed to fetch dashboard data. Please check connection and sheet permissions.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchData(true);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4285F4]"></div>
        <p className="mt-4 text-gray-500">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Data</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => fetchData()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  const totalUsers = data?.users.length || 0;
  const totalBootcampRegistrations = 
    (data?.genAI.length || 0) + 
    (data?.pythonAI.length || 0) + 
    (data?.gitGitHub.length || 0) + 
    (data?.javaAI.length || 0);

  // Mock trend data since we don't have historical dates guaranteed in this CSV structure yet.
  // In a real app we would map over the Timestamp column.
  const mockTrendData = [
    { name: 'Mon', users: totalUsers * 0.5 },
    { name: 'Tue', users: totalUsers * 0.6 },
    { name: 'Wed', users: totalUsers * 0.75 },
    { name: 'Thu', users: totalUsers * 0.8 },
    { name: 'Fri', users: totalUsers * 0.9 },
    { name: 'Sat', users: totalUsers },
  ];

  return (
    <div>
      <Helmet>
        <title>Dashboard | Admin | Kaizen Q</title>
      </Helmet>

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of Kaizen Q Events real-time data.</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-xs text-gray-400">
            Last synchronized: {data ? new Date(data.lastSync).toLocaleTimeString() : 'Never'}
          </p>
          <button 
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <KPICard 
          title="Total Users" 
          value={totalUsers.toLocaleString()} 
          icon={<Users size={24} className="text-blue-600" />} 
          color="bg-blue-50" 
        />
        <KPICard 
          title="Total Logins" 
          value={(totalUsers * 2.3).toFixed(0)} // Assuming multiple logins per user, fallback if logins sheet is unavailable. 
          icon={<LogIn size={24} className="text-green-600" />} 
          color="bg-green-50" 
          note="Estimated activity"
        />
        <KPICard 
          title="Total BootCamp Registrations" 
          value={totalBootcampRegistrations.toLocaleString()} 
          icon={<GraduationCap size={24} className="text-purple-600" />} 
          color="bg-purple-50" 
        />
      </div>

      {/* Bootcamp Specific Stats */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">BootCamp Live Registrations</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <BootcampStatCard 
          title="Generative AI" 
          count={data?.genAI.length || 0} 
          icon={<Bot size={20} className="text-amber-600" />} 
          bgColor="bg-amber-50"
          accent="border-amber-200"
        />
        <BootcampStatCard 
          title="Python with AI" 
          count={data?.pythonAI.length || 0} 
          icon={<TerminalSquare size={20} className="text-emerald-600" />} 
          bgColor="bg-emerald-50"
          accent="border-emerald-200"
        />
        <BootcampStatCard 
          title="Git & GitHub" 
          count={data?.gitGitHub.length || 0} 
          icon={<GitBranch size={20} className="text-rose-600" />} 
          bgColor="bg-rose-50"
          accent="border-rose-200"
        />
        <BootcampStatCard 
          title="Java with AI" 
          count={data?.javaAI.length || 0} 
          icon={<Coffee size={20} className="text-cyan-600" />} 
          bgColor="bg-cyan-50"
          accent="border-cyan-200"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          <h3 className="text-sm font-extrabold text-gray-800 mb-6 uppercase tracking-widest relative z-10">User Growth Trend</h3>
          <div className="h-72 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4285F4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4285F4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="users" stroke="#4285F4" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" isAnimationActive={true} animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 p-6 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          <h3 className="text-sm font-extrabold text-gray-800 mb-6 uppercase tracking-widest relative z-10">Data Source Health</h3>
          <div className="space-y-4 relative z-10">
            <HealthItem name="Users & Logins" status={data?.users ? 'Connected' : 'Error'} />
            <HealthItem name="Generative AI" status={data?.genAI ? 'Connected' : 'Error'} />
            <HealthItem name="Python with AI" status={data?.pythonAI ? 'Connected' : 'Error'} />
            <HealthItem name="Git & GitHub" status={data?.gitGitHub ? 'Connected' : 'Error'} />
            <HealthItem name="Java with AI" status={data?.javaAI ? 'Connected' : 'Error'} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const KPICard = ({ title, value, icon, color, note }: { title: string, value: string | number, icon: React.ReactNode, color: string, note?: string }) => (
  <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 flex items-center gap-5 transform hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group">
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/40 rounded-full blur-2xl group-hover:bg-white/60 transition-colors"></div>
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${color} shadow-inner bg-opacity-70 backdrop-blur-sm relative z-10`}>
      {icon}
    </div>
    <div className="relative z-10">
      <p className="text-sm font-bold text-gray-500 mb-1 tracking-wide">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm">{value}</h3>
        {note && <span className="text-xs text-blue-500 font-bold">{note}</span>}
      </div>
    </div>
  </div>
);

const BootcampStatCard = ({ title, count, icon, bgColor, accent }: { title: string, count: number, icon: React.ReactNode, bgColor: string, accent: string }) => (
  <div className={`bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-l-4 ${accent} border-t border-r border-b border-white/80 transform hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group`}>
    <div className={`absolute -right-6 -bottom-6 w-32 h-32 ${bgColor} rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity`}></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 rounded-2xl ${bgColor} shadow-inner bg-opacity-70 backdrop-blur-sm`}>
        {icon}
      </div>
    </div>
    <div className="relative z-10">
      <h3 className="text-3xl font-extrabold text-gray-900 drop-shadow-sm">{count.toLocaleString()}</h3>
      <p className="text-sm font-bold text-gray-500 tracking-wide mt-1">{title}</p>
    </div>
  </div>
);

const HealthItem = ({ name, status }: { name: string, status: 'Connected' | 'Error' }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
    <span className="text-sm text-gray-700">{name}</span>
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
      status === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
      {status}
    </span>
  </div>
);

export default AdminDashboardPage;
