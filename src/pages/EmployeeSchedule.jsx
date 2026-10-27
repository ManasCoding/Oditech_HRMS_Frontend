import React, { useState, useEffect, useRef, useCallback } from 'react';
import EmployeeLayout from '../layouts/EmployeeLayout';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Send, Calendar, Download, FileSpreadsheet, 
  Trash2, Plus, CheckCircle2, AlertCircle, Loader2,
  ChevronLeft, ChevronRight, Eraser, Printer, Clock, Lock, PieChart, CheckCircle, XCircle, ExternalLink,
  RefreshCw, UploadCloud, Check, X, Sparkles
} from 'lucide-react';
import api from '../services/api';
import { io } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_BASE_URL || 'https://oditech-hrms-backend-2.onrender.com/api').replace('/api', '');

// Auto-expanding textarea component that automatically grows in size as an employee types
// so the employee can always see what they write in full without text clipping
const AutoExpandingTextarea = ({
  value = '',
  onChange,
  onBlur,
  placeholder = '-',
  disabled = false,
  className = '',
  title = '',
  minHeight = 44,
  maxHeight = 280,
}) => {
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const scrollH = el.scrollHeight;
    const targetH = Math.min(Math.max(scrollH, minHeight), maxHeight);
    el.style.height = `${targetH}px`;
    el.style.overflowY = scrollH > maxHeight ? 'auto' : 'hidden';
  }, [minHeight, maxHeight]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [adjustHeight]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange?.(e.target.value);
        adjustHeight();
      }}
      onFocus={adjustHeight}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      rows={1}
      className={className}
      title={title}
    />
  );
};

const EmployeeSchedule = ({ embedded = false, onBack }) => {
  const { employeeSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeReportTab, setActiveReportTab] = useState('hrms'); // 'hrms' | 'excel'
  const [weekTasks, setWeekTasks] = useState({});
  const [dailyRemarks, setDailyRemarks] = useState({});
  const [weekRemarks, setWeekRemarks] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [timesheets, setTimesheets] = useState([]);
  const [toast, setToast] = useState(null);
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [systemSettings, setSystemSettings] = useState({});
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncingSheet, setSyncingSheet] = useState(false);
  const [pullingSheet, setPullingSheet] = useState(false);
  const [pulledTasksPreview, setPulledTasksPreview] = useState([]);
  const [sheetRestricted, setSheetRestricted] = useState(false);
  const [syncDate, setSyncDate] = useState(new Date().toISOString().split('T')[0]);
  const [syncText, setSyncText] = useState('');
  const [syncRemarks, setSyncRemarks] = useState('');

  useEffect(() => {
    const fetchContext = async () => {
      try {
        if (user.id) {
          const profileRes = await api.get(`/employee/profile/${user.id}`);
          if (profileRes.data?.success) {
            setEmployeeProfile(profileRes.data.employee);
          }
        }
        const settingsRes = await api.get('/settings');
        if (settingsRes.data?.success) {
          setSystemSettings(settingsRes.data.settings || {});
        }
      } catch (err) {
        console.error('Error fetching context:', err);
      }
    };
    fetchContext();
  }, [user.id]);

  const getDepartmentSheet = () => {
    const dept = employeeProfile?.department || user.department || 'Engineering';
    const isDev = ['engineering', 'developer', 'development', 'software', 'tech'].some(k => dept.toLowerCase().includes(k));
    const isMarketing = dept.toLowerCase().includes('marketing') ||
      /smruti|amit/i.test(employeeProfile?.fullName || '') ||
      /smruti|amit/i.test(user.name || '') ||
      /smruti|amit/i.test(user.email || '');
    const isDesign = dept.toLowerCase().includes('design') ||
      /debashish|rashmi|mrinal|subas|suchismita/i.test(employeeProfile?.fullName || '') ||
      /debashish|rashmi|mrinal|subas|suchismita/i.test(user.name || '');
    const isManagement = dept.toLowerCase().includes('manage') ||
      /jasmin/i.test(employeeProfile?.fullName || '') ||
      /jasmin/i.test(user.name || '');
    const isHR = /human\s*resource|hr\b/i.test(dept);

    const settingKey = `sheet_url_${dept}`;
    let sheetUrl = systemSettings[settingKey]?.trim();

    // Default sheet specifically for Human Resources Team
    if (!sheetUrl && isHR) {
      sheetUrl = systemSettings['sheet_url_Human Resources']?.trim() || 
        systemSettings['sheet_url_HR']?.trim() ||
        'https://docs.google.com/spreadsheets/d/1t8ERkUfun8dzpoaaoh4vbmYt9-zDO1Ib0gA_DNvTXxA/edit?gid=0#gid=0';
    }

    // Default sheet specifically for Management Team (Jasmin Jena & Leadership)
    if (!sheetUrl && isManagement) {
      sheetUrl = systemSettings['sheet_url_Management']?.trim() || 
        'https://docs.google.com/spreadsheets/d/1aOw1-8I2b99X3ILj_1rOrqFf1ntFOL7U19BZ3m-KVTI/edit?gid=882523443#gid=882523443';
    }

    // Default sheet specifically for Design Team (Debashish, Rashmi, Subas, Mrinal, etc.)
    if (!sheetUrl && isDesign) {
      sheetUrl = systemSettings['sheet_url_Design']?.trim() || 
        'https://docs.google.com/spreadsheets/d/1Hz-gYswAHVRhXEhQbJrJdC4Fo9xE8P0TCNNLsW_IZK4/edit?gid=0#gid=0';
    }

    // Default sheet specifically for Marketing Team (Smruti, Amit, Sanghamitra, etc.)
    if (!sheetUrl && isMarketing) {
      sheetUrl = systemSettings['sheet_url_Marketing']?.trim() || 
        'https://docs.google.com/spreadsheets/d/1PF386DYQWbUHKuIeIixclNnG1hil4TzO/edit?gid=2082445647#gid=2082445647';
    }

    // Default sheet specifically for Developer / Engineering Team (allows viewing total report across team tabs)
    if (!sheetUrl && isDev) {
      sheetUrl = systemSettings['sheet_url_Engineering']?.trim() || 
        'https://docs.google.com/spreadsheets/d/1sIlWWsipPxOrCQENj2E_EHI7XW2HD9S2n8xfaPVuzNs/edit?pli=1&gid=577942890#gid=577942890';
    }

    const deptDisplayName = isMarketing ? 'Marketing Team' : (isDev ? 'Developer Team' : (isDesign ? 'Design Team' : (isManagement ? 'Management Team' : (isHR ? 'Human Resources Team' : `${dept} Team`))));

    if (!sheetUrl) {
      return {
        departmentName: deptDisplayName,
        hasSheet: false,
        url: null,
        embedUrl: null
      };
    }

    let embedUrl = sheetUrl;
    if (sheetUrl.includes('docs.google.com/spreadsheets')) {
      embedUrl = sheetUrl.replace('/edit', '/edit?rm=minimal');
      if (!embedUrl.includes('rm=minimal')) {
        embedUrl += embedUrl.includes('?') ? '&rm=minimal' : '?rm=minimal';
      }
    }

    return {
      departmentName: deptDisplayName,
      hasSheet: true,
      url: sheetUrl,
      embedUrl
    };
  };

  const deptSheet = getDepartmentSheet();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTimesheets = async () => {
    try {
      const res = await api.get(`/timesheets/${user.id}?month=${selectedDate.getMonth() + 1}&year=${selectedDate.getFullYear()}`);
      if (res.data.success) setTimesheets(res.data.timesheets);
    } catch (err) {
      console.error('Error fetching timesheets:', err);
    }
  };

  useEffect(() => {
    fetchTimesheets();
    const socket = io(SOCKET_URL);
    socket.on('timesheetSubmitted', (data) => {
      if (data.employeeId === user.id) fetchTimesheets();
    });
    socket.on('timesheetUpdated', (data) => {
      if (data.employeeId === user.id) fetchTimesheets();
    });
    return () => socket.disconnect();
  }, [selectedDate, user.id]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getSlotState = (dateStr, slotKey) => {
    const endStr = (slotKey || '').split(' - ')[1]?.trim() || '00:00';
    const startStr = (slotKey || '').split(' - ')[0]?.trim() || '00:00';
    
    const parseTime = (timeStr) => {
      let [h, m] = timeStr.split(':').map(Number);
      if (h >= 1 && h <= 8) h += 12;
      return { h, m };
    };

    const startT = parseTime(startStr);
    const endT = parseTime(endStr);

    const slotStart = new Date(dateStr);
    slotStart.setHours(startT.h, startT.m, 0, 0);

    const slotEnd = new Date(dateStr);
    slotEnd.setHours(endT.h, endT.m, 0, 0);

    const graceEnd = new Date(slotEnd.getTime() + 15 * 60000);

    if (currentTime < slotStart) return { status: 'FUTURE' };
    if (currentTime >= slotStart && currentTime < slotEnd) return { status: 'ACTIVE' };
    if (currentTime >= slotEnd && currentTime < graceEnd) {
      const remainingMs = graceEnd - currentTime;
      const m = Math.floor(remainingMs / 60000);
      const s = Math.floor((remainingMs % 60000) / 1000);
      const countdown = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      return { status: 'GRACE', countdown };
    }
    return { status: 'LOCKED' };
  };

  const getRemarksState = (dateStr) => {
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);
    
    if (currentTime < startOfDay) return 'FUTURE';
    if (currentTime > endOfDay) return 'LOCKED';
    return 'ACTIVE';
  };
  


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
    calculateWeekDates(selectedDate);
  }, [selectedDate]);

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

  useEffect(() => {
    if (weekDates.length > 0) {
      fetchWeeklyTasks();
    }
  }, [weekDates]);

  // Real-time socket listener for sheet updates
  useEffect(() => {
    let socket;
    try {
      socket = io(SOCKET_URL);
      socket.on('timesheetUpdated', (data) => {
        if (!data?.employeeId || data.employeeId === user.id || data.employeeId === employeeProfile?._id) {
          fetchWeeklyTasks();
        }
      });
    } catch (err) {
      console.error('Socket connection error:', err);
    }
    return () => {
      if (socket) socket.disconnect();
    };
  }, [user.id, employeeProfile?._id, weekDates]);

  const handleAutoPullFromSheet = async (targetDateToPull = syncDate, autoSave = true) => {
    setPullingSheet(true);
    setSheetRestricted(false);
    try {
      const payload = {
        employeeId: user.id || employeeProfile?._id,
        empCode: employeeProfile?.empCode || employeeSlug || user.slug,
        employeeName: employeeProfile?.fullName || user.name,
        email: employeeProfile?.email || user.email,
        sheetUrl: deptSheet.url,
        date: targetDateToPull,
        autoSave
      };

      const res = await api.post('/timesheets/pull-sheet', payload);
      if (res.data?.success) {
        if (res.data.count > 0) {
          setPulledTasksPreview(res.data.tasks || []);
          showToast(`⚡ Pulled & saved ${res.data.count} work update(s) from Google Sheet as Draft! (Not submitted to admin)`, 'success');
          const foundRemark = res.data.tasks.find(t => t.remarks)?.remarks;
          if (foundRemark) setSyncRemarks(foundRemark);
          await fetchWeeklyTasks();
        } else {
          showToast(res.data.message || `No entries found for date ${targetDateToPull}`, 'error');
        }
      } else {
        if (res.data?.isRestricted) {
          setSheetRestricted(true);
          showToast('Google Sheet is restricted (401). Set sharing to "Anyone with the link can view".', 'error');
        } else {
          showToast(res.data?.message || 'Failed to sync from Google Sheet', 'error');
        }
      }
    } catch (err) {
      console.error('Error auto-pulling sheet:', err);
      const isRestr = err.response?.data?.isRestricted || err.response?.status === 403 || err.response?.status === 401;
      if (isRestr) {
        setSheetRestricted(true);
        showToast('Google Sheet is restricted. Set sharing to "Anyone with the link can view".', 'error');
      } else {
        showToast(err.response?.data?.message || 'Failed to pull from Google Sheet', 'error');
      }
    } finally {
      setPullingSheet(false);
    }
  };

  const handleSyncFromSheet = async () => {
    if (!syncText.trim()) {
      showToast('Please enter your work update or task notes to sync', 'error');
      return;
    }
    setSyncingSheet(true);
    try {
      const lines = syncText
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

      const parsedTasks = [];

      lines.forEach((line, idx) => {
        const slotMatch = line.match(/^(\d{1,2}:\d{2}\s*(?:-\s*\d{1,2}:\d{2})?(?:\s*[AaPp][Mm])?|Slot\s*\d+)\s*[:-]\s*(.*)$/i);
        if (slotMatch) {
          parsedTasks.push({
            slotKey: slotMatch[1].trim(),
            title: slotMatch[2].trim()
          });
        } else {
          const fallbackSlot = timeSlots[idx] || `Slot ${idx + 1}`;
          parsedTasks.push({
            slotKey: fallbackSlot,
            title: line
          });
        }
      });

      const payload = {
        employeeId: user.id || employeeProfile?._id,
        empCode: employeeProfile?.empCode || employeeSlug || user.slug,
        employeeName: employeeProfile?.fullName || user.name,
        email: employeeProfile?.email || user.email,
        date: syncDate,
        tasks: parsedTasks,
        dailyRemarks: syncRemarks
      };

      const res = await api.post('/timesheets/sync-sheet', payload);
      if (res.data?.success) {
        showToast('Work updates saved to database as Draft! (Not submitted to admin)', 'success');
        setShowSyncModal(false);
        setSyncText('');
        setSyncRemarks('');
        await fetchWeeklyTasks();
      } else {
        showToast(res.data?.message || 'Sync failed', 'error');
      }
    } catch (err) {
      console.error('Error syncing sheet update:', err);
      showToast(err.response?.data?.message || 'Failed to sync update to HRMS', 'error');
    } finally {
      setSyncingSheet(false);
    }
  };

  const handleInputChange = (date, slot, value) => {
    setWeekTasks(prev => ({
      ...prev,
      [`${date}_${slot}`]: value
    }));
  };

  const handleAutoSave = async () => {
    setIsAutoSaving(true);
    try {
      const tasksToSubmit = [];
      Object.entries(weekTasks).forEach(([key, title]) => {
        if (title.trim()) {
          const [date, slotKey] = key.split('_');
          tasksToSubmit.push({ date, slotKey, title, status: 'Completed' });
        }
      });

      await api.post('/employee/tasks/bulk', {
        employeeId: user.id,
        tasks: tasksToSubmit,
        dates: weekDates,
        dailyRemarks,
        weeklyRemarks: weekRemarks
      });
    } catch (err) {
      console.error('Error auto-saving timesheet:', err);
    } finally {
      setTimeout(() => setIsAutoSaving(false), 1000);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await handleAutoSave();
      
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // Calculate login/logout time based on tasks for the selected date
      let loginTime = null;
      let logoutTime = null;
      const hourlyTasks = [];
      
      Object.entries(weekTasks).forEach(([key, title]) => {
        if (title.trim()) {
          const [tDate, slotKey] = key.split('_');
          if (tDate === dateStr) {
            hourlyTasks.push({ date: tDate, slotKey, title, status: 'Completed' });
            const startStr = slotKey.split(' - ')[0].trim();
            const endStr = slotKey.split(' - ')[1].trim();
            
            // simple conversion to AM/PM for logic
            const formatAmPm = (time) => {
              const [h, m] = time.split(':').map(Number);
              const suffix = h >= 12 ? 'PM' : 'AM';
              const hour12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
              return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${suffix}`;
            };

            const startFormatted = formatAmPm(startStr);
            const endFormatted = formatAmPm(endStr);
            
            if (!loginTime) loginTime = startFormatted;
            logoutTime = endFormatted; // will end up being the last one
          }
        }
      });
      
      await api.post('/timesheets/submit', {
        employeeId: user.id,
        date: dateStr,
        weekStart: weekDates[0],
        weekEnd: weekDates[6],
        loginTime,
        logoutTime,
        hourlyTasks,
        dailyRemarks: dailyRemarks[dateStr] || '',
        weeklyRemarks: weekRemarks
      });

      showToast('Timesheet submitted successfully');
    } catch (err) {
      showToast('Failed to submit timesheet', 'error');
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
      

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
           <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              <span>Hourly Report</span>
              <ChevronRight size={12} />
              <span className="text-blue-500">New Timesheet</span>
           </nav>
           <h2 className="text-3xl font-black text-[#1e293b] flex items-center gap-3">
             Hourly Report - Daily Timesheet
             {isAutoSaving && (
               <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md ml-2">
                 <Loader2 size={12} className="animate-spin" /> Auto-saving...
               </span>
             )}
           </h2>
           <p className="text-slate-400 text-sm font-medium">Fill your work hours and tasks for the day (Auto-saves as you type)</p>
         </div>

         {toast && (
           <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold animate-in slide-in-from-right-4 ${
             toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
           }`}>
             {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
             {toast.msg}
           </div>
         )}

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

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-6">
         <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-center items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Work Hours</p>
            <h3 className="text-2xl font-black text-slate-800">
               {Math.floor(timesheets.reduce((acc, r) => {
                 const h = r.totalHours?.match(/(\d+)h/);
                 return acc + (h ? parseInt(h[1]) : 0);
               }, 0))}h {timesheets.reduce((acc, r) => {
                 const m = r.totalHours?.match(/(\d+)m/);
                 return acc + (m ? parseInt(m[1]) : 0);
               }, 0) % 60}m
            </h3>
            <p className="text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-widest">This Month</p>
         </div>
         <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-center items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Overtime</p>
            <h3 className="text-2xl font-black text-slate-800">
               {Math.floor(timesheets.reduce((acc, r) => {
                 const h = r.overtime?.match(/(\d+)h/);
                 return acc + (h ? parseInt(h[1]) : 0);
               }, 0))}h {timesheets.reduce((acc, r) => {
                 const m = r.overtime?.match(/(\d+)m/);
                 return acc + (m ? parseInt(m[1]) : 0);
               }, 0) % 60}m
            </h3>
            <p className="text-[10px] font-bold text-blue-500 mt-1 uppercase tracking-widest">Extra Hours</p>
         </div>
         <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-center items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Hours / Day</p>
            <h3 className="text-2xl font-black text-slate-800">
               {timesheets.length > 0 ? (
                 Math.floor(timesheets.reduce((acc, r) => {
                   const h = r.totalHours?.match(/(\d+)h/);
                   const m = r.totalHours?.match(/(\d+)m/);
                   return acc + (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0);
                 }, 0) / timesheets.length / 60)
               ) : 0}h {timesheets.length > 0 ? (
                 Math.floor(timesheets.reduce((acc, r) => {
                   const h = r.totalHours?.match(/(\d+)h/);
                   const m = r.totalHours?.match(/(\d+)m/);
                   return acc + (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0);
                 }, 0) / timesheets.length) % 60
               ) : 0}m
            </h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Efficiency Rate</p>
         </div>
         <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-center items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Submissions</p>
            <h3 className="text-2xl font-black text-slate-800">{timesheets.length}</h3>
            <p className="text-[10px] font-bold text-violet-500 mt-1 uppercase tracking-widest">Monthly Statistics</p>
         </div>
      </div>

      {/* Monthly Timesheet List */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
         <div className="p-8 border-b border-slate-50">
            <h3 className="text-xl font-black text-slate-800">Monthly Timesheet List</h3>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                     {['Date', 'Log Time', 'Work Hours', 'Overtime', 'Status'].map(h => (
                       <th key={h} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                     ))}
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {timesheets.length > 0 ? (
                    timesheets.map((ts, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/30 transition-all">
                         <td className="px-8 py-5">
                            <p className="text-sm font-black text-slate-700">{ts.date}</p>
                         </td>
                         <td className="px-8 py-5">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                               {ts.loginTime || '--'} - {ts.logoutTime || '--'}
                            </p>
                         </td>
                         <td className="px-8 py-5">
                            <span className="text-sm font-black text-slate-700">{ts.totalHours || '0h 0m'}</span>
                         </td>
                         <td className="px-8 py-5 text-sm font-bold text-slate-400">{ts.overtime || '0h 0m'}</td>
                         <td className="px-8 py-5">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              ts.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              ts.status === 'Submitted' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                              'bg-orange-50 text-orange-600 border-orange-100'
                            }`}>
                               {ts.status || 'Pending'}
                            </span>
                         </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-10 py-20 text-center text-slate-400 text-xs font-bold italic">No submitted timesheets found for this month.</td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Middle Section: HRMS Report vs Excel Report Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 py-2">
        <button
          type="button"
          onClick={() => setActiveReportTab('hrms')}
          className={`flex items-center gap-2.5 px-7 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
            activeReportTab === 'hrms'
              ? 'bg-[#0f172a] text-white shadow-xl shadow-slate-900/20 scale-[1.02]'
              : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet size={16} className={activeReportTab === 'hrms' ? 'text-blue-400' : 'text-slate-400'} />
          HRMS Report
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('excel')}
          className={`flex items-center gap-2.5 px-7 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
            activeReportTab === 'excel'
              ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/25 scale-[1.02]'
              : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <Download size={16} className={activeReportTab === 'excel' ? 'text-emerald-100' : 'text-emerald-500'} />
          Excel Report
        </button>

        {deptSheet.hasSheet && (
          <a
            href={deptSheet.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 bg-white text-slate-500 border border-slate-200/80 rounded-2xl text-xs font-bold hover:text-emerald-600 hover:border-emerald-300 transition-all shadow-sm"
            title={`Open ${deptSheet.departmentName} Sheet in new tab`}
          >
            <ExternalLink size={15} />
          </a>
        )}
      </div>

      {activeReportTab === 'hrms' ? (
        /* Timesheet Grid */
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
                     <td className="p-6 text-xs font-black text-slate-500 border-r border-slate-50 sticky left-0 bg-white group-hover:bg-slate-50/30 z-10 align-top">{slot}</td>
                     {weekDates.map((date, dIdx) => {
                       const slotState = getSlotState(date, slot);
                       const isLocked = slotState.status === 'LOCKED' || slotState.status === 'FUTURE';
                       
                       return (
                         <td key={`${date}-${slot}`} className="p-3 border-r border-slate-50 relative align-top">
                           <div className="relative w-full group/input">
                             <AutoExpandingTextarea 
                               value={weekTasks[`${date}_${slot}`] || ''}
                               onChange={(val) => handleInputChange(date, slot, val)}
                               onBlur={handleAutoSave}
                               placeholder={slotState.status === 'FUTURE' ? "Not available" : "-"}
                               disabled={isLocked}
                               minHeight={44}
                               maxHeight={280}
                               className={`w-full px-4 py-3 border rounded-xl text-xs font-medium text-[#1e293b] outline-none transition-[border-color,box-shadow,background-color] duration-150 leading-relaxed break-words whitespace-pre-wrap
                                 ${isLocked 
                                   ? 'bg-slate-100 border-transparent text-slate-500 cursor-not-allowed select-none' 
                                   : 'bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10'
                                 }
                                 ${slotState.status === 'LOCKED' ? 'pr-9' : ''}
                                 ${slotState.status === 'GRACE' ? 'pr-28' : ''}
                               `}
                               title={
                                 slotState.status === 'LOCKED' 
                                   ? "This timeslot has been locked because the editing window has expired." 
                                   : slotState.status === 'FUTURE'
                                     ? "This timeslot is not yet available."
                                     : ""
                               }
                             />
                             {slotState.status === 'LOCKED' && (
                               <div className="absolute right-3 top-3 text-slate-400 pointer-events-none">
                                 <Lock size={14} />
                               </div>
                             )}
                             {slotState.status === 'GRACE' && (
                               <div className="absolute right-2.5 top-2.5 pointer-events-none z-10">
                                 <span className="text-[10px] font-black text-orange-500 bg-orange-50/95 border border-orange-200/50 px-2 py-0.5 rounded-md whitespace-nowrap shadow-sm">
                                   Editing ends in {slotState.countdown}
                                 </span>
                               </div>
                             )}
                           </div>
                         </td>
                       );
                     })}
                  </tr>
                ))}
                
                {/* Daily Remarks Row */}
                <tr className="bg-slate-50/30">
                   <td className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 sticky left-0 bg-slate-50 z-10 align-top">Daily Remarks</td>
                   {weekDates.map((date) => {
                     const remarksState = getRemarksState(date);
                     const isLocked = remarksState === 'LOCKED' || remarksState === 'FUTURE';
                     
                     return (
                       <td key={`remark-${date}`} className="p-3 border-r border-slate-50 relative align-top">
                          <div className="relative w-full">
                            <AutoExpandingTextarea 
                              value={dailyRemarks[date] || ''}
                              onChange={(val) => setDailyRemarks(prev => ({ ...prev, [date]: val }))}
                              onBlur={handleAutoSave}
                              placeholder={remarksState === 'FUTURE' ? "Not available" : "Daily notes..."}
                              disabled={isLocked}
                              minHeight={50}
                              maxHeight={280}
                              className={`w-full px-4 py-3 border rounded-xl text-[11px] font-medium text-slate-600 outline-none transition-[border-color,box-shadow,background-color] duration-150 leading-relaxed break-words whitespace-pre-wrap
                                ${isLocked
                                  ? 'bg-slate-100 border-transparent text-slate-500 cursor-not-allowed select-none'
                                  : 'bg-white/50 border-transparent hover:border-slate-200 focus:bg-white focus:border-blue-500 focus:shadow-md'
                                }
                                ${remarksState === 'LOCKED' ? 'pr-9' : ''}
                              `}
                              title={
                                remarksState === 'LOCKED'
                                  ? "This field has been locked because the editing window has expired."
                                  : remarksState === 'FUTURE'
                                    ? "This field is not yet available."
                                    : ""
                              }
                            />
                            {remarksState === 'LOCKED' && (
                              <div className="absolute right-3 top-3 text-slate-400 pointer-events-none">
                                <Lock size={14} />
                              </div>
                            )}
                          </div>
                       </td>
                     );
                   })}
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
                 onBlur={handleAutoSave}
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
      ) : (
        /* Excel Report View */
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-6 md:p-8 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold shadow-sm">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800 tracking-tight">
                  {deptSheet.departmentName} — Work Report
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  {deptSheet.hasSheet ? 'Total team work report & timesheets' : 'Work report sheet status'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={pullingSheet}
                onClick={() => handleAutoPullFromSheet(selectedDate.toISOString().split('T')[0], true)}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-200 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {pullingSheet ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Pulling from Sheet...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={15} />
                    <span>⚡ 1-Click Sync from Sheet</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSyncModal(true);
                  handleAutoPullFromSheet(syncDate, false);
                }}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <UploadCloud size={15} className="text-blue-600" />
                <span>Sync Options / Preview</span>
              </button>
              {deptSheet.hasSheet && (
                <a
                  href={deptSheet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
                >
                  <ExternalLink size={15} /> Open in Google Sheets
                </a>
              )}
            </div>
          </div>

          {deptSheet.hasSheet ? (
            <div className="w-full h-[750px] bg-slate-50 relative">
              <iframe
                src={deptSheet.embedUrl}
                title={`${deptSheet.departmentName} Work Report Google Sheet`}
                className="w-full h-full border-0"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="p-16 text-center flex flex-col items-center justify-center gap-4 bg-slate-50/40">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center font-bold shadow-sm">
                <AlertCircle size={28} />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-800">No Work Report Sheet Assigned</h4>
                <p className="text-xs text-slate-400 max-w-md mt-1 font-medium">
                  No Google Sheet has been assigned for the <span className="font-bold text-slate-700">{deptSheet.departmentName}</span> yet. Please ask your administrator to configure your department sheet in System Settings.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sync Sheet Work Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold shadow-sm">
                  <RefreshCw size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Sync Sheet Work to HRMS</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                      Draft Mode
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    Save spreadsheet work updates directly to your database schedule as a Draft
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Notice / Draft status banner */}
            <div className="mt-5 p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
              <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 leading-relaxed">
                <span className="font-bold">Database Draft Guarantee:</span> Work updates are stored in MongoDB as a <span className="font-bold underline">Draft (Pending)</span>. It will <span className="font-bold text-rose-600">NOT</span> submit or notify admin until you are ready and click &quot;Submit Report&quot; on your HRMS timesheet tab.
              </div>
            </div>

            {/* Auto-Pull Banner */}
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200">
              <div className="flex items-center gap-2.5">
                <Sparkles size={18} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-black text-emerald-950 uppercase tracking-tight">Auto-Pull from Live Sheet</p>
                  <p className="text-[11px] text-emerald-700 font-medium">Read entries for the selected date straight from your Google Sheet</p>
                </div>
              </div>
              <button
                type="button"
                disabled={pullingSheet}
                onClick={() => handleAutoPullFromSheet(syncDate, true)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {pullingSheet ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                <span>{pullingSheet ? 'Syncing...' : '⚡ Auto-Sync Now'}</span>
              </button>
            </div>

            {/* Restricted warning banner if sheet returns 401 */}
            {sheetRestricted && (
              <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <AlertCircle size={16} /> Google Sheet is Currently Restricted (401)
                </div>
                <p className="text-[11px] leading-relaxed">
                  To allow HRMS to auto-read your entries with 1 click, open your Google Sheet, click <strong>Share</strong> (top-right), and change <strong>General access</strong> to <strong>&quot;Anyone with the link can view&quot;</strong>.
                </p>
                <p className="text-[11px] font-semibold text-amber-700">
                  You can also paste your work entries directly in the text box below to save them immediately!
                </p>
              </div>
            )}

            {/* Live Pulled Tasks Preview */}
            {pulledTasksPreview.length > 0 && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Tasks Detected in Google Sheet ({pulledTasksPreview.length})
                  </p>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Saved in Database as Draft
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {pulledTasksPreview.map((t, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 text-xs">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-mono font-bold text-[10px] shrink-0">
                        {t.slotKey}
                      </span>
                      <span className="text-slate-800 font-medium leading-tight">{t.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Work Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={syncDate}
                    onChange={(e) => {
                      setSyncDate(e.target.value);
                      handleAutoPullFromSheet(e.target.value, false);
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Manual Work Update / Tasks (Fallback)
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">
                    One task per line or &quot;TimeSlot: Task&quot;
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={syncText}
                  onChange={(e) => setSyncText(e.target.value)}
                  placeholder={`Paste work entries here if preferred:\n09:30 - 10:30: Daily client coordination & standup\n10:30 - 11:30: Meeting with project lead\n11:30 - 12:30: Updated candidate records & review`}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-y font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Daily Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={syncRemarks}
                  onChange={(e) => setSyncRemarks(e.target.value)}
                  placeholder="e.g. All sprint objectives completed on time without blockers"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Collapsible Info for Automated Google Apps Script Webhook */}
              <details className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
                <summary className="font-bold text-slate-700 cursor-pointer select-none">
                  ⚡ Want Instant Push on Every Cell Edit in Google Sheets?
                </summary>
                <div className="mt-3 text-[11px] leading-relaxed text-slate-600 space-y-2">
                  <p>
                    You can install a simple Apps Script in your Google Sheet under <strong>Extensions &gt; Apps Script</strong> to automatically send every work cell update straight to this HRMS database:
                  </p>
                  <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto text-[10px] font-mono leading-relaxed">
{`function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  var row = e.range.getRow();
  if (row <= 1) return; // skip header
  
  var payload = {
    employeeName: sheet.getName(), // or active employee name
    date: Utilities.formatDate(new Date(), "GMT+5:30", "yyyy-MM-dd"),
    title: e.value,
    slotKey: sheet.getRange(row, 1).getValue() || "General"
  };
  
  UrlFetchApp.fetch("https://oditech-hrms-backend-2.onrender.com/api/timesheets/sync-sheet", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}`}
                  </pre>
                </div>
              </details>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                className="px-6 py-3 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              {syncText.trim() && (
                <button
                  type="button"
                  disabled={syncingSheet}
                  onClick={handleSyncFromSheet}
                  className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {syncingSheet ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Save Manual Tasks (Draft)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
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
    <EmployeeLayout title="Hourly Report" subtitle="Daily Timesheet">
      <div className="max-w-[1600px] mx-auto">
        {renderContent()}
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeSchedule;
