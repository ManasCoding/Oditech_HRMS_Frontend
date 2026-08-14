import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { 
  Users, Clock, Search, Calendar, MoreHorizontal,
  ChevronLeft, ChevronRight, X, Download, FileText,
  UserCheck, Briefcase, Eye, CheckCircle2, XCircle, Hourglass, AlertTriangle
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import api from '../services/api';
import CustomDropdown from '../components/CustomDropdown';
import { useAttendance } from '../context/AttendanceContext';

// Removed SOCKET_URL

const StatCard = ({ label, value, percentage, topBorderClass, isActive, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-5 rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer ${
    isActive ? 'border-2 border-blue-500 shadow-lg scale-105' : 'border border-slate-100 shadow-sm hover:border-blue-200 hover:-translate-y-1'
  } ${topBorderClass} border-t-4`}>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center leading-tight">
      {label}
    </p>
    <h3 className="text-4xl font-black text-[#1e293b] mb-1">{value}</h3>
    {percentage !== undefined && (
      <p className="text-[10px] font-bold text-slate-400">{percentage}%</p>
    )}
  </div>
);

// Dummy data for charts to match UI exactly
const trendData = [
  { name: '01 Jun', present: 20, absent: 3 },
  { name: '12 Jun', present: 22, absent: 1 },
  { name: '12 Jun', present: 18, absent: 5 },
  { name: '12 Jun', present: 21, absent: 2 },
  { name: '12 Jun', present: 23, absent: 0 },
];

const departmentData = [
  { name: 'IT', value: 45, fill: '#3b82f6' },
  { name: 'Marketing', value: 35, fill: '#f43f5e' },
  { name: 'HR', value: 42, fill: '#10b981' },
  { name: 'Design', value: 28, fill: '#3b82f6' },
  { name: 'Software', value: 50, fill: '#10b981' },
  { name: 'Development', value: 50, fill: '#10b981' },
];

const AdminAttendance = () => {
  const { refreshKey } = useAttendance();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0, presentToday: 0, halfDayToday: 0, absentToday: 0, lateToday: 0, leavesToday: 0
  });
  const [data, setData] = useState({
    reports: [],
    totalEntries: 0
  });
  const [holidays, setHolidays] = useState([]);

  // ── Late Approvals State ─────────────────────────────────────────────────────
  const [lateApprovals, setLateApprovals] = useState([]);
  const [lateApprovalsLoading, setLateApprovalsLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState(null); // { id, employeeName }
  const [rejectReason, setRejectReason] = useState('');
  const [approvalProcessing, setApprovalProcessing] = useState(null); // id being processed
  // ─────────────────────────────────────────────────────────────────────────────

  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    department: 'All Departments',
    employeeId: 'All',
    status: 'Active',
    page: 1
  });

  const [departments, setDepartments] = useState(['All Departments', 'Digital Marketing', 'Web Development', 'SEO', 'HR', 'Others']);

  const [search, setSearch] = useState('');
  const [selectedActionRow, setSelectedActionRow] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);
  const [rawRecords, setRawRecords] = useState([]);

  const fetchHolidays = async () => {
    try {
      const res = await api.get('/holidays');
      if (res.data.success) {
        setHolidays(res.data.holidays || []);
      }
    } catch (err) {
      console.error('Error fetching holidays:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/employees');
      if (res.data.success) {
        setAllEmployees(res.data.employees || []);
        const uniqueDepts = [...new Set(res.data.employees.map(e => e.department).filter(Boolean))];
        setDepartments(['All Departments', ...uniqueDepts]);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchHolidays();
  }, []);

  // ── Late Approvals Fetch ─────────────────────────────────────────────────────
  const fetchLateApprovals = useCallback(async () => {
    setLateApprovalsLoading(true);
    try {
      const res = await api.get(`/admin/attendance/late-approvals?date=${filters.date}&status=Pending`);
      if (res.data.success) {
        setLateApprovals(res.data.records || []);
      }
    } catch (err) {
      console.error('Error fetching late approvals:', err);
    } finally {
      setLateApprovalsLoading(false);
    }
  }, [filters.date]);

  useEffect(() => {
    fetchLateApprovals();
  }, [fetchLateApprovals, refreshKey]);

  const handleApprove = async (id) => {
    setApprovalProcessing(id);
    try {
      const adminUser = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await api.put(`/admin/attendance/late-approvals/${id}/approve`, {
        adminId: adminUser._id
      });
      if (res.data.success) {
        // Remove from pending list and refetch main attendance
        setLateApprovals(prev => prev.filter(r => r._id !== id));
        fetchStats(false);
      }
    } catch (err) {
      console.error('Approve failed:', err);
    } finally {
      setApprovalProcessing(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal) return;
    setApprovalProcessing(rejectModal.id);
    try {
      const res = await api.put(`/admin/attendance/late-approvals/${rejectModal.id}/reject`, {
        rejectionReason: rejectReason
      });
      if (res.data.success) {
        setLateApprovals(prev => prev.filter(r => r._id !== rejectModal.id));
        fetchStats(false);
      }
    } catch (err) {
      console.error('Reject failed:', err);
    } finally {
      setApprovalProcessing(null);
      setRejectModal(null);
      setRejectReason('');
    }
  };
  // ─────────────────────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await api.get(`/admin/attendance/all?date=${filters.date}`);
      if (res.data.success) {
        setRawRecords(res.data.records || []);
      }
    } catch (err) {
      console.error('Error fetching stats and reports:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.date]);

  useEffect(() => {
    fetchStats(false);
  }, [fetchStats, refreshKey]);

  // Removed socket effect

  useEffect(() => {
    if (!rawRecords.length) {
      setStats({ totalEmployees: 0, presentToday: 0, halfDayToday: 0, absentToday: 0, lateToday: 0, leavesToday: 0 });
      setData({ reports: [], totalEntries: 0 });
      return;
    }

    let statsRecords = rawRecords.map(r => {
      let stat = r.status || 'Absent';
      
      const dateObj = new Date(filters.date);
      const isSunday = dateObj.getDay() === 0;
      const isHoliday = holidays.some(h => h.holidayDate === filters.date);
      
      const hasCheckedIn = r.checkIn && r.checkIn !== "00:00" && r.checkIn !== "1970-01-01T00:00:00.000Z";

      // If an explicit status exists and is not 'Pending' or 'Absent', use it
      // Otherwise fallback to Holiday, Weekend, or Absent
      if (r.checkInApprovalStatus === 'Approved') {
        stat = 'Present';
      } else if (r.checkInApprovalStatus === 'Rejected') {
        stat = 'Absent';
      } else if (r.status && r.status !== 'Pending' && r.status !== 'Absent') {
        stat = r.status;
      } else if (isHoliday) {
        stat = 'Holiday';
      } else if (isSunday) {
        stat = 'Weekend';
      } else if (stat === 'On Leave' || stat === 'Approved') {
        stat = 'On Leave';
      } else if (r.status === 'Absent') {
        stat = 'Absent';
      } else {
        stat = 'Absent';
      }

      return { ...r, calculatedStatus: stat };
    });

    if (filters.department !== 'All Departments') {
      statsRecords = statsRecords.filter(r => {
        const fullEmp = allEmployees.find(e => e._id === (r.employeeId?._id || r.employeeId));
        const empDept = fullEmp?.department || r.employeeId?.department;
        return empDept === filters.department;
      });
    }

    const totalEmployees = statsRecords.length;
    const presentToday = statsRecords.filter(r => r.calculatedStatus === 'Present' || r.calculatedStatus === 'Late').length;
    const halfDayToday = statsRecords.filter(r => r.calculatedStatus === 'Half Day').length;
    const lateToday = statsRecords.filter(r => r.calculatedStatus === 'Late').length;
    const leavesToday = statsRecords.filter(r => r.calculatedStatus === 'On Leave').length;
    const absentToday = statsRecords.filter(r => r.calculatedStatus === 'Absent' || r.calculatedStatus === 'Holiday' || r.calculatedStatus === 'Weekend').length; 
    // ^ Maybe we want to just keep absent count for strictly 'Absent'. Let's adjust:
    const strictAbsentToday = statsRecords.filter(r => r.calculatedStatus === 'Absent').length;

    setStats({ totalEmployees, presentToday, halfDayToday, lateToday, leavesToday, absentToday: strictAbsentToday });

    let gridRecords = statsRecords;
    if (filters.department !== 'All Departments') {
      gridRecords = gridRecords.filter(r => {
        const fullEmp = allEmployees.find(e => e._id === (r.employeeId?._id || r.employeeId));
        const empDept = fullEmp?.department || r.employeeId?.department;
        return empDept === filters.department;
      });
    }
    if (search) {
      gridRecords = gridRecords.filter(r => {
        const fullEmp = allEmployees.find(e => e._id === (r.employeeId?._id || r.employeeId));
        const empName = r.employeeId?.fullName || fullEmp?.fullName || '';
        return empName.toLowerCase().includes(search.toLowerCase());
      });
    }

    setData({
      reports: gridRecords,
      totalEntries: gridRecords.length
    });
  }, [rawRecords, allEmployees, filters.department, search, filters.date, holidays]);


  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const statuses = ['Active', 'Inactive'];

  return (
    <AdminLayout title="Attendance Report" subtitle="View employee attendance logs and performance by date">
      <div className="space-y-8 pb-20">
        
        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-4 bg-transparent mt-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm min-w-[200px]">
            <Calendar size={18} className="text-slate-400 mr-3" />
            <input 
              type="date" 
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="text-sm font-bold text-[#1e293b] bg-transparent outline-none w-full"
            />
          </div>
          
          <CustomDropdown 
            icon={FileText}
            name="department"
            value={filters.department}
            options={departments}
            onChange={handleFilterChange}
          />

          <CustomDropdown 
            name="employeeId"
            value={filters.employeeId}
            options={['All']}
            onChange={handleFilterChange}
          />

          <CustomDropdown 
            name="status"
            value={filters.status}
            options={statuses}
            onChange={handleFilterChange}
          />

          <div className="flex items-center gap-3 ml-auto">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search employee" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none w-64 shadow-sm" 
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard 
            label="Total Employees" 
            value={stats.totalEmployees}
            topBorderClass="border-t-blue-600"
            isActive={selectedStatus === null}
            onClick={() => setSelectedStatus(null)}
          />
          <StatCard 
            label="Present" 
            value={stats.presentToday}
            percentage={stats.totalEmployees > 0 ? Math.round((stats.presentToday / stats.totalEmployees) * 100) : 0}
            topBorderClass="border-t-emerald-500"
            isActive={selectedStatus === 'Present'}
            onClick={() => setSelectedStatus('Present')}
          />
          <StatCard 
            label="Half Day" 
            value={stats.halfDayToday}
            percentage={stats.totalEmployees > 0 ? Math.round((stats.halfDayToday / stats.totalEmployees) * 100) : 0}
            topBorderClass="border-t-sky-500"
            isActive={selectedStatus === 'Half Day'}
            onClick={() => setSelectedStatus('Half Day')}
          />
          <StatCard 
            label="Absent" 
            value={stats.absentToday}
            percentage={stats.totalEmployees > 0 ? Math.round((stats.absentToday / stats.totalEmployees) * 100) : 0}
            topBorderClass="border-t-rose-500"
            isActive={selectedStatus === 'Absent'}
            onClick={() => setSelectedStatus('Absent')}
          />
          <StatCard 
            label="Late Marks" 
            value={stats.lateToday}
            percentage={stats.totalEmployees > 0 ? Math.round((stats.lateToday / stats.totalEmployees) * 100) : 0}
            topBorderClass="border-t-orange-500"
            isActive={selectedStatus === 'Late'}
            onClick={() => setSelectedStatus('Late')}
          />
          <StatCard 
            label="On Leave" 
            value={stats.leavesToday}
            percentage={stats.totalEmployees > 0 ? Math.round((stats.leavesToday / stats.totalEmployees) * 100) : 0}
            topBorderClass="border-t-purple-500"
            isActive={selectedStatus === 'On Leave'}
            onClick={() => setSelectedStatus('On Leave')}
          />
        </div>

        {/* Box Model Grid Data */}
        <div className="bg-transparent overflow-hidden">
           <div className="flex items-center justify-between pb-4">
              <h3 className="text-xl font-black text-[#1e293b]">Date Wise Employee Report</h3>
           </div>

           {loading ? (
             <div className="py-20 text-center text-slate-400 font-bold bg-white rounded-[32px] border border-slate-100 shadow-sm">Loading records...</div>
           ) : (() => {
              const filteredReports = data.reports.filter(report => {
               if (!selectedStatus) return true;
               const stat = report.calculatedStatus;
               if (selectedStatus === 'Present') return stat === 'Present' || stat === 'Late';
               if (selectedStatus === 'Absent') return stat === 'Absent';
               if (selectedStatus === 'Half Day') return stat === 'Half Day';
               if (selectedStatus === 'Late') return stat === 'Late';
               if (selectedStatus === 'On Leave') return stat === 'On Leave';
               return true;
             });

             if (filteredReports.length === 0) {
               return <div className="py-20 text-center text-slate-400 font-bold bg-white rounded-[32px] border border-slate-100 shadow-sm">No reports available for this filter</div>;
             }

             return (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {filteredReports.map((report) => {
                   const displayStatus = report.calculatedStatus || 'Absent';
                   const isAbsent = displayStatus === 'Absent';
                   const fullEmp = allEmployees.find(e => e._id === (report.employeeId?._id || report.employeeId));
                   const empName = report.employeeId?.fullName || fullEmp?.fullName;
                   const empRole = fullEmp?.role || report.employeeId?.role || 'TEAM MEMBER';
                   const empDept = fullEmp?.department || report.employeeId?.department || 'NO DEPARTMENT';
                   
                   return (
                     <div key={report._id} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all relative group cursor-pointer" onClick={() => setSelectedEmployee(report)}>
                       {/* Top Info */}
                       <div className="flex items-start gap-4 mb-6">
                         <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
                           {report.employeeId?.profileImage || fullEmp?.profileImage ? (
                             <img src={report.employeeId?.profileImage || fullEmp?.profileImage} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                           ) : (
                             <span className="text-lg font-black text-slate-500">{empName?.charAt(0)}</span>
                           )}
                         </div>
                         <div className="flex-1 min-w-0">
                           <h4 className="text-[#1e293b] font-black text-base truncate leading-tight">{empName}</h4>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 truncate">
                             MEMBER
                           </p>
                           <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-0.5 truncate">
                             {empRole}
                           </p>
                           <div className="flex items-center gap-1 mt-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             <Briefcase size={10} />
                             <span className="truncate">{empDept}</span>
                           </div>
                         </div>
                       </div>

                       {/* Attendance Data */}
                       <div className="grid grid-cols-2 gap-y-4 gap-x-2 bg-slate-50 rounded-2xl p-4 mb-6">
                         <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Login</p>
                           <p className="text-sm font-bold text-[#1e293b]">
                             {report.checkIn ? new Date(report.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}
                           </p>
                         </div>
                         <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Logout</p>
                           <p className="text-sm font-bold text-[#1e293b]">
                             {report.checkOut ? new Date(report.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}
                           </p>
                         </div>
                         <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                           <p className="text-sm font-bold text-blue-600">{report.workHours || '—'}</p>
                         </div>
                         <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Overtime</p>
                           <p className="text-sm font-bold text-orange-500">{report.overtime || '—'}</p>
                         </div>
                       </div>

                       {/* Bottom Row */}
                       <div className="flex items-center justify-between">
                         <span className="px-3 py-1.5 bg-white border border-slate-200 text-blue-600 rounded-lg text-[10px] font-black tracking-widest shadow-sm">
                           {report.employeeId?.empCode || 'N/A'}
                         </span>
                         
                         <div className="flex items-center gap-2">
                           <span className={`px-4 py-1.5 rounded-[16px] text-[10px] font-black uppercase tracking-widest shadow-sm transition-all ${
                             displayStatus === 'Absent' ? 'bg-[#FDECEC] text-[#E53935]' : 
                             displayStatus === 'Present' ? 'bg-[#E8F8F0] text-[#00A86B]' : 
                             displayStatus === 'Late' ? 'bg-[#FFF3E0] text-[#FB8C00]' : 
                             displayStatus === 'On Leave' ? 'bg-[#F3E8FF] text-[#8E44AD]' : 
                             displayStatus === 'Holiday' ? 'bg-[#EAF4FF] text-[#1E88E5]' : 
                             displayStatus === 'Weekend' ? 'bg-[#F2F2F2] text-[#616161]' : 
                             'bg-[#E8F8F0] text-[#00A86B]' // Default to Present
                           }`}>
                             {displayStatus}
                           </span>
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             );
           })()}
        </div>

        {/* ── Late Check-In Approvals Section ──────────────────────────────── */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Hourglass size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#1e293b]">Late Check-In Approvals</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  {filters.date} · {lateApprovals.length} pending
                </p>
              </div>
            </div>
            {lateApprovals.length > 0 && (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-black rounded-full uppercase tracking-widest animate-pulse">
                {lateApprovals.length} Awaiting
              </span>
            )}
          </div>

          {lateApprovalsLoading ? (
            <div className="p-10 text-center text-slate-400 font-bold">Loading...</div>
          ) : lateApprovals.length === 0 ? (
            <div className="p-10 text-center">
              <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-slate-400 font-bold text-sm">No pending late check-in requests for this date.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {lateApprovals.map((record) => {
                const emp = record.employeeId;
                const checkInTime = record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
                const requestedAt = record.approvalRequestedAt ? new Date(record.approvalRequestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
                const lateMinutes = record.lateMinutes || 0;
                const isProcessing = approvalProcessing === record._id;

                return (
                  <div key={record._id} className="flex flex-col md:flex-row md:items-center gap-4 p-5 hover:bg-amber-50/30 transition-colors">
                    {/* Employee Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
                        {emp?.profileImage ? (
                          <img src={emp.profileImage} className="w-full h-full object-cover" alt={emp?.fullName} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                        ) : (
                          <span className="text-lg font-black text-slate-500">{emp?.fullName?.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-[#1e293b] text-sm truncate">{emp?.fullName}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{emp?.empCode} · {emp?.department}</p>
                      </div>
                    </div>

                    {/* Timing Details */}
                    <div className="flex gap-6 shrink-0">
                      <div className="text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-In</p>
                        <p className="text-sm font-black text-[#1e293b]">{checkInTime}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Late By</p>
                        <p className="text-sm font-black text-amber-600">{lateMinutes > 0 ? `${lateMinutes} min` : '—'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Requested</p>
                        <p className="text-sm font-black text-slate-500">{requestedAt}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                        Pending
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => handleApprove(record._id)}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        <CheckCircle2 size={14} />
                        {isProcessing ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => { setRejectModal({ id: record._id, employeeName: emp?.fullName }); setRejectReason(''); }}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-black hover:bg-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* ── End Late Check-In Approvals ───────────────────────────────────── */}

        {/* Bottom Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-[#1e293b]">Trend</h3>
              <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
                <Search size={14} /> 12 Jun, 12 Jom
                <MoreHorizontal size={14} className="ml-1" />
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="absent" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-6 mt-4">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Present</div>
               <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Absent</div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-[#1e293b]">Department Comparison</h3>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-slate-400">Previous</span>
                <span className="bg-blue-50 text-blue-600 w-6 h-6 flex items-center justify-center rounded-md">1</span>
                <span className="text-slate-400 w-6 h-6 flex items-center justify-center border border-slate-200 rounded-md"><Download size={12}/></span>
                <span className="text-slate-400">4</span>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Employee Detail Modal */}
        {selectedEmployee && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setSelectedEmployee(null)}>
            <div className="bg-[#1e293b] rounded-[24px] w-full max-w-sm shadow-2xl overflow-hidden p-6 text-white relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
               <button onClick={() => setSelectedEmployee(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                 <X size={16} />
               </button>
               
               <h3 className="text-lg font-bold">{selectedEmployee.employeeId?.fullName}</h3>
               <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mt-1 mb-6">
                 <Calendar size={12} /> {selectedEmployee.date?.split('-').reverse().join('-')}
               </div>

               <div className="space-y-4 text-sm font-bold border-b border-white/10 pb-6 mb-4">
                 <div className="flex items-center justify-between">
                   <span className="text-slate-400">Login Time</span>
                   <span>{selectedEmployee.checkIn ? new Date(selectedEmployee.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-slate-400">Logout Time</span>
                   <span>{selectedEmployee.checkOut ? new Date(selectedEmployee.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-slate-400">Break Time</span>
                   <span>45 Min</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-slate-400">Working Hours</span>
                   <span className="text-blue-400">{selectedEmployee.workHours || '—'}</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-slate-400">Overtime</span>
                   <span>{selectedEmployee.overtime || '—'}</span>
                 </div>
               </div>

               <div>
                 <h4 className="text-sm font-bold text-slate-400 mb-3">Tasks Submitted:</h4>
                 <div className="space-y-2 text-sm font-bold">
                   <div className="flex items-center gap-2">
                     <div className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</div>
                     UI Design
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</div>
                     API Integration
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</div>
                     Testing
                   </div>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* ── Reject Reason Modal ──────────────────────────────────────────── */}
        {rejectModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => { setRejectModal(null); setRejectReason(''); }}>
            <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl overflow-hidden p-8 relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }} className="absolute top-4 right-4 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-all">
                <X size={16} className="text-slate-600" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                  <AlertTriangle size={24} className="text-rose-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1e293b]">Reject Late Check-In</h3>
                  <p className="text-xs text-slate-400 font-bold">{rejectModal.employeeName}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Reason for Rejection (Optional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejecting the late check-in request..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 resize-none transition-all"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setRejectModal(null); setRejectReason(''); }}
                  className="flex-1 py-3 border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={approvalProcessing === rejectModal.id}
                  className="flex-1 py-3 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all disabled:opacity-50 shadow-lg shadow-rose-200"
                >
                  {approvalProcessing === rejectModal.id ? 'Rejecting...' : 'Reject Check-In'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminAttendance;
