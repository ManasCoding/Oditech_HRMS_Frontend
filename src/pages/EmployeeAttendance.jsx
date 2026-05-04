import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, CheckCircle2, Clock, CheckSquare } from 'lucide-react';
import EmployeeSchedule from './EmployeeSchedule';

const EmployeeAttendance = () => {
  const { employeeSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const today = new Date().toISOString().split('T')[0];
  
  // If we are on the attendance page, the active tab is 'attendance'
  // If we were using this as a wrapper, we'd check the path
  const isHourly = location.pathname.includes('/schedule');

  if (isHourly) {
    return <EmployeeSchedule />;
  }

  return (
    <DashboardLayout title="Attendance" subtitle="Check in and out for your shift." employeeSlug={employeeSlug}>
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 mb-10 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-fit mx-auto">
           <button 
             onClick={() => navigate(`/employee/${employeeSlug}/attendance`)}
             className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isHourly ? 'bg-[#1e293b] text-white shadow-xl shadow-[#1e293b]/20' : 'text-slate-400 hover:bg-slate-50'}`}
           >
             <CheckSquare size={18} />
             Attendance
           </button>
           <button 
             onClick={() => navigate(`/employee/${employeeSlug}/schedule`)}
             className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isHourly ? 'bg-[#1e293b] text-white shadow-xl shadow-[#1e293b]/20' : 'text-slate-400 hover:bg-slate-50'}`}
           >
             <Clock size={18} />
             Hourly Update
           </button>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 md:p-12 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#1e293b]"></div>
          
          <div className="mb-10">
            <h2 className="text-4xl font-black text-[#1e293b] mb-2">Today's Attendance: {today}</h2>
            <div className="flex items-center gap-2 text-slate-400">
              <Clock size={20} />
              <span className="text-lg font-bold">Check In: <strong className="text-[#1e293b]">14:23</strong></span>
            </div>
            <p className="mt-4 text-emerald-600 font-black flex items-center gap-2 text-sm uppercase tracking-widest">
              <CheckCircle2 size={20} />
              You are currently checked in.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[32px] mb-10 flex items-center gap-4 animate-pulse">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <p className="text-emerald-700 font-black text-xs uppercase tracking-widest">
              Location acquired. You can now check in or out.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <button 
               onClick={() => navigate(`/employee/${employeeSlug}/check-in`)}
               className="flex-1 py-6 bg-[#1e293b] text-white rounded-[32px] font-black text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-[#1e293b]/20"
            >
              Check In Now
            </button>
            <button className="flex-1 py-6 bg-white text-[#1e293b] border-2 border-slate-100 rounded-[32px] font-black text-lg uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">
              Check Out Now
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 transition-all hover:shadow-md">
            <div className="w-16 h-16 bg-slate-50 text-blue-500 rounded-2xl flex items-center justify-center">
              <MapPin size={32} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[2px] mb-1">Office Location</p>
              <h4 className="text-xl font-black text-[#1e293b]">20.2961, 85.8331</h4>
              <p className="text-xs font-bold text-slate-400">Within 50m radius</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 transition-all hover:shadow-md">
            <div className="w-16 h-16 bg-slate-50 text-emerald-500 rounded-2xl flex items-center justify-center">
              <Clock size={32} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[2px] mb-1">Work Hours</p>
              <h4 className="text-xl font-black text-[#1e293b]">0.0 hrs</h4>
              <p className="text-xs font-bold text-slate-400">Expected: 9.0 hrs</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeAttendance;
