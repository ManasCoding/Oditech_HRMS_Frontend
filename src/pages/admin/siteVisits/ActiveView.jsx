import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { MapPin, Clock } from 'lucide-react';

const ActiveView = () => {
  const [activeVisits, setActiveVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveVisits();
  }, []);

  const fetchActiveVisits = async () => {
    try {
      const res = await api.get('/site-visits/active');
      setActiveVisits(res.data.activeVisits || []);
    } catch (error) {
      console.error('Failed to fetch active visits', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="py-10 text-center">Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {activeVisits.map(visit => {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecord = visit.dailyRecords.find(r => r.date === todayStr);
        const checkInTime = todayRecord?.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString() : 'N/A';

        return (
          <div key={visit._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                  {visit.employeeId?.profilePicture ? (
                    <img src={visit.employeeId.profilePicture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">
                      {visit.employeeId?.firstName?.[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{visit.employeeId?.firstName} {visit.employeeId?.lastName}</h3>
                  <p className="text-xs text-slate-500">{visit.employeeId?.employeeId}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold bg-green-100 text-green-700 rounded-full uppercase tracking-wider">
                ON SITE
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-slate-800">{visit.clientName}</p>
                  <p className="text-slate-500 text-xs">{visit.siteName}</p>
                  {todayRecord?.locationStatus === 'Verified' ? (
                    <p className="text-green-600 text-[10px] font-bold uppercase mt-1">Location Verified</p>
                  ) : (
                    <p className="text-amber-600 text-[10px] font-bold uppercase mt-1">Location Not Verified</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                <Clock size={16} className="text-blue-500 shrink-0" />
                <span>Checked in at <span className="font-semibold text-slate-800">{checkInTime}</span></span>
              </div>
            </div>
          </div>
        );
      })}
      
      {activeVisits.length === 0 && (
        <div className="col-span-full p-10 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500 font-medium">No employees currently checked in at a site.</p>
        </div>
      )}
    </div>
  );
};

export default ActiveView;
