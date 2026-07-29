import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { io } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_BASE_URL || 'https://oditech-hrms-backend-2.onrender.com/api').replace('/api', '');

const AttendanceCalendar = ({ employeeId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [leaves, setLeaves] = useState([]);

  const fetchHolidays = async () => {
    try {
      const res = await api.get('/holidays');
      if (res.data.success) {
        setHolidays(res.data.holidays);
      }
    } catch (err) {
      console.error('Error fetching holidays:', err);
    }
  };

  const fetchAttendance = async () => {
    if (!employeeId) return;
    try {
      const res = await api.get(`/employee/attendance/log/${employeeId}`);
      if (res.data.success) {
        setAttendanceData(res.data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching attendance log:', err);
    }
  };

  const fetchLeaves = async () => {
    if (!employeeId) return;
    try {
      const res = await api.get(`/employee/leaves/${employeeId}`);
      if (res.data.success) {
        setLeaves(res.data.leaves || []);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
  };

  useEffect(() => {
    fetchHolidays();
    fetchAttendance();
    fetchLeaves();

    const socket = io(SOCKET_URL);
    socket.on('holidayUpdated', () => {
      fetchHolidays();
    });

    return () => {
      socket.disconnect();
    };
  }, [employeeId]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const getDayStatus = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getDay();

    // 1. Holiday (Pink)
    const holiday = holidays.find(h => h.holidayDate === dateStr);
    if (holiday) {
      return { status: 'Holiday', color: 'bg-pink-500 text-white shadow-pink-200', tooltip: `Holiday: ${holiday.holidayName}` };
    }

    // 2. Leave (Purple)
    // Assuming leaves have startDate and endDate in ISO format
    const leave = leaves.find(l => {
      if (l.status !== 'Approved') return false;
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
      return dateObj >= start && dateObj <= end;
    });
    if (leave) {
      return { status: 'Leave', color: 'bg-purple-500 text-white shadow-purple-200', tooltip: 'On Leave' };
    }

    // Attendance Log Checks
    const log = attendanceData.find(a => {
      const logDateStr = new Date(a.date || a.createdAt).toISOString().split('T')[0];
      return logDateStr === dateStr;
    });

    if (log) {
      // 3. Absent (Red)
      if (log.status === 'Absent') return { status: 'Absent', color: 'bg-rose-500 text-white shadow-rose-200', tooltip: 'Absent' };
      // 4. Late (Orange)
      if (log.status === 'Late') return { status: 'Late', color: 'bg-orange-500 text-white shadow-orange-200', tooltip: 'Late' };
      // 5. Present (Green)
      if (log.status === 'Present') return { status: 'Present', color: 'bg-emerald-500 text-white shadow-emerald-200', tooltip: 'Present' };
      if (log.status === 'Half Day') return { status: 'Half Day', color: 'bg-sky-500 text-white shadow-sky-200', tooltip: 'Half Day' };
    }

    // 6. Weekend (Gray)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { status: 'Weekend', color: 'bg-slate-200 text-slate-500', tooltip: 'Weekend' };
    }

    // 7. Future/Default
    if (dateObj > new Date()) {
      return { status: 'Future', color: 'text-slate-400', tooltip: '' };
    }

    // If past and no record, and not weekend/holiday
    return { status: 'Unknown', color: 'text-slate-700 bg-slate-50 border border-slate-100', tooltip: 'No Record' };
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 relative overflow-hidden h-full">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-pink-500"></div>
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#1e293b]">Attendance Calendar</h3>
            <p className="text-xs text-slate-400 font-bold">Your monthly attendance overview</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-50 border border-slate-100 rounded-lg transition-colors shadow-sm"><ChevronLeft size={16} /></button>
          <span className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-[#1e293b] uppercase tracking-widest min-w-[120px] text-center shadow-sm">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-50 border border-slate-100 rounded-lg transition-colors shadow-sm"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center mb-6">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <span key={day} className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{day}</span>
        ))}
        
        {/* Empty slots for first week */}
        {[...Array(firstDayOfMonth)].map((_, i) => (
          <div key={`empty-${i}`} className="w-10 h-10 mx-auto"></div>
        ))}
        
        {/* Days */}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const { color, tooltip } = getDayStatus(day);
          return (
            <div key={day} className="flex flex-col items-center group relative cursor-pointer">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-sm transition-transform group-hover:scale-110 ${color}`}>
                {day}
              </div>
              {tooltip && (
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max max-w-[150px] bg-[#1e293b] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl z-10 text-center">
                  {tooltip}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-pink-500"></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Holiday</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Leave</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Absent</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Late</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Present</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Weekend</span></div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
