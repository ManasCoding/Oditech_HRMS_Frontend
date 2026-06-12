import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { 
  Users, Clock, Search, Calendar, MoreHorizontal,
  ChevronLeft, ChevronRight, X, Download, FileText,
  UserCheck, Briefcase, Eye
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import api from '../services/api';
import CustomDropdown from '../components/CustomDropdown';

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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0, presentToday: 0, halfDayToday: 0, absentToday: 0, lateToday: 0, leavesToday: 0
  });
  const [data, setData] = useState({
    reports: [],
    totalEntries: 0
  });

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

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [filters.date]);

  useEffect(() => {
    if (!rawRecords.length) {
      setStats({ totalEmployees: 0, presentToday: 0, halfDayToday: 0, absentToday: 0, lateToday: 0, leavesToday: 0 });
      setData({ reports: [], totalEntries: 0 });
      return;
    }

    let statsRecords = rawRecords;
    if (filters.department !== 'All Departments') {
      statsRecords = statsRecords.filter(r => {
        const fullEmp = allEmployees.find(e => e._id === (r.employeeId?._id || r.employeeId));
        const empDept = fullEmp?.department || r.employeeId?.department;
        return empDept === filters.department;
      });
    }

    const totalEmployees = statsRecords.length;
    const presentToday = statsRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const halfDayToday = statsRecords.filter(r => r.status === 'Half Day').length;
    const lateToday = statsRecords.filter(r => r.status === 'Late').length;
    const leavesToday = statsRecords.filter(r => r.status === 'On Leave').length;
    const absentToday = statsRecords.filter(r => r.status === 'Absent').length;
    setStats({ totalEmployees, presentToday, halfDayToday, lateToday, leavesToday, absentToday });

    let gridRecords = rawRecords;
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
  }, [rawRecords, allEmployees, filters.department, search]);

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

  const fetchStats = async () => {
    setLoading(true);
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
  };

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
               const stat = report.status;
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
                   const displayStatus = report.status || 'Present';
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
                             <img src={report.employeeId?.profileImage || fullEmp?.profileImage} className="w-full h-full object-cover" />
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
                           <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${
                             isAbsent ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                           }`}>
                             {displayStatus}
                           </span>
                           
                           {/* Actions */}
                           <div className="relative" onClick={(e) => e.stopPropagation()}>
                             <button 
                               onClick={() => setSelectedActionRow(selectedActionRow === report._id ? null : report._id)}
                               className="w-8 h-8 bg-slate-100 text-slate-500 hover:bg-[#1e293b] hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm"
                             >
                               <MoreHorizontal size={14} />
                             </button>
                             {selectedActionRow === report._id && (
                               <div className="absolute right-0 bottom-full mb-2 z-50 w-48 bg-[#1e293b] rounded-2xl shadow-2xl p-2 text-white">
                                 <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all">
                                    <Eye size={14} className="text-blue-400" /> View Details
                                 </button>
                                 <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all">
                                    <Download size={14} className="text-emerald-400" /> Download PDF
                                 </button>
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             );
           })()}
        </div>

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

      </div>
    </AdminLayout>
  );
};

export default AdminAttendance;
