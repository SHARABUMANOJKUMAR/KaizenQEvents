import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { GoogleSheetsService, type LoginActivity } from '../../services';
import { DataTable } from '../../components/admin/DataTable';
import { RefreshCw, Filter } from 'lucide-react';

const AdminLoginsPage: React.FC = () => {
  const [logins, setLogins] = useState<LoginActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'All' | 'Today' | 'Yesterday' | 'Last 7 Days' | 'Last 30 Days'>('All');

  const fetchLogins = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Re-use users endpoint, or if we had a dedicated logins sheet, we'd use that. 
      // The prompt says "Users & Logins" sheet, so it might be the same sheet, or we derive it.
      const data = await GoogleSheetsService.getLogins();
      setLogins(data);
    } catch (err) {
      setError('Failed to fetch login activity data. Please check connection and sheet permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogins();
  }, []);

  const columns = React.useMemo(() => {
    if (logins.length > 0) {
      return Object.keys(logins[0])
        .filter(key => key.toLowerCase() !== 'password') // Ensure no password leakage
        .map(key => ({
          header: key,
          accessor: key as keyof LoginActivity,
        }));
    }
    return [
      { header: 'Email', accessor: 'Email' },
      { header: 'Last Login', accessor: 'Last Login' },
      { header: 'Status', accessor: 'Status' },
    ];
  }, [logins]);

  return (
    <div>
      <Helmet>
        <title>Login Activity | Admin | Kaizen Q</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Login Activity</h1>
          <p className="text-gray-500 mt-1">Monitor user access and authentication events.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="pl-9 pr-8 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>

          <button 
            onClick={fetchLogins}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4285F4]"></div>
          <p className="mt-4 text-sm text-gray-500">Loading activity...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <DataTable 
          data={logins} 
          columns={columns} 
          searchPlaceholder="Search by email, IP, status..." 
          fileName="login_activity.csv"
        />
      )}
    </div>
  );
};

export default AdminLoginsPage;
