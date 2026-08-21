import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Eye, Check, X } from 'lucide-react';

const RequestsView = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const res = await api.get('/site-visits');
      setVisits(res.data.siteVisits || []);
    } catch (error) {
      toast.error('Failed to fetch visits');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const endpoint = action === 'approve' ? `/site-visits/${id}/approve` : `/site-visits/${id}/reject`;
      const payload = action === 'reject' ? { rejectionReason: 'Admin decision' } : {}; // Could add a modal for reason
      
      const user = JSON.parse(localStorage.getItem('user'));
      payload.adminId = user?.id;

      await api.post(endpoint, payload);
      toast.success(`Visit ${action}d successfully`);
      fetchVisits();
    } catch (error) {
      toast.error(`Failed to ${action} visit`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Approved': return 'bg-blue-100 text-blue-700';
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Completed': return 'bg-purple-100 text-purple-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) return <div className="py-10 text-center">Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Employee</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Client / Site</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Dates</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visits.map(visit => (
              <tr key={visit._id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                      {visit.employeeId?.profilePicture ? (
                        <img src={visit.employeeId.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-xs">
                          {visit.employeeId?.firstName?.[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{visit.employeeId?.firstName} {visit.employeeId?.lastName}</p>
                      <p className="text-xs text-slate-500">{visit.employeeId?.employeeId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-900">{visit.clientName}</p>
                  <p className="text-xs text-slate-500">{visit.siteName}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {visit.startDate} to {visit.endDate}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${getStatusBadge(visit.status)}`}>
                    {visit.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {visit.status === 'Pending' && (
                      <>
                        <button onClick={() => handleAction(visit._id, 'approve')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Approve">
                          <Check size={18} />
                        </button>
                        <button onClick={() => handleAction(visit._id, 'reject')} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Reject">
                          <X size={18} />
                        </button>
                      </>
                    )}
                    {/* Add View details button later */}
                  </div>
                </td>
              </tr>
            ))}
            {visits.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No site visits found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestsView;
