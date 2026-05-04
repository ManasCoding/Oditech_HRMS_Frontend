import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Send, Calendar, Download, FileSpreadsheet, 
  Trash2, Plus, CheckCircle2, AlertCircle, Loader2,
  ChevronLeft, ChevronRight, Eraser, Printer, CheckSquare, Clock
} from 'lucide-react';
import api from '../services/api';

const EmployeeSchedule = ({ embedded = false, onBack }) => {
  const { employeeSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [weekTasks, setWeekTasks] = useState({});
  const [dailyRemarks, setDailyRemarks] = useState({});
  const [weekRemarks, setWeekRemarks] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  
  const user = JSON.parse(localStorage.getItem('user'));

  const timeSlots = [
    '09:30 - 10:30',
    '10:30 - 11:30',
    '11:30 - 12:30',
    '12:30 - 01:30',
    '01:30 - 02:30',
    '02:30 - 03:30',
    '03:00 - 04:00',
    '04:00 - 04:50',
    '05:00 - 06:30'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    calculateWeekDates(selectedDate);
  }, [selectedDate]);

  const calculateWeekDates = (date) => {
    const curr = new Date(date);
    const day = curr.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(curr.setDate(diff));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday);
      nextDate.setDate(monday.getDate() + i);
      dates.push(nextDate.toISOString().split('T')[0]);
    }
    setWeekDates(dates);
  };

  useEffect(() => {
    if (weekDates.length > 0) {
      fetchWeeklyTasks();
    }
  }, [weekDates]);

  const fetchWeeklyTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/employee/tasks/weekly/${user.id}?startDate=${weekDates[0]}&endDate=${weekDates[6]}`);
      if (res.data.success) {
        const tasksMap = {};
        res.data.tasks.forEach(task => {
          const key = `${task.date}_${task.slotKey}`;
          tasksMap[key] = task.title;
        });
        setWeekTasks(tasksMap);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (date, slot, value) => {
    setWeekTasks(prev => ({
      ...prev,
      [`${date}_${slot}`]: value
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const tasksToSubmit = [];
      Object.entries(weekTasks).forEach(([key, title]) => {
        if (title.trim()) {
          const [date, slotKey] = key.split('_');
          tasksToSubmit.push({
            date,
            slotKey,
            title,
            status: 'Completed'
          });
        }
      });

      const res = await api.post('/employee/tasks/bulk', {
        employeeId: user.id,
        tasks: tasksToSubmit,
        dates: weekDates,
        dailyRemarks,
        weeklyRemarks: weekRemarks
      });

      if (res.data.success) {
        alert('Timesheet submitted successfully');
      }
    } catch (err) {
      console.error('Error submitting timesheet:', err);
      alert('Failed to submit timesheet');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all inputs for this week?')) {
      setWeekTasks({});
      setWeekRemarks('');
    }
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction * 7));
    setSelectedDate(newDate);
  };

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const renderContent = () => (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 mb-10 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-fit mx-auto">
         <button 
           onClick={() => navigate(`/employee/${employeeSlug}/attendance`)}
           className="flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-slate-400 hover:bg-slate-50"
         >
           <CheckSquare size={18} />
           Attendance
         </button>
         <button 
           className="flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-[#1e293b] text-white shadow-xl shadow-[#1e293b]/20"
         >
           <Clock size={18} />
           Hourly Update
         </button>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
           <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              <span>Hourly Report</span>
              <ChevronRight size={12} />
              <span className="text-blue-500">New Timesheet</span>
           </nav>
           <h2 className="text-3xl font-black text-[#1e293b]">Hourly Report - Daily Timesheet</h2>
           <p className="text-slate-400 text-sm font-medium">Fill your work hours and tasks for the day</p>
         </div>

         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
               <button onClick={() => navigateWeek(-1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <ChevronLeft size={18} className="text-slate-600" />
               </button>
               <div className="px-4 py-2 flex items-center gap-3 border-x border-slate-100">
                  <Calendar size={18} className="text-blue-500" />
                  <span className="text-sm font-black text-[#1e293b]">
                    {formatDateLabel(weekDates[0])} - {formatDateLabel(weekDates[6])}
                  </span>
               </div>
               <button onClick={() => navigateWeek(1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <ChevronRight size={18} className="text-slate-600" />
               </button>
            </div>
            <div className="relative group">
              <input 
                type="date" 
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="px-6 py-3.5 bg-white border border-slate-100 rounded-2xl text-xs font-black text-[#1e293b] outline-none shadow-sm focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer"
              />
            </div>
         </div>
      </div>

      {/* Timesheet Grid */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-3">
             <Loader2 size={40} className="text-blue-500 animate-spin" />
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Timesheet...</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
             <thead>
                <tr className="bg-slate-50/50">
                   <th className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 sticky left-0 bg-slate-50/50 z-10">Time</th>
                   {days.map((day, idx) => (
                     <th key={day} className="p-6 text-left text-[10px] font-black text-[#1e293b] uppercase tracking-widest border-b border-slate-100 min-w-[200px]">
                       <div className="flex flex-col">
                          <span>{day}</span>
                          <span className="text-[9px] text-slate-400 mt-1">{formatDateLabel(weekDates[idx])}</span>
                       </div>
                     </th>
                   ))}
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {timeSlots.map((slot, sIdx) => (
                  <tr key={slot} className="group hover:bg-slate-50/30 transition-colors">
                     <td className="p-6 text-xs font-black text-slate-500 border-r border-slate-50 sticky left-0 bg-white group-hover:bg-slate-50/30 z-10">{slot}</td>
                     {weekDates.map((date, dIdx) => (
                       <td key={`${date}-${slot}`} className="p-3 border-r border-slate-50">
                          <input 
                            type="text"
                            value={weekTasks[`${date}_${slot}`] || ''}
                            onChange={(e) => handleInputChange(date, slot, e.target.value)}
                            placeholder="-"
                            className="w-full px-4 py-3.5 bg-transparent border border-transparent rounded-xl text-xs font-medium text-[#1e293b] outline-none hover:border-slate-200 focus:bg-white focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/5 transition-all"
                          />
                       </td>
                     ))}
                  </tr>
                ))}
                
                {/* Daily Remarks Row */}
                <tr className="bg-slate-50/30">
                   <td className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 sticky left-0 bg-slate-50 z-10">Daily Remarks</td>
                   {weekDates.map((date) => (
                     <td key={`remark-${date}`} className="p-3 border-r border-slate-50">
                        <textarea 
                          value={dailyRemarks[date] || ''}
                          onChange={(e) => setDailyRemarks(prev => ({ ...prev, [date]: e.target.value }))}
                          placeholder="Daily notes..."
                          rows="2"
                          className="w-full px-4 py-3 bg-white/50 border border-transparent rounded-xl text-[11px] font-medium text-slate-500 outline-none hover:border-slate-200 focus:bg-white focus:border-blue-500 transition-all resize-none"
                        ></textarea>
                     </td>
                   ))}
                </tr>
             </tbody>
          </table>
        </div>

        {/* Footer Remarks */}
        <div className="p-10 bg-slate-50/50 border-t border-slate-100 space-y-6">
           <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Remarks for the Week</label>
              <textarea 
                 value={weekRemarks}
                 onChange={(e) => setWeekRemarks(e.target.value)}
                 placeholder="Overall productive week. Completed major tasks and updated reports."
                 rows="3"
                 className="w-full p-6 bg-white border border-slate-100 rounded-[24px] text-sm font-medium text-[#1e293b] outline-none shadow-sm focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
              ></textarea>
           </div>

           <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
              <button 
                 onClick={handleClear}
                 className="w-full sm:w-auto px-10 py-4 bg-white text-slate-500 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                 <Eraser size={16} /> Clear
              </button>
              <button 
                 onClick={handleSubmit}
                 disabled={submitting}
                 className="w-full sm:w-auto px-12 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                 {submitting ? (
                   <Loader2 size={18} className="animate-spin" />
                 ) : (
                   <><Send size={18} /> Submit Report</>
                 )}
              </button>
           </div>
        </div>
      </div>
      
      {/* Helper Actions */}
      <div className="flex items-center justify-center gap-8 text-slate-400">
         <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-[#1e293b] transition-colors">
            <Printer size={14} /> Print Timesheet
         </button>
         <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-[#1e293b] transition-colors">
            <Download size={14} /> Export PDF
         </button>
      </div>
    </div>
  );

  if (embedded) {
    return renderContent();
  }

  return (
    <DashboardLayout title="Hourly Report" subtitle="Daily Timesheet" employeeSlug={employeeSlug}>
      <div className="max-w-[1600px] mx-auto">
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default EmployeeSchedule;
