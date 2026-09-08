import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Database, User, Settings as SettingsIcon } from 'lucide-react';

const AdminSettingsPage: React.FC = () => {
  const { adminName, logout } = useAdminAuth();

  return (
    <div className="max-w-4xl">
      <Helmet>
        <title>Settings | Admin | Kaizen Q</title>
      </Helmet>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage admin account and dashboard configurations.</p>
      </div>

      <div className="space-y-6">
        {/* Admin Account Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <User size={18} className="text-gray-500" />
            <h2 className="font-semibold text-gray-900">Admin Account</h2>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input 
                type="text" 
                disabled 
                value={adminName} 
                className="w-full max-w-md bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Username cannot be changed in this frontend demo.</p>
            </div>
            
            <button 
              onClick={logout}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </section>

        {/* Dashboard Settings Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <SettingsIcon size={18} className="text-gray-500" />
            <h2 className="font-semibold text-gray-900">Dashboard Preferences</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900 text-sm">Auto-Refresh Dashboard</p>
                <p className="text-xs text-gray-500">Automatically fetch new data every 60 seconds</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" name="toggle" id="toggle" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-blue-500"/>
                <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-blue-500 cursor-pointer"></label>
              </div>
            </div>
          </div>
        </section>

        {/* Data Sources Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <Database size={18} className="text-gray-500" />
            <h2 className="font-semibold text-gray-900">Data Sources (Google Sheets CSV)</h2>
          </div>
          <div className="p-0">
            <ul className="divide-y divide-gray-100">
              {['Users & Logins', 'Generative AI BootCamp', 'Python with AI BootCamp', 'Git & GitHub BootCamp', 'Java with AI BootCamp'].map((sheet, index) => (
                <li key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <span className="text-sm font-medium text-gray-700">{sheet}</span>
                  <span className="text-xs font-mono text-green-600 bg-green-50 px-2 py-1 rounded">Connected</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <style>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #3b82f6;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #3b82f6;
        }
        .toggle-checkbox {
          right: 0;
          z-index: 1;
          border-color: #e5e7eb;
          transition: all 0.3s;
        }
        .toggle-label {
          background-color: #e5e7eb;
          transition: all 0.3s;
        }
      `}</style>
    </div>
  );
};

export default AdminSettingsPage;
