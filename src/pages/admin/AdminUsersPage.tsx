import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { GoogleSheetsService, type BaseUser } from '../../services';
import { DataTable } from '../../components/admin/DataTable';
import { RefreshCw, ShieldCheck } from 'lucide-react';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<BaseUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Assuming users data does not contain raw passwords, but we ensure to exclude it if it somehow exists
      const data = await GoogleSheetsService.getUsers();
      // Filter out passwords
      const safeData = data.map(user => {
        const { Password, password, ...safeUser } = user;
        return safeUser;
      });
      setUsers(safeData);
    } catch (err) {
      setError('Failed to fetch user data. Please check connection and sheet permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Attempt to dynamically determine columns from first row, or use defaults
  const columns = React.useMemo(() => {
    if (users.length > 0) {
      return Object.keys(users[0]).map(key => ({
        header: key,
        accessor: key as keyof BaseUser,
      }));
    }
    return [
      { header: 'Name', accessor: 'Name' },
      { header: 'Email', accessor: 'Email' },
      { header: 'Phone', accessor: 'Phone' },
    ];
  }, [users]);

  return (
    <div>
      <Helmet>
        <title>Users | Admin | Kaizen Q</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Directory</h1>
          <p className="text-gray-500 mt-1">Manage registered users across all platforms.</p>
        </div>
        <button 
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-blue-800 text-sm">
        <ShieldCheck className="shrink-0 text-blue-600 mt-0.5" size={18} />
        <p>
          <strong>Security Note:</strong> Passwords are intentionally omitted from this view to maintain security standards. 
          This data is read directly from the Google Sheets connection.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4285F4]"></div>
          <p className="mt-4 text-sm text-gray-500">Loading users...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <DataTable 
          data={users} 
          columns={columns} 
          searchPlaceholder="Search users by name, email, etc..." 
          fileName="kaizen_q_users.csv"
        />
      )}
    </div>
  );
};

export default AdminUsersPage;
