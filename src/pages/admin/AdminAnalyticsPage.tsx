import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { GoogleSheetsService } from '../../services';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#FBBC05', '#34A853', '#EA4335', '#4285F4']; // Google Colors (Yellow, Green, Red, Blue)

const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await GoogleSheetsService.getAllDashboardData();
      
      const bootcampData = [
        { name: 'Generative AI', value: result.genAI.length },
        { name: 'Python with AI', value: result.pythonAI.length },
        { name: 'Git & GitHub', value: result.gitGitHub.length },
        { name: 'Java with AI', value: result.javaAI.length },
      ];

      setData({
        bootcampDist: bootcampData,
        // In a real scenario, we would parse dates from the CSV to build a daily trend chart.
        // We'll map the total to a generic distribution for now.
        totalUsers: result.users.length
      });
    } catch (err) {
      setError('Failed to fetch analytics data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div>
      <Helmet>
        <title>Analytics | Admin | Kaizen Q</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Deep dive into registration metrics and trends.</p>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4285F4]"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center text-red-600">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 p-6 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            <h3 className="text-lg font-extrabold text-gray-800 mb-6 flex items-center gap-2 relative z-10 drop-shadow-sm">
              <TrendingUp size={20} className="text-blue-500" />
              Bootcamp Distribution
            </h3>
            <div className="h-80 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.bootcampDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={85}
                    outerRadius={120}
                    paddingAngle={6}
                    dataKey="value"
                    isAnimationActive={true}
                    animationDuration={1500}
                    stroke="none"
                  >
                    {data.bootcampDist.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 p-6 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            <h3 className="text-lg font-extrabold text-gray-800 mb-6 relative z-10 drop-shadow-sm">Registrations by BootCamp</h3>
            <div className="h-80 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.bootcampDist} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(241, 245, 249, 0.4)'}}
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 8, 8]} isAnimationActive={true} animationDuration={1500}>
                    {data.bootcampDist.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;
