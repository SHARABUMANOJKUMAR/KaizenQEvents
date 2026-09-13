import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { type BootcampRegistration } from '../../services';
import { DataTable } from '../../components/admin/DataTable';
import { RefreshCw, Users, Clock, CheckCircle, Eye, Edit, Mail, X, Trash2 } from 'lucide-react';

interface AdminBootcampPageProps {
  title: string;
  fetchData: () => Promise<BootcampRegistration[]>;
  fileName: string;
}

export const AdminBootcampPage: React.FC<AdminBootcampPageProps> = ({ title, fetchData, fileName }) => {
  const [registrations, setRegistrations] = useState<BootcampRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [viewModal, setViewModal] = useState<BootcampRegistration | null>(null);
  const [editModal, setEditModal] = useState<BootcampRegistration | null>(null);
  const [emailModal, setEmailModal] = useState<BootcampRegistration | null>(null);

  // Email form state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

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

  const handleDelete = (row: BootcampRegistration) => {
    if (window.confirm('Are you sure you want to remove this registration? (This only removes it from the current view)')) {
      setRegistrations(prev => prev.filter(reg => !(reg.Email === row.Email && reg.Timestamp === row.Timestamp)));
    }
  };

  const columns = React.useMemo(() => {
    let cols: any[] = [];
    if (registrations.length > 0) {
      cols = Object.keys(registrations[0]).map(key => ({
        header: key,
        accessor: key as keyof BootcampRegistration,
      }));
    } else {
      cols = [
        { header: 'Name', accessor: 'Name' },
        { header: 'Email', accessor: 'Email' },
        { header: 'Timestamp', accessor: 'Timestamp' },
      ];
    }
    
    cols.push({
      header: 'Actions',
      accessor: (row: BootcampRegistration) => (
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setViewModal(row)}
            className="text-gray-500 hover:text-blue-600 transition-colors"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          <button 
            onClick={() => setEditModal(row)}
            className="text-gray-500 hover:text-green-600 transition-colors"
            title="Edit Registration"
          >
            <Edit size={18} />
          </button>
          <button 
            onClick={() => {
              setEmailModal(row);
              setEmailSubject(`Regarding ${title}`);
              setEmailMessage(`Hi ${row.Name || row['Full Name'] || row['Full Name '] || 'Student'},\n\n`);
            }}
            className="text-gray-500 hover:text-purple-600 transition-colors"
            title="Send Email"
          >
            <Mail size={18} />
          </button>
          <button 
            onClick={() => handleDelete(row)}
            className="text-gray-500 hover:text-red-600 transition-colors"
            title="Delete Registration"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    });

    return cols;
  }, [registrations, title]);

  // Derived stats
  const uniqueStudents = new Set(registrations.map(r => r.Email || r['Email Address'] || r.Phone || '').filter(Boolean)).size;
  const latestRegistration = registrations.length > 0 
    ? (registrations[registrations.length - 1].Timestamp || 'N/A') 
    : 'N/A';

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editModal) {
      // Local update only since there's no backend
      const updatedRegs = registrations.map(reg => 
        (reg.Email === editModal.Email && reg.Timestamp === editModal.Timestamp) ? editModal : reg
      );
      setRegistrations(updatedRegs);
      setEditModal(null);
    }
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailModal) {
      const email = emailModal.Email || emailModal['Email Address'] || '';
      const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailMessage)}`;
      window.location.href = mailtoUrl;
      setEmailModal(null);
    }
  };

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

      {/* View Modal */}
      {viewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 flex justify-between items-center border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Registration Details</h3>
              <button onClick={() => setViewModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3">
              {Object.entries(viewModal).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{key}</p>
                  <p className="text-sm text-gray-900 break-words">{String(value) || '-'}</p>
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-gray-100 bg-gray-50">
              <button onClick={() => setViewModal(null)} className="w-full py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 flex justify-between items-center border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edit Registration</h3>
                <p className="text-xs text-yellow-600 mt-1">Changes are saved locally until refresh.</p>
              </div>
              <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                {Object.entries(editModal).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">{key}</label>
                    <input 
                      type="text" 
                      value={String(value || '')} 
                      onChange={(e) => setEditModal({ ...editModal, [key]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
              <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button type="button" onClick={() => setEditModal(null)} className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-[#4285F4] text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col">
            <div className="p-5 flex justify-between items-center border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Mail size={18} className="text-purple-600"/> Compose Email</h3>
              <button onClick={() => setEmailModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSendEmail} className="flex flex-col">
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">To</label>
                  <input 
                    type="email" 
                    readOnly
                    value={emailModal.Email || emailModal['Email Address'] || ''} 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Subject</label>
                  <input 
                    type="text" 
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Message</label>
                  <textarea 
                    required
                    rows={6}
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  ></textarea>
                </div>
              </div>
              <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button type="button" onClick={() => setEmailModal(null)} className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                  Send Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
