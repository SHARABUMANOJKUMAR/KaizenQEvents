import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { type BootcampRegistration } from '../../services';
import { DataTable } from '../../components/admin/DataTable';
import { RefreshCw, Users, Clock, CheckCircle } from 'lucide-react';

interface AdminBootcampPageProps {
  title: string;
  fetchData: () => Promise<BootcampRegistration[]>;
  fileName: string;
}

export const AdminBootcampPage: React.FC<AdminBootcampPageProps> = ({ title, fetchData, fileName }) => {
  const [registrations, setRegistrations] = useState<BootcampRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchData();
      setRegistrations(data);
    } catch (err) {
      setError(`Failed to fetch ${title} data. Please check connection and sheet permissions.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [fetchData]);

  const columns = React.useMemo(() => {
    if (registrations.length > 0) {
      return Object.keys(registrations[0]).map(key => ({
        header: key,
        accessor: key as keyof BootcampRegistration,
      }));
    }
    return [
      { header: 'Name', accessor: 'Name' },
      { header: 'Email', accessor: 'Email' },
      { header: 'Timestamp', accessor: 'Timestamp' },
    ];
  }, [registrations]);

  // Derived stats
  const uniqueStudents = new Set(registrations.map(r => r.Email || r.Phone || '').filter(Boolean)).size;
  const latestRegistration = registrations.length > 0 
    ? (registrations[registrations.length - 1].Timestamp || 'N/A') 
    : 'N/A';

  return (
    <div>
      <Helmet>
        <title>{title} | Admin | Kaizen Q</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 mt-1">Manage registrations and student data.</p>
        </div>
        <button 
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {/* Mini KPIs */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-blue-50">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-0.5">Total Registrations</p>
              <h3 className="text-2xl font-bold text-gray-900">{registrations.length}</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-purple-50">
              <CheckCircle size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-0.5">Unique Students</p>
              <h3 className="text-2xl font-bold text-gray-900">{uniqueStudents}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-emerald-50">
              <Clock size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-0.5">Latest Registration</p>
              <h3 className="text-lg font-bold text-gray-900 truncate max-w-[150px]" title={latestRegistration}>
                {latestRegistration}
              </h3>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4285F4]"></div>
          <p className="mt-4 text-sm text-gray-500">Loading registrations...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <DataTable 
          data={registrations} 
          columns={columns} 
          searchPlaceholder={`Search ${title} registrations...`} 
          fileName={fileName}
        />
      )}
    </div>
  );
};
