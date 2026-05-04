import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Download, CheckCircle2, User, 
  Briefcase, Calendar, Clock, AlertCircle 
} from 'lucide-react';
import api from '../services/api';

const AdminWeeklyTimesheet = ({ employee, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [weekData, setWeekData] = useState([]);
  const [stats, setStats] = useState({
    totalHours: '45h 30m',
    avgPerDay: '7h 30m',
    overtime: '05h 30m',
    daysSubmitted: '5/7'
  });

  const timeSlots = [
    '09:30 - 10:30',
    '10:30 - 11:30',
    '11:30 - 12:30',
    '12:30 - 1:30',
    '01:30 - 02:30',
    '02:30 - 03:30',
    '03:00 - 04:00',
    '04:00 - 04:50',
    '05:00 - 06:30'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Mock data matching the image for visual excellence
  const mockTasks = {
    '09:30 - 10:30': { Monday: 'Team Meeting', Tuesday: 'Keywords Research', Wednesday: 'Team Meeting', Thursday: 'Project Discussion', Friday: 'Weekly Review', Remarks: 'Discussed new campaign' },
    '10:30 - 11:30': { Monday: 'Project Research', Tuesday: 'Competitor Analysis', Wednesday: 'Social Media Plan', Thursday: 'SEO Optimization', Friday: 'Performance Check', Remarks: 'Analyzed competitors' },
    '11:30 - 12:30': { Monday: 'Client Call', Tuesday: 'Client Call', Wednesday: 'Client Call', Thursday: 'Client Call', Friday: 'Client Call', Remarks: 'Client feedback taken' },
    '12:30 - 1:30': { Monday: 'Lunch Break', Tuesday: 'Lunch Break', Wednesday: 'Lunch Break', Thursday: 'Lunch Break', Friday: 'Lunch Break', Remarks: 'Break time' },
    '01:30 - 02:30': { Monday: 'Content Planning', Tuesday: 'Blog Writing', Wednesday: 'Content Writing', Thursday: 'Content Planning', Friday: 'Content Writing', Remarks: 'Planned next week content' },
    '02:30 - 03:30': { Monday: 'Design Review', Tuesday: 'Graphics Design', Wednesday: 'Design Review', Thursday: 'Graphics Design', Friday: 'Design Review', Remarks: 'Reviewed designs' },
    '03:00 - 04:00': { Monday: 'Ad Campaign Setup', Tuesday: 'Ad Campaign Setup', Wednesday: 'Ad Analysis', Thursday: 'Ad Campaign Setup', Friday: 'Ad Analysis', Remarks: 'Campaign launched' },
    '04:00 - 04:50': { Monday: 'Report Preparation', Tuesday: 'Report Preparation', Wednesday: 'Report Preparation', Thursday: 'Report Preparation', Friday: 'Report Preparation', Remarks: 'Reports for management' },
    '05:00 - 06:30': { Monday: 'Email & Follow-ups', Tuesday: 'Email & Follow-ups', Wednesday: 'Email & Follow-ups', Thursday: 'Email & Follow-ups', Friday: 'Email & Follow-ups', Remarks: 'Replied to client emails' },
  };

  useEffect(() => {
    // In a real app, we would fetch based on employee._id and current week
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-black text-[#1e293b] tracking-tight">Hourly Report - Daily Timesheet</h1>
          <p className="text-xs font-bold text-slate-400 mt-1">View submitted hourly report and download</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft size={16} /> Back to Reports
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#3b82f6] text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-200">
            <Download size={16} /> Download Excel
          </button>
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-white rounded-[24px] border border-slate-100 p-8 shadow-sm grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Employee</p>
          <p className="text-sm font-black text-slate-700">{employee?.fullName} ({employee?.empCode})</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Department</p>
          <p className="text-sm font-black text-slate-700">{employee?.department}</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Date</p>
          <p className="text-sm font-black text-slate-700">16 May 2026</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status</p>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
            Approved
          </span>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Submitted On</p>
          <p className="text-sm font-black text-slate-700">16 May 2026, 07:15 PM</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Approved By</p>
          <p className="text-sm font-black text-slate-700">Admin User</p>
        </div>
      </div>

      {/* The Timesheet Grid */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                {days.map(day => (
                  <th key={day} className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</th>
                ))}
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {timeSlots.map(slot => (
                <tr key={slot} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-[11px] font-black text-slate-700 whitespace-nowrap bg-slate-50/30">{slot}</td>
                  {days.map(day => (
                    <td key={day} className="px-6 py-4">
                      <p className={`text-[11px] font-bold ${mockTasks[slot][day] ? 'text-slate-600' : 'text-slate-300'}`}>
                        {mockTasks[slot][day] || '-'}
                      </p>
                    </td>
                  ))}
                  <td className="px-6 py-4">
                    <p className="text-[11px] font-bold text-slate-500 italic">{mockTasks[slot].Remarks}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-lg font-black text-[#1e293b] mb-8 tracking-tight">Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="bg-emerald-50/50 p-6 rounded-[24px] border border-emerald-50 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100">
                <Briefcase size={22} />
              </div>
              <div>
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Hours (Week)</p>
                <p className="text-xl font-black text-slate-800">{stats.totalHours}</p>
              </div>
            </div>
            <div className="bg-blue-50/50 p-6 rounded-[24px] border border-blue-50 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm border border-blue-100">
                <User size={22} />
              </div>
              <div>
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Average Per Day</p>
                <p className="text-xl font-black text-slate-800">{stats.avgPerDay}</p>
              </div>
            </div>
            <div className="bg-violet-50/50 p-6 rounded-[24px] border border-violet-50 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-violet-500 shadow-sm border border-violet-100">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-[9px] font-black text-violet-600 uppercase tracking-widest mb-1">Overtime</p>
                <p className="text-xl font-black text-slate-800">{stats.overtime}</p>
              </div>
            </div>
            <div className="bg-orange-50/50 p-6 rounded-[24px] border border-orange-50 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm border border-orange-100">
                <Calendar size={22} />
              </div>
              <div>
                <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">Days Submitted</p>
                <p className="text-xl font-black text-slate-800">{stats.daysSubmitted}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-lg font-black text-[#1e293b] mb-8 tracking-tight">Approval Information</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Approved By</p>
                  <p className="text-sm font-black text-slate-700">Admin User</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Approved On</p>
                  <p className="text-sm font-black text-slate-700">16 May 2026, 07:30 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWeeklyTimesheet;
