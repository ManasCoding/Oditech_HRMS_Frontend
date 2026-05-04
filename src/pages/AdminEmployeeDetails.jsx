import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  Phone,
  Briefcase,
  User,
  MapPin,
  Save,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Plane,
  Download,
  ChevronLeft,
  BadgeCheck,
  Plus,
  MoreVertical,
  Edit3,
  Lock,
  X,
  Eye,
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import AdminWeeklyTimesheet from '../components/AdminWeeklyTimesheet';
import api from '../services/api';

const AdminEmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showDocModal, setShowDocModal] = useState(false);
  const [docUploadLoading, setDocUploadLoading] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', category: 'Identity Proof' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    password: '',
    status: ''
  });

  // Global Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveRecords, setLeaveRecords] = useState([]);

  useEffect(() => {
    if (id) {
      fetchEmployeeDetails();
      fetchRealStats();
    }
  }, [id, currentMonth, currentYear]);

  const fetchEmployeeDetails = async () => {
    try {
      const res = await api.get(`/admin/employees`);
      if (res.data.success) {
        const found = res.data.employees.find(emp => emp._id === id) ||
          (await api.get('/admin/employees/ex')).data.employees.find(emp => emp._id === id);
        setEmployee(found);
        setEditForm({
          fullName: found.fullName || '',
          email: found.email || '',
          phone: found.phone || '',
          department: found.department || '',
          role: found.role || '',
          password: found.password || '',
          status: found.status || 'Active'
        });
      }
    } catch (err) {
      console.error('Error fetching employee:', err);
    } finally {
      setLoading(false);
    }
  };

  const [documents, setDocuments] = useState([]);
  const [loginLogs, setLoginLogs] = useState([]);
  const [hourlyReports, setHourlyReports] = useState([]);
  const [showWeeklyDetail, setShowWeeklyDetail] = useState(false);

  const fetchRealStats = async () => {
    try {
      const m = currentMonth + 1;
      const [statsRes, logsRes, leavesRes, docsRes, activityRes, hourlyRes] = await Promise.all([
        api.get(`/employee/stats/${id}?month=${m}&year=${currentYear}`),
        api.get(`/employee/attendance/log/${id}?month=${m}&year=${currentYear}`),
        api.get('/admin/leaves'),
        api.get(`/admin/documents/${id}`),
        api.get(`/admin/activity-logs/${id}`),
        api.get(`/admin/reports/hourly/${id}?month=${m}&year=${currentYear}`)
      ]);

      if (statsRes.data.success) setAttendanceStats(statsRes.data.stats);
      if (logsRes.data.success) setAttendanceRecords(logsRes.data.records);
      if (leavesRes.data.success) {
        // Filter leaves for this employee
        const myLeaves = leavesRes.data.leaves.filter(l => l.employeeId?._id === id || l.employeeId === id);
        setLeaveRecords(myLeaves);
      }
      if (docsRes.data.success) setDocuments(docsRes.data.documents);
      if (activityRes.data.success) setLoginLogs(activityRes.data.logs);
      if (hourlyRes.data.success) setHourlyReports(hourlyRes.data.reports);
    } catch (err) {
      console.error('Error fetching real stats:', err);
    }
  };

  const handleUploadDoc = async () => {
    if (!selectedFile || !newDoc.title) return;
    setDocUploadLoading(true);
    try {
      // 1. Upload to Cloudinary first
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Use the dedicated admin document upload endpoint
      const uploadRes = await api.post('/admin/documents/upload-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadRes.data.success) {
        const fileUrl = uploadRes.data.url;
        const fileType = selectedFile.type.split('/')[1] || 'pdf';
        const fileSize = (selectedFile.size / (1024 * 1024)).toFixed(1) + ' MB';

        const saveRes = await api.post('/admin/documents', {
          employeeId: id,
          title: newDoc.title,
          category: newDoc.category,
          fileUrl,
          fileType,
          fileSize
        });

        if (saveRes.data.success) {
          setDocuments([saveRes.data.document, ...documents]);
          setShowDocModal(false);
          setNewDoc({ title: '', category: 'Identity Proof' });
          setSelectedFile(null);
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload document');
    } finally {
      setDocUploadLoading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      const res = await api.delete(`/admin/documents/${docId}`);
      if (res.data.success) {
        setDocuments(documents.filter(d => d._id !== docId));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit - reset form
      setEditForm({
        fullName: employee.fullName || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department: employee.department || '',
        role: employee.role || '',
        password: employee.password || '',
        status: employee.status || 'Active'
      });
    }
    setIsEditing(!isEditing);
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await api.put(`/admin/employees/${id}`, editForm);
      if (res.data.success) {
        setEmployee(res.data.employee);
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getDisplayStats = () => {
    if (!attendanceStats) return {
      present: 0, absent: 0, late: 0, leave: 0, workingDays: 0, rate: 0, 
      leavesTotal: 0, leavesApproved: 0, leavesPending: 0, leavesRejected: 0, leavesBalance: 0
    };

    return {
      present: attendanceStats.presentDays,
      absent: attendanceStats.absentDays,
      late: attendanceStats.lateComings,
      leave: attendanceStats.leavesTaken,
      workingDays: attendanceStats.workingDays,
      rate: Math.round((attendanceStats.presentDays / (attendanceStats.workingDays || 1)) * 100),
      leavesTotal: attendanceStats.totalLeaveQuota,
      leavesTakenYearly: attendanceStats.leavesTakenYearly,
      leavesPending: attendanceStats.pendingLeaves,
      leavesBalance: attendanceStats.availableLeaves
    };
  };

  const dynamicStats = getDisplayStats();

  if (loading) return (
    <AdminLayout title="Loading Profile...">
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </AdminLayout>
  );

  if (!employee) return (
    <AdminLayout title="Error">
      <div className="text-center py-20">
        <AlertCircle size={64} className="text-rose-500 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-slate-800">Profile Not Found</h2>
        <button onClick={() => navigate('/admin/dashboard')} className="mt-6 px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20">Return to Dashboard</button>
      </div>
    </AdminLayout>
  );

  const tabs = ['Overview', 'Attendance', 'Leaves', 'Late Marks', 'Login History', 'Document', 'Timesheet'];

  return (
    <AdminLayout title="Profile Deep-Dive" hideHeader={true}>
      {/* Navigation & Header */}
      <div className="mb-4 flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin/employees')}
          className="group flex items-center gap-2 px-3 py-1.5 bg-white border border-border rounded-xl shadow-sm hover:shadow-md transition-all text-slate-500 hover:text-primary active:scale-95"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          <span className="text-[8px] font-black uppercase tracking-widest">Back</span>
        </button>
        <div className="flex items-center gap-3">
           {!isEditing ? (
             <button 
               onClick={handleEditToggle}
               className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
             >
               <Edit3 size={14} /> Edit Profile
             </button>
           ) : (
             <div className="flex items-center gap-2">
               <button 
                 onClick={handleEditToggle}
                 className="flex items-center gap-2 px-4 py-1.5 bg-white border border-border text-slate-500 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
               >
                 <X size={14} /> Cancel
               </button>
               <button 
                 onClick={handleSave}
                 disabled={saving}
                 className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100 disabled:opacity-50"
               >
                 {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={14} />}
                 {saving ? 'Saving...' : 'Save Changes'}
               </button>
             </div>
           )}
        </div>
      </div>

      {success && (
        <div className="mb-6 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-3xl flex items-center gap-3">
            <CheckCircle2 size={20} />
            <p className="text-xs font-black uppercase tracking-widest">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-3xl flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-xs font-black uppercase tracking-widest">{error}</p>
          </div>
        </div>
      )}

      {/* Header Profile Section */}
      <div className="bg-white rounded-[40px] border border-border shadow-sm p-10 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-sky-400"></div>
        <div className="flex flex-col xl:flex-row items-center gap-10">
          <div className="relative group">
            <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-slate-50 shadow-2xl transition-transform group-hover:scale-105 duration-500">
              {employee.profileImage ? (
                <img src={employee.profileImage} alt={employee.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-primary text-5xl font-black">
                  {employee.fullName[0]}
                </div>
              )}
            </div>
            <div className={`absolute -bottom-2 -right-2 w-10 h-10 ${employee.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'} border-4 border-white rounded-full flex items-center justify-center shadow-lg`}>
              {employee.status === 'Active' ? <CheckCircle2 size={18} className="text-white" /> : <XCircle size={18} className="text-white" />}
            </div>

          </div>

          <div className="flex-1 text-center xl:text-left">
            <div className="flex items-center justify-center xl:justify-start gap-3 mb-2">
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">{employee.fullName}</h1>
              <BadgeCheck className="text-sky-500 fill-sky-500/10" size={28} />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center xl:justify-start gap-4 mb-4">
              <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 min-w-[120px]">
                <User size={16} className="text-primary flex-shrink-0" />
                <div className="flex flex-col leading-tight">
                  {(employee.role || 'Software Engineer').split(' ').map((word, i) => (
                    <span key={i} className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{word}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 min-w-[120px]">
                <Briefcase size={16} className="text-sky-500 flex-shrink-0" />
                <div className="flex flex-col leading-tight">
                  {employee.department.split(' ').map((word, i) => (
                    <span key={i} className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{word}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-block px-5 py-2 bg-slate-50 text-slate-600 rounded-full text-xs font-black uppercase tracking-widest border border-slate-100 shadow-sm">
                {employee.empCode}
              </span>
              {!isEditing ? (
                <span className={`inline-block px-5 py-2 ${employee.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'} rounded-full text-xs font-black uppercase tracking-widest border shadow-sm`}>
                  {employee.status}
                </span>
              ) : (
                <select 
                  value={editForm.status} 
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="px-5 py-2 bg-white text-slate-800 rounded-full text-xs font-black uppercase tracking-widest border border-primary/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/10"
                >
                  <option value="Active">Active</option>
                  <option value="Ex-Employee">Ex-Employee</option>
                </select>
              )}
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 bg-slate-50/50 p-8 rounded-[32px] border border-slate-100 w-full xl:w-auto">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400 border border-slate-100"><Mail size={18} /></div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                {!isEditing ? (
                  <p className="text-sm font-black text-slate-700">{employee.email}</p>
                ) : (
                  <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none focus:border-primary" />
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400 border border-slate-100"><Phone size={18} /></div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                {!isEditing ? (
                  <p className="text-sm font-black text-slate-700">{employee.phone || '+91 98765 43210'}</p>
                ) : (
                  <input type="text" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none focus:border-primary" />
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400 border border-slate-100"><Briefcase size={18} /></div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                {!isEditing ? (
                  <p className="text-sm font-black text-slate-700">{employee.department}</p>
                ) : (
                  <select value={editForm.department} onChange={(e) => setEditForm({...editForm, department: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none focus:border-primary">
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Human Resources</option>
                    <option>Marketing</option>
                    <option>Product</option>
                    <option>Finance</option>
                    <option>Analytics</option>
                    <option>Sales</option>
                    <option>Quality Assurance</option>
                    <option>IT Support</option>
                    <option>Management</option>
                  </select>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400 border border-slate-100"><BadgeCheck size={18} /></div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Designation / Role</p>
                {!isEditing ? (
                  <p className="text-sm font-black text-slate-700">{employee.role}</p>
                ) : (
                  <input type="text" value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none focus:border-primary" />
                )}
              </div>
            </div>
            {isEditing && (
              <div className="flex items-center gap-4 col-span-2 mt-2 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
                <div className="w-10 h-10 bg-violet-50 text-violet-500 rounded-xl flex items-center justify-center shadow-sm border border-violet-100"><Lock size={18} /></div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest">Login Password</p>
                  <input type="text" value={editForm.password} onChange={(e) => setEditForm({...editForm, password: e.target.value})} className="w-full bg-white border border-violet-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 transition-all" placeholder="Update password" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 flex items-center gap-8 border-b border-slate-100 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full animate-in fade-in duration-300"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Overview' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="bg-white rounded-[40px] border border-border shadow-sm p-10">
              <h3 className="text-lg font-black text-slate-800 mb-8">Summary <span className="text-slate-400 font-bold">(This Month)</span></h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/50 rounded-3xl border border-emerald-50 flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md shadow-emerald-200"><CheckCircle2 size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Present</p>
                    <p className="text-lg font-black text-slate-800">{dynamicStats.present} <span className="text-xs text-slate-400">Days</span></p>
                  </div>
                </div>
                <div className="p-4 bg-rose-50/50 rounded-3xl border border-rose-50 flex items-center gap-4">
                  <div className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md shadow-rose-200"><XCircle size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Absent</p>
                    <p className="text-lg font-black text-slate-800">{dynamicStats.absent} <span className="text-xs text-slate-400">Days</span></p>
                  </div>
                </div>
                <div className="p-4 bg-violet-50/50 rounded-3xl border border-violet-50 flex items-center gap-4">
                  <div className="w-10 h-10 bg-violet-500 text-white rounded-full flex items-center justify-center shadow-md shadow-violet-200"><Calendar size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest">On Leave</p>
                    <p className="text-lg font-black text-slate-800">{dynamicStats.leave} <span className="text-xs text-slate-400">Day</span></p>
                  </div>
                </div>
                <div className="p-4 bg-orange-50/50 rounded-3xl border border-orange-50 flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-md shadow-orange-200"><Clock size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Late Marks</p>
                    <p className="text-lg font-black text-slate-800">{dynamicStats.late} <span className="text-xs text-slate-400">Day</span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[40px] border border-border shadow-sm p-10 flex flex-col">
              <h3 className="text-lg font-black text-slate-800 mb-8">Monthly Attendance Overview</h3>
              <div className="flex-1 flex items-center gap-4">
                <div className="w-1/2 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Present', value: dynamicStats.present, color: '#10b981' },
                          { name: 'Absent', value: dynamicStats.absent, color: '#ef4444' },
                          { name: 'Late', value: dynamicStats.late, color: '#f59e0b' },
                          { name: 'Leave', value: dynamicStats.leave, color: '#8b5cf6' },
                        ]}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: 'Present', value: dynamicStats.present, color: '#10b981' },
                          { name: 'Absent', value: dynamicStats.absent, color: '#ef4444' },
                          { name: 'Late', value: dynamicStats.late, color: '#f59e0b' },
                          { name: 'Leave', value: dynamicStats.leave, color: '#8b5cf6' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-4">
                  {['Present', 'Absent', 'Late', 'Leave'].map((name, i) => (
                    <div key={name} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6'][i] }}></div>
                        <span className="text-xs font-black text-slate-500 uppercase tracking-tighter">{name}</span>
                      </div>
                      <span className="text-xs font-black text-slate-800">{(i === 0 ? 75 : i === 1 ? 15 : 5)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-[32px] border border-border shadow-sm p-8 flex items-center justify-between group hover:border-primary transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary transition-transform group-hover:scale-110"><Calendar size={24} /></div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">This Month Working Days</p>
                    <p className="text-xl font-black text-slate-800">{dynamicStats.workingDays} Days</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{monthNames[currentMonth].slice(0,3)} {currentYear}</p>
                  </div>
                </div>
                <ChevronRight className="text-slate-200 group-hover:text-primary transition-colors" />
              </div>

              <div className="bg-white rounded-[32px] border border-border shadow-sm p-8 flex items-center justify-between group hover:border-emerald-500 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 transition-all group-hover:scale-110 shadow-lg shadow-emerald-50"><TrendingUp size={28} /></div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Attendance Rate</p>
                    <p className="text-2xl font-black text-emerald-600">{dynamicStats.rate}%</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">Performance: GOOD</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="text-slate-200 group-hover:text-emerald-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Attendance' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-[32px] border border-border shadow-sm group hover:border-emerald-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Calendar size={22} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Present</p>
                  <p className="text-xl font-black text-slate-800">{dynamicStats.present} Days</p>
                  <p className="text-[10px] font-bold text-emerald-500">{dynamicStats.rate}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-border shadow-sm group hover:border-rose-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Calendar size={22} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Absent</p>
                  <p className="text-xl font-black text-slate-800">{dynamicStats.absent} Days</p>
                  <p className="text-[10px] font-bold text-rose-500">{Math.round((dynamicStats.absent / (dynamicStats.workingDays || 1)) * 100)}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-border shadow-sm group hover:border-orange-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Clock size={22} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Late</p>
                  <p className="text-xl font-black text-slate-800">{dynamicStats.late} Days</p>
                  <p className="text-[10px] font-bold text-orange-500">{Math.round((dynamicStats.late / (dynamicStats.workingDays || 1)) * 100)}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-border shadow-sm group hover:border-violet-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-50 text-violet-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Plane size={22} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">On Leave</p>
                  <p className="text-xl font-black text-slate-800">{dynamicStats.leave} Days</p>
                  <p className="text-[10px] font-bold text-violet-500">{Math.round((dynamicStats.leave / (dynamicStats.workingDays || 1)) * 100)}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-border shadow-sm group hover:border-primary/20 transition-all bg-slate-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Briefcase size={22} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Working Days</p>
                  <p className="text-xl font-black text-slate-800">{dynamicStats.workingDays} Days</p>
                  <p className="text-[10px] font-bold text-slate-400">{monthNames[currentMonth].slice(0,3)} {currentYear}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-4 bg-white rounded-[40px] border border-border shadow-sm p-10">
              <div className="flex items-center justify-between mb-10">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronLeft size={20} /></button>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">{monthNames[currentMonth]} {currentYear}</h3>
                <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronRight size={20} /></button>
              </div>
              <div className="grid grid-cols-7 gap-y-6 text-center mb-10">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <span key={day} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</span>
                ))}
                {[...Array(30)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all ${[1,2,3,4,7,8,9,14,15,16,17,20,22,23,24,25,29,30].includes(i+1) ? 'bg-emerald-50 text-emerald-600' : [10].includes(i+1) ? 'bg-orange-50 text-orange-600' : [21].includes(i+1) ? 'bg-violet-50 text-violet-600' : [18].includes(i+1) ? 'bg-rose-50 text-rose-600' : 'text-slate-200'}`}>{i+1}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 pt-8 border-t border-slate-50">
                {['Present', 'Absent', 'Late', 'Leave'].map((st, i) => (
                  <div key={st} className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <div className={`w-2 h-2 rounded-full ${['bg-emerald-500', 'bg-rose-500', 'bg-orange-500', 'bg-violet-500'][i]}`}></div> {st}
                  </div>
                ))}
              </div>
            </div>

            <div className="xl:col-span-8 bg-white rounded-[40px] border border-border shadow-sm overflow-hidden flex flex-col">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800">Attendance Records <span className="text-slate-400 font-bold">({monthNames[currentMonth]})</span></h3>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 border border-slate-100 transition-all"><Download size={16} /> Export</button>
              </div>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      {['Date', 'Day', 'Status', 'Check In', 'Check Out', 'Work Hours', 'Note'].map(head => (
                        <th key={head} className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{head}</th>
                      ))}
                    </tr>
                  </thead>
                   <tbody className="divide-y divide-slate-50">
                    {attendanceRecords.length > 0 ? (
                      attendanceRecords.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/40 transition-colors group">
                          <td className="px-10 py-1.5 text-[11px] font-black text-slate-700 whitespace-nowrap leading-none">
                            {new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-10 py-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            {new Date(row.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </td>
                          <td className="px-10 py-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border ${
                              row.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                              row.status === 'Late' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                              row.status === 'Half Day' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                              'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-10 py-1.5 text-[11px] font-black text-slate-700">
                            {row.checkIn ? new Date(row.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </td>
                          <td className="px-10 py-1.5 text-[11px] font-black text-slate-700">
                            {row.checkOut ? new Date(row.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </td>
                          <td className="px-10 py-1.5 text-[11px] font-black text-primary">{row.workHours || '--'}</td>
                          <td className="px-10 py-1.5 text-[9px] font-bold text-slate-400 tracking-tight">—</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-10 py-10 text-center text-slate-400 text-xs font-bold italic">No attendance records for this month.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Leaves' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* High-Fidelity Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-[32px] border border-border shadow-sm group hover:border-violet-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-50 text-violet-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Calendar size={22} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Leaves</p>
                  <p className="text-xl font-black text-slate-800">{dynamicStats.leavesTotal} Days</p>
                  <p className="text-[10px] font-bold text-slate-300">Taken this year</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-border shadow-sm group hover:border-emerald-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><CheckCircle2 size={22} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yearly Taken</p>
                  <p className="text-xl font-black text-slate-800">{dynamicStats.leavesTakenYearly} Days</p>
                  <p className="text-[10px] font-bold text-emerald-500">{Math.round((dynamicStats.leavesTakenYearly / (dynamicStats.leavesTotal || 1)) * 100)}% Used</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-border shadow-sm group hover:border-orange-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Clock size={22} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</p>
                  <p className="text-xl font-black text-slate-800">{dynamicStats.leavesPending} Requests</p>
                  <p className="text-[10px] font-bold text-orange-500">Awaiting Approval</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-border shadow-sm group hover:border-rose-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><XCircle size={22} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leave Rate</p>
                  <p className="text-xl font-black text-slate-800">{dynamicStats.leave} Days</p>
                  <p className="text-[10px] font-bold text-rose-500">This month</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-border shadow-sm group hover:border-primary/20 transition-all bg-slate-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Calendar size={22} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance Leaves</p>
                  <p className="text-xl font-black text-slate-800">{dynamicStats.leavesBalance} Days</p>
                  <p className="text-[10px] font-bold text-slate-400">Available</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Leave Records Section */}
            <div className="xl:col-span-8 bg-white rounded-[40px] border border-border shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Leave Records</h3>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-[#0061ff] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-200">
                  <Plus size={16} /> Apply Leave
                </button>
              </div>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      {['Leave Type', 'From Date', 'To Date', 'Duration', 'Reason', 'Status', 'Applied On', 'Action'].map(head => (
                        <th key={head} className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{head}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {leaveRecords.length > 0 ? (
                      leaveRecords.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/40 transition-colors group">
                          <td className="px-6 py-1.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-7.5 h-7.5 ${row.type === 'Sick' ? 'bg-orange-400' : 'bg-violet-500'} rounded-lg flex items-center justify-center shadow-sm`}>
                                {row.type === 'Sick' ? <Briefcase size={13} className="text-white" /> : <Calendar size={13} className="text-white" />}
                              </div>
                              <span className="text-[11px] font-black text-slate-700">{row.type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-1.5 text-[10px] font-black text-slate-600">{new Date(row.fromDate).toLocaleDateString()}</td>
                          <td className="px-6 py-1.5 text-[10px] font-black text-slate-600">{new Date(row.toDate).toLocaleDateString()}</td>
                          <td className="px-6 py-1.5 text-[11px] font-black text-slate-800">
                            {Math.ceil((new Date(row.toDate) - new Date(row.fromDate)) / (1000 * 60 * 60 * 24)) + 1} Days
                          </td>
                          <td className="px-6 py-1.5 text-[10px] font-bold text-slate-400 max-w-[130px] truncate">{row.reason}</td>
                          <td className="px-6 py-1.5">
                            <span className={`px-2.5 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-widest border ${
                              row.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                              row.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                              'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-1.5 text-[10px] font-black text-slate-400">{new Date(row.appliedOn).toLocaleDateString()}</td>
                          <td className="px-6 py-1.5">
                            <button className="p-1.5 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-lg transition-all"><MoreVertical size={14} /></button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-10 py-10 text-center text-slate-400 text-xs font-bold italic">No leave records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-6 border-t border-slate-50 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {leaveRecords.length > 0 ? 1 : 0} to {leaveRecords.length} of {leaveRecords.length} records</p>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-100 text-slate-400 rounded-lg hover:bg-slate-50 transition-all"><ChevronLeft size={16} /></button>
                  <button className="w-8 h-8 flex items-center justify-center bg-blue-50 border border-blue-100 text-blue-600 rounded-lg text-xs font-black">1</button>
                  <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-100 text-slate-400 rounded-lg hover:bg-slate-50 transition-all"><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>

            {/* Leave Calendar Section */}
            <div className="xl:col-span-4 bg-white rounded-[40px] border border-border shadow-sm p-10">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Leave Calendar</h3>
                <div className="flex items-center gap-2">
                   <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-50 border border-slate-100 rounded-lg transition-colors"><ChevronLeft size={16} /></button>
                   <span className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-700 uppercase tracking-widest">{monthNames[currentMonth]} {currentYear}</span>
                   <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-50 border border-slate-100 rounded-lg transition-colors"><ChevronRight size={16} /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-y-6 text-center mb-12">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <span key={day} className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{day}</span>
                ))}
                {[...Array(30)].map((_, i) => {
                   const day = i + 1;
                   const isCasual = [2, 3, 21].includes(day);
                   const isSick = [10, 11].includes(day);
                   const isAnnual = [15, 16, 17, 18, 19].includes(day);
                   
                   return (
                     <div key={i} className="flex flex-col items-center">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                         isCasual ? 'bg-violet-50 text-violet-600' : 
                         isSick ? 'bg-orange-50 text-orange-600' : 
                         isAnnual ? 'bg-rose-50 text-rose-600' : 
                         'text-slate-700'
                       }`}>
                         {day}
                       </div>
                     </div>
                   );
                })}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 pt-10 border-t border-slate-50">
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-500"></div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Casual Leave</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sick Leave</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Annual Leave</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Late Marks' && (
        <div className="bg-white rounded-[40px] border border-border shadow-sm p-20 text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100"><Clock size={32} className="text-slate-300" /></div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">Late Marks Record</h3>
          <p className="text-slate-500 text-sm font-medium max-w-md mx-auto">This employee has an excellent punctuality record. No significant late marks found for this period.</p>
        </div>
      )}

      {activeTab === 'Document' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
          <div className="bg-white rounded-[32px] border border-border shadow-sm overflow-hidden mb-8">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
               <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Document Upload</h3>
                  <p className="text-slate-400 text-xs font-bold mt-1">Upload all relevant employee documents. Supported formats: PDF, JPG, PNG (Max size: 10MB per file)</p>
               </div>
               <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                 <TrendingUp size={14} className="rotate-90" /> Upload All
               </button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
                {[
                  { title: 'Aadhar Card', required: true, formats: 'PDF, JPG, PNG', size: '10MB', icon: <User size={20} />, color: 'rose' },
                  { title: 'PAN Card', required: true, formats: 'PDF, JPG, PNG', size: '10MB', icon: <Briefcase size={20} />, color: 'blue' },
                  { title: 'Offer Letter', required: true, formats: 'PDF', size: '10MB', icon: <Mail size={20} />, color: 'emerald' },
                  { title: 'Experience Certificate', required: false, formats: 'PDF', size: '10MB', icon: <BadgeCheck size={20} />, color: 'violet' },
                  { title: 'Degree Certificate', required: false, formats: 'PDF, JPG, PNG', size: '10MB', icon: <BadgeCheck size={20} />, color: 'orange' },
                  { title: 'Salary Slips (Latest)', required: false, formats: 'PDF', size: '10MB', icon: <TrendingUp size={20} />, color: 'emerald' },
                  { title: 'Bank Details / Passbook', required: false, formats: 'PDF, JPG, PNG', size: '10MB', icon: <Briefcase size={20} />, color: 'orange' },
                  { title: 'ID Proof (Other)', required: false, formats: 'PDF, JPG, PNG', size: '10MB', icon: <User size={20} />, color: 'sky' },
                  { title: 'Photo', required: false, formats: 'JPG, PNG', size: '5MB', icon: <User size={20} />, color: 'violet' },
                ].map((docType) => {
                  const uploaded = documents.find(d => d.title === docType.title);
                  return (
                    <div key={docType.title} className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col items-center text-center group hover:border-primary/30 transition-all relative">
                      <button className="absolute top-4 right-4 text-slate-300 hover:text-slate-500"><AlertCircle size={14} /></button>
                      
                      <div className={`w-14 h-14 bg-${docType.color}-50 text-${docType.color}-500 rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform`}>
                        {docType.icon}
                      </div>
                      
                      <h4 className="text-[11px] font-black text-slate-800 mb-1 leading-tight">
                        {docType.title} {docType.required && <span className="text-rose-500">*</span>}
                      </h4>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{docType.formats}</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-6">Max {docType.size}</p>
                      
                      {uploaded ? (
                        <div className="w-full space-y-2">
                           <a 
                             href={uploaded.fileUrl} 
                             target="_blank" 
                             rel="noreferrer"
                             className="w-full py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all"
                           >
                             <BadgeCheck size={14} /> View Doc
                           </a>
                           <button 
                             onClick={() => handleDeleteDoc(uploaded._id)}
                             className="w-full py-2 bg-rose-50 text-rose-500 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
                           >
                             Remove
                           </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setNewDoc({ title: docType.title, category: docType.title });
                            setShowDocModal(true);
                          }}
                          className="w-full py-2.5 bg-white border border-slate-200 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                        >
                          <TrendingUp size={14} className="rotate-0" /> Upload
                        </button>
                      )}
                    </div>
                  );
                })}

                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-100 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-all" onClick={() => setShowDocModal(true)}>
                   <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300 mb-4"><Plus size={24} /></div>
                   <h4 className="text-[11px] font-black text-slate-800 mb-1">Add More Document</h4>
                   <p className="text-[8px] font-bold text-slate-400 uppercase leading-relaxed">Upload any additional<br/>documents</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-border shadow-sm p-10">
             <h3 className="text-sm font-black text-slate-800 mb-8 uppercase tracking-widest">Document Guidelines</h3>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-4">
                   {[
                     'Ensure all documents are clear and readable',
                     'File size should not exceed 10MB per document',
                     'Allowed formats: PDF, JPG, PNG',
                     'All required documents (*) must be uploaded'
                   ].map((item, idx) => (
                     <div key={idx} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><BadgeCheck size={12} /></div>
                        <span className="text-[11px] font-bold text-slate-500">{item}</span>
                     </div>
                   ))}
                </div>
                
                <div className="bg-blue-50/50 rounded-[32px] p-8 border border-blue-100 flex items-center gap-6">
                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm border border-blue-100"><Lock size={28} /></div>
                   <div>
                      <h4 className="text-[13px] font-black text-slate-800 mb-1">Secure Upload</h4>
                      <p className="text-[10px] font-medium text-slate-500 leading-relaxed max-w-sm">All documents are encrypted and stored securely. Only authorized personnel can access these documents.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
           <div className="bg-white rounded-[40px] w-full max-w-md p-10 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-2xl font-black text-slate-800">New Document</h3>
                 <button onClick={() => setShowDocModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><X size={24} className="text-slate-400" /></button>
              </div>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Document Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Aadhaar Card" 
                      value={newDoc.title}
                      onChange={(e) => setNewDoc({...newDoc, title: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Category</label>
                    <select 
                      value={newDoc.category}
                      onChange={(e) => setNewDoc({...newDoc, category: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                    >
                       <option>Identity Proof</option>
                       <option>Education</option>
                       <option>Banking Details</option>
                       <option>Employment</option>
                       <option>Payroll</option>
                       <option>HR Documents</option>
                       <option>Other</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">File Selection</label>
                    <div className="relative">
                      <input 
                        type="file" 
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer bg-slate-50 rounded-2xl border border-slate-100 p-2"
                      />
                    </div>
                    {selectedFile && <p className="text-[10px] font-black text-emerald-500 mt-2 uppercase">Selected: {selectedFile.name}</p>}
                 </div>
                 
                 <div className="pt-4">
                    <button 
                      onClick={handleUploadDoc}
                      disabled={docUploadLoading || !selectedFile || !newDoc.title}
                      className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                       {docUploadLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={18} />}
                       {docUploadLoading ? 'Vaulting...' : 'Save to Vault'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'Timesheet' && (
         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           {!showWeeklyDetail ? (
             <>
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                 <div className="bg-white p-6 rounded-[32px] border border-border shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Work Hours</p>
                    <h3 className="text-xl font-black text-slate-800">
                      {Math.floor(hourlyReports.reduce((acc, r) => {
                        const h = r.workHours?.match(/(\d+)h/);
                        return acc + (h ? parseInt(h[1]) : 0);
                      }, 0))}h {hourlyReports.reduce((acc, r) => {
                        const m = r.workHours?.match(/(\d+)m/);
                        return acc + (m ? parseInt(m[1]) : 0);
                      }, 0) % 60}m
                    </h3>
                    <p className="text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-widest">This Month</p>
                 </div>
                 <div className="bg-white p-6 rounded-[32px] border border-border shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Overtime</p>
                    <h3 className="text-xl font-black text-slate-800">
                      {Math.floor(hourlyReports.reduce((acc, r) => {
                        const h = r.overtime?.match(/(\d+)h/);
                        return acc + (h ? parseInt(h[1]) : 0);
                      }, 0))}h {hourlyReports.reduce((acc, r) => {
                        const m = r.overtime?.match(/(\d+)m/);
                        return acc + (m ? parseInt(m[1]) : 0);
                      }, 0) % 60}m
                    </h3>
                    <p className="text-[10px] font-bold text-blue-500 mt-1 uppercase tracking-widest">Extra Hours</p>
                 </div>
                 <div className="bg-white p-6 rounded-[32px] border border-border shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Hours / Day</p>
                    <h3 className="text-xl font-black text-slate-800">
                      {hourlyReports.length > 0 ? (
                        Math.floor(hourlyReports.reduce((acc, r) => {
                          const h = r.workHours?.match(/(\d+)h/);
                          const m = r.workHours?.match(/(\d+)m/);
                          return acc + (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0);
                        }, 0) / hourlyReports.length / 60)
                      ) : 0}h {hourlyReports.length > 0 ? (
                        Math.floor(hourlyReports.reduce((acc, r) => {
                          const h = r.workHours?.match(/(\d+)h/);
                          const m = r.workHours?.match(/(\d+)m/);
                          return acc + (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0);
                        }, 0) / hourlyReports.length) % 60
                      ) : 0}m
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Efficiency Rate</p>
                 </div>
                 <div className="bg-white p-6 rounded-[32px] border border-border shadow-sm flex items-center justify-center">
                    <button 
                      onClick={() => setShowWeeklyDetail(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-[#0f172a] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                    >
                      <Clock size={16} /> View Weekly Grid
                    </button>
                 </div>
               </div>

               <div className="bg-white rounded-[40px] border border-border shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                     <h3 className="text-xl font-black text-slate-800">Monthly Timesheet List</h3>
                     <div className="flex items-center gap-3">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronLeft size={16} /></button>
                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{monthNames[currentMonth]} {currentYear}</span>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronRight size={16} /></button>
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="bg-slate-50/50 border-b border-slate-100">
                              {['Date', 'Log Time', 'Work Hours', 'Overtime', 'Status', 'Action'].map(h => (
                                <th key={h} className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                              ))}
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {hourlyReports.length > 0 ? (
                             hourlyReports.map((report, idx) => (
                               <tr key={idx} className="hover:bg-slate-50/30 transition-all">
                                  <td className="px-10 py-5">
                                     <p className="text-sm font-black text-slate-700">{report.date}</p>
                                  </td>
                                  <td className="px-10 py-5">
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                        {report.checkIn ? new Date(report.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'} - 
                                        {report.checkOut ? new Date(report.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                                     </p>
                                  </td>
                                  <td className="px-10 py-5">
                                     <span className="text-sm font-black text-slate-700">{report.workHours || '0h 0m'}</span>
                                  </td>
                                  <td className="px-10 py-5 text-sm font-bold text-slate-400">{report.overtime || '0h 0m'}</td>
                                  <td className="px-10 py-5">
                                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                       report.workStatus === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                                     }`}>
                                        {report.workStatus || 'Pending'}
                                     </span>
                                  </td>
                                  <td className="px-10 py-5">
                                     <button 
                                       onClick={() => setShowWeeklyDetail(true)}
                                       className="p-2 text-slate-300 hover:text-primary transition-colors"
                                     >
                                       <Eye size={16} />
                                     </button>
                                  </td>
                               </tr>
                             ))
                           ) : (
                             <tr>
                               <td colSpan="6" className="px-10 py-20 text-center text-slate-400 text-xs font-bold italic">No timesheet records found for this month.</td>
                             </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
             </>
           ) : (
             <AdminWeeklyTimesheet 
               employee={employee} 
               onBack={() => setShowWeeklyDetail(false)} 
             />
           )}
        </div>
      )}

      {activeTab === 'Login History' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-[40px] border border-border shadow-sm overflow-hidden flex flex-col">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Login Activity Log</h3>
                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Recent authentication attempts and sessions</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Session</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    {['Login Date & Time', 'IP Address', 'Device / Browser', 'Location', 'Status'].map(head => (
                      <th key={head} className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loginLogs.length > 0 ? (
                    loginLogs.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/40 transition-colors group">
                        <td className="px-10 py-5">
                          <div className="flex items-center gap-3">
                            <Clock size={16} className="text-slate-300" />
                            <span className="text-sm font-black text-slate-700">
                              {new Date(row.timestamp).toLocaleString('en-GB', { 
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit', hour12: true 
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-5 text-sm font-bold text-slate-500">{row.ipAddress || '---'}</td>
                        <td className="px-10 py-5">
                          <div className="flex items-center gap-2">
                            <ExternalLink size={14} className="text-slate-300" />
                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">
                              {row.browser} / {row.device}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">{row.location || '---'}</td>
                        <td className="px-10 py-5">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            row.status === 'Success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-10 py-20 text-center text-slate-400 text-xs font-bold italic">No login activity found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-8 border-t border-slate-50 text-center">
              <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All Login History</button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default AdminEmployeeDetails;
