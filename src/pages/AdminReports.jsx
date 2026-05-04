import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { 
  Users, Clock, Filter, Download, Search, 
  Eye, Calendar, ChevronLeft, ChevronRight, 
  Briefcase, FileText, PieChart, TrendingUp 
} from 'lucide-react';
import { 
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip 
} from 'recharts';
import api from '../services/api';

const COLORS = ['#3b82f6', '#10b981', '#a855f7', '#f43f5e', '#f59e0b', '#64748b'];

const StatCard = ({ icon, label, value, subValue, colorClass }) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
    <div className={`w-14 h-14 ${colorClass} rounded-2xl flex items-center justify-center shadow-sm`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-2xl font-black text-[#1e293b]">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400">{subValue}</p>
    </div>
  </div>
);

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: { totalEmployees: 0, totalHoursToday: '0h 0m', averageHours: '0h 0m', totalOvertimeToday: '0h 0m' },
    reports: [],
    totalEntries: 0,
    summary: [],
    statusCounts: { Completed: 0, Pending: 0, NotSubmitted: 0 }
  });

  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    department: 'All Departments',
    employeeId: 'All Employees',
    status: 'All Status',
    page: 1
  });

  const [search, setSearch] = useState('');
  const [selectedTasks, setSelectedTasks] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [filters.date, filters.department, filters.employeeId, filters.status, filters.page]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      if (search) params.append('search', search);
      const res = await api.get(`/admin/reports/hourly?${params.toString()}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const resetFilters = () => {
    setFilters({
      date: new Date().toISOString().split('T')[0],
      department: 'All Departments',
      employeeId: 'All Employees',
      status: 'All Status',
      page: 1
    });
    setSearch('');
  };

  const fetchEmployeeTasks = async (employeeId, date) => {
    setModalLoading(true);
    setIsModalOpen(true);
    try {
      const res = await api.get(`/employee/tasks/${employeeId}/${date}`);
      if (res.data.success) {
        setSelectedTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDownloadExcel = () => {
    if (data.reports.length === 0) {
      alert('No data available to download');
      return;
    }

    const headers = ['#', 'Employee Name', 'Employee ID', 'Department', 'Date', 'Total Hours', 'Overtime', 'Status'];
    const rows = data.reports.map((r, i) => [
      i + 1,
      r.employeeId?.fullName,
      r.employeeId?.empCode,
      r.employeeId?.department,
      r.date,
      r.workHours,
      r.overtime,
      r.workStatus
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Hourly_Report_${filters.date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const departments = ['All Departments', 'Digital Marketing', 'Web Development', 'SEO', 'HR', 'Others'];

  return (
    <AdminLayout title="Hourly Reports" subtitle="View and download hourly work reports.">
      <div className="space-y-8 pb-20">
        
        {/* Top Header Actions */}
        <div className="flex justify-end gap-4 -mt-20 mb-12 relative z-10">
           <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 rounded-xl text-xs font-bold border border-slate-200 shadow-sm hover:bg-slate-50 transition-all">
             <Filter size={16} /> Filters
           </button>
           <button 
             onClick={handleDownloadExcel}
             className="flex items-center gap-2 px-6 py-3 bg-[#3b82f6] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 transition-all active:scale-95"
           >
             <Download size={16} /> Download Excel
           </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<Users size={24} className="text-blue-600" />} 
            label="Total Employees" 
            value={data.stats.totalEmployees} 
            subValue="Active Employees" 
            colorClass="bg-blue-50"
          />
          <StatCard 
            icon={<Clock size={24} className="text-emerald-600" />} 
            label="Total Hours Today" 
            value={data.stats.totalHoursToday} 
            subValue="Logged Hours" 
            colorClass="bg-emerald-50"
          />
          <StatCard 
            icon={<TrendingUp size={24} className="text-violet-600" />} 
            label="Average Hours" 
            value={data.stats.averageHours} 
            subValue="Per Employee" 
            colorClass="bg-violet-50"
          />
          <StatCard 
            icon={<Clock size={24} className="text-orange-500" />} 
            label="Overtime Hours" 
            value={data.stats.totalOvertimeToday} 
            subValue="Total Overtime" 
            colorClass="bg-orange-50"
          />
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="date" 
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-blue-500/10" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                <select 
                  name="department"
                  value={filters.department}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#1e293b] focus:outline-none"
                >
                  {departments.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee</label>
                <select 
                  name="employeeId"
                  value={filters.employeeId}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#1e293b] focus:outline-none"
                >
                  <option>All Employees</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                <select 
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#1e293b] focus:outline-none"
                >
                  <option>All Status</option>
                  <option>Completed</option>
                  <option>Pending</option>
                </select>
              </div>
              <div className="flex items-end gap-3">
                 <button onClick={fetchReports} className="flex-1 py-3 bg-[#3b82f6] text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                   <Search size={14} /> Apply Filters
                 </button>
                 <button onClick={resetFilters} className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all">
                   <TrendingUp size={16} />
                 </button>
              </div>
           </div>
        </div>

        {/* Main Content Area */}
        {/* Today's Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Today's Summary (Donut) */}
           <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 flex items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <PieChart size={20} />
                  </div>
                  <h3 className="text-lg font-black text-[#1e293b]">Today's Summary</h3>
                </div>
                <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                   {data.summary.map((item, idx) => (
                      <div key={item.name} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                            <span className="text-xs font-bold text-slate-500">{item.name}</span>
                         </div>
                         <span className="text-xs font-black text-[#1e293b]">{item.hours}</span>
                      </div>
                   ))}
                </div>
              </div>

              <div className="w-48 h-48 relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                       <Pie
                          data={data.summary.length > 0 ? data.summary : [{ name: 'No Data', minutes: 1 }]}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={5}
                          dataKey="minutes"
                       >
                          {data.summary.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                       </Pie>
                    </RePieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-xl font-black text-[#1e293b] leading-tight">{data.stats.totalHoursToday}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Hours</p>
                 </div>
              </div>
           </div>

           {/* Report Status */}
           <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
              <h3 className="text-lg font-black text-[#1e293b] mb-8">Submission Status</h3>
              <div className="grid grid-cols-1 gap-4">
                 {[
                   { label: 'Completed', count: data.statusCounts.Completed, color: 'bg-emerald-500', total: data.stats.totalEmployees },
                   { label: 'Pending', count: data.statusCounts.Pending, color: 'bg-orange-500', total: data.stats.totalEmployees },
                   { label: 'Not Submitted', count: data.statusCounts.NotSubmitted, color: 'bg-rose-500', total: data.stats.totalEmployees }
                 ].map(status => {
                   const percentage = status.total > 0 ? (status.count / status.total) * 100 : 0;
                   return (
                     <div key={status.label} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{status.label}</p>
                           <p className="text-[10px] font-black text-[#1e293b] uppercase tracking-widest">{status.count} ({percentage.toFixed(1)}%)</p>
                        </div>
                        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                           <div className={`h-full ${status.color} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                        </div>
                     </div>
                   );
                 })}
              </div>
           </div>

           {/* Download & Actions */}
           <div className="bg-[#0f172a] rounded-[40px] p-8 text-white shadow-xl shadow-slate-200 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
              <h3 className="text-lg font-black mb-6 relative z-10">Export Center</h3>
              <div className="space-y-3 relative z-10">
                 <button onClick={handleDownloadExcel} className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl transition-all">
                    <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center">
                       <Download size={16} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Download Full Excel</span>
                 </button>
                 <button className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl transition-all">
                    <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
                       <FileText size={16} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Custom Range</span>
                 </button>
              </div>
           </div>
        </div>

        {/* Full Width Report List */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-black text-[#1e293b]">Hourly Report List</h3>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Detailed breakdown of employee work logs</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="relative">
                   <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                     type="text" 
                     placeholder="Search employee name or ID..." 
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none w-72 focus:ring-4 focus:ring-blue-500/5 transition-all" 
                   />
                 </div>
                 <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 border border-slate-100 transition-all">
                   <Filter size={18} />
                 </button>
                 <button onClick={handleDownloadExcel} className="flex items-center gap-2 px-6 py-3 bg-[#3b82f6] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-600 transition-all active:scale-95">
                   <Download size={16} /> Export
                 </button>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee Name</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee ID</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Hours</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Overtime</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted At</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan="10" className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading records...</p>
                          </div>
                        </td>
                      </tr>
                    ) : data.reports.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-3 opacity-20">
                            <FileText size={64} />
                            <p className="text-sm font-bold uppercase tracking-widest">No reports available</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data.reports.map((report, idx) => (
                        <tr key={report._id} className="hover:bg-slate-50/50 transition-all group">
                           <td className="px-8 py-5 text-xs font-bold text-slate-400">{(filters.page - 1) * 8 + idx + 1}</td>
                           <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-[11px] text-slate-600 border-2 border-white shadow-sm overflow-hidden group-hover:scale-110 transition-transform">
                                    {report.employeeId?.profileImage ? (
                                      <img src={report.employeeId.profileImage} className="w-full h-full object-cover" />
                                    ) : report.employeeId?.fullName?.charAt(0)}
                                 </div>
                                 <span className="text-sm font-black text-[#1e293b]">{report.employeeId?.fullName}</span>
                              </div>
                           </td>
                           <td className="px-8 py-5 text-xs font-bold text-slate-500">{report.employeeId?.empCode}</td>
                           <td className="px-8 py-5">
                              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                {report.employeeId?.department}
                              </span>
                           </td>
                           <td className="px-8 py-5 text-xs font-bold text-slate-500">{report.date}</td>
                           <td className="px-8 py-5 text-sm font-black text-[#1e293b]">{report.workHours}</td>
                           <td className="px-8 py-5 text-xs font-bold text-slate-400">{report.overtime}</td>
                           <td className="px-8 py-5 text-xs font-bold text-slate-400">
                             {report.updatedAt ? new Date(report.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--'}
                           </td>
                           <td className="px-8 py-5">
                              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                report.workStatus === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                              }`}>
                                {report.workStatus}
                              </span>
                           </td>
                           <td className="px-8 py-5">
                              <div className="flex items-center gap-3">
                                 <button 
                                   onClick={() => fetchEmployeeTasks(report.employeeId._id, report.date)}
                                   className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                                 >
                                    <Eye size={18} />
                                 </button>
                                 <button className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100">
                                    <Download size={18} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                      ))
                    )}
                 </tbody>
              </table>
           </div>

           {/* Pagination */}
           <div className="p-8 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Showing 1 to {data.reports.length} of {data.totalEntries} entries
              </p>
              <div className="flex items-center gap-2">
                 <button className="p-2.5 text-slate-400 hover:bg-white hover:text-[#1e293b] rounded-xl transition-all border border-transparent hover:border-slate-200">
                   <ChevronLeft size={20} />
                 </button>
                 {[1, 2, 3].map(p => (
                   <button 
                     key={p} 
                     onClick={() => setFilters({...filters, page: p})}
                     className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                       filters.page === p ? 'bg-[#3b82f6] text-white shadow-xl shadow-blue-200' : 'text-slate-400 hover:bg-white hover:border-slate-200 border border-transparent'
                     }`}
                   >
                     {p}
                   </button>
                 ))}
                 <button className="p-2.5 text-slate-400 hover:bg-white hover:text-[#1e293b] rounded-xl transition-all border border-transparent hover:border-slate-200">
                   <ChevronRight size={20} />
                 </button>
              </div>
           </div>
        </div>

        {/* Task Details Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#1e293b]">Hourly Work Details</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Detailed task logs for the selected date</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
               </div>
               
               <div className="p-8 max-h-[60vh] overflow-y-auto">
                  {modalLoading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Fetching tasks...</p>
                    </div>
                  ) : selectedTasks && selectedTasks.length > 0 ? (
                    <div className="space-y-4">
                       {selectedTasks.map((task, idx) => (
                         <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 text-blue-500 font-black text-xs shadow-sm flex-shrink-0">
                               {task.slotKey.split(' - ')[0]}
                            </div>
                            <div className="flex-1">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{task.slotKey}</p>
                               <h4 className="text-sm font-bold text-[#1e293b] leading-relaxed">{task.title}</h4>
                            </div>
                            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-100">
                               DONE
                            </div>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center opacity-20">
                       <Clock size={64} className="mx-auto mb-4" />
                       <p className="text-sm font-bold uppercase tracking-widest">No tasks logged for this day</p>
                    </div>
                  )}
               </div>

               <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-3 bg-[#1e293b] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-200 active:scale-95 transition-all"
                  >
                    Close Details
                  </button>
               </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

const X = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default AdminReports;
