import React, { useEffect, useState } from 'react';
import EmployeeLayout from '../layouts/EmployeeLayout';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Plus, MapPin, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const EmployeeSiteVisits = () => {
  const { employeeSlug } = useParams();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVisit, setActiveVisit] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const res = await api.get(`/site-visits/employee/${user.id}`);
      const data = res.data.siteVisits || [];
      setVisits(data);
      
      const active = data.find(v => v.status === 'Active' || v.status === 'Approved');
      setActiveVisit(active);
    } catch (error) {
      console.error('Error fetching site visits', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInOut = async (action) => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const payload = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'GPS Location', // Consider reverse geocoding here
            workSummary: action === 'out' ? 'Completed day work' : ''
          };
          
          const endpoint = action === 'in' ? `/site-visits/${activeVisit._id}/check-in` : `/site-visits/${activeVisit._id}/check-out`;
          await api.post(endpoint, payload);
          toast.success(`Successfully checked ${action}`);
          fetchVisits();
        } catch (error) {
          toast.error(error.response?.data?.message || `Failed to check ${action}`);
        }
      },
      (err) => {
        toast.error('Unable to retrieve your location');
      }
    );
  };

  return (
    <EmployeeLayout title="Site Visits" subtitle="Manage your field work">
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">My Site Visits</h2>
          <Link 
            to={`/employee/${employeeSlug}/site-visits/request`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            New Request
          </Link>
        </div>

        {activeVisit && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <MapPin size={100} />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 text-[10px] font-bold bg-blue-500/20 text-blue-300 rounded-full uppercase tracking-wider">
                    {activeVisit.status}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-1">{activeVisit.clientName}</h3>
                <p className="text-slate-300 text-sm mb-4">{activeVisit.siteName}</p>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5"><Clock size={16} /> {activeVisit.expectedDailyHours}h / day limit</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 min-w-[200px]">
                {activeVisit.status === 'Approved' || (activeVisit.status === 'Active' && !activeVisit.dailyRecords.find(r => r.date === new Date().toISOString().split('T')[0])?.checkIn) ? (
                  <button 
                    onClick={() => handleCheckInOut('in')}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-green-500/20 flex justify-center items-center gap-2"
                  >
                    CHECK IN
                  </button>
                ) : null}
                
                {activeVisit.status === 'Active' && activeVisit.dailyRecords.find(r => r.date === new Date().toISOString().split('T')[0])?.checkIn && !activeVisit.dailyRecords.find(r => r.date === new Date().toISOString().split('T')[0])?.checkOut ? (
                  <button 
                    onClick={() => handleCheckInOut('out')}
                    className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-500/20 flex justify-center items-center gap-2"
                  >
                    CHECK OUT
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">History</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {visits.map(visit => (
              <div key={visit._id} className="p-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h4 className="font-semibold text-slate-800">{visit.clientName}</h4>
                  <p className="text-sm text-slate-500">{visit.siteName} • {visit.startDate} to {visit.endDate}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full
                  ${visit.status === 'Completed' ? 'bg-purple-100 text-purple-700' : ''}
                  ${visit.status === 'Pending' ? 'bg-amber-100 text-amber-700' : ''}
                  ${visit.status === 'Rejected' ? 'bg-red-100 text-red-700' : ''}
                  ${visit.status === 'Approved' || visit.status === 'Active' ? 'bg-green-100 text-green-700' : ''}
                `}>
                  {visit.status}
                </span>
              </div>
            ))}
            {visits.length === 0 && !loading && (
              <div className="p-8 text-center text-slate-500">
                You have no site visit requests.
              </div>
            )}
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeSiteVisits;
