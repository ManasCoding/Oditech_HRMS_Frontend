import React, { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { 
  Save, 
  Archive,
  CheckCircle2,
  MapPin,
  Clock,
  Calendar,
  Navigation,
  Bell,
  Trash2,
  ShieldCheck,
  UserPlus,
  Mail,
  Lock,
  User
} from 'lucide-react';

import api from '../services/api';

const SettingCard = ({ label, value, name, onChange, colorClass = "bg-slate-50", type = "text", suffix = "" }) => (
  <div className={`bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center text-center group transition-all hover:shadow-md relative overflow-hidden`}>
    <div className={`absolute top-0 left-0 w-full h-1.5 ${colorClass}`}></div>
    <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-4">{label}</span>
    <div className="flex items-center justify-center gap-1 w-full">
      <input 
        type={type} 
        name={name}
        value={value}
        onChange={onChange}
        className="bg-transparent border-none p-0 text-2xl font-black text-[#1e293b] w-full text-center focus:outline-none placeholder:text-slate-200"
      />
      {suffix && <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">{suffix}</span>}
    </div>
  </div>
);

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    workday_start: '09:30',
    logout_time: '19:00',
    late_threshold: '09:40',
    max_work_hours: '9.0',
    casual_leave: '12',
    sick_leave: '10',
    office_lat: '20.296142',
    office_lng: '85.833122',
    geofence_radius: '50'
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ fullName: '', email: '', password: '' });
  const [adminLoading, setAdminLoading] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    fetchSettings();
    fetchAdmins();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data.success) {
        setSettings(prev => ({ ...prev, ...res.data.settings }));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSettings({
            ...settings,
            office_lat: position.coords.latitude.toFixed(6),
            office_lng: position.coords.longitude.toFixed(6)
          });
          setSuccess('Live location captured!');
          setTimeout(() => setSuccess(''), 2000);
        },
        (error) => alert('Error: ' + error.message)
      );
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const settingsArray = Object.keys(settings).map(key => ({
        key,
        value: settings[key]
      }));
      const res = await api.post('/admin/settings', { settings: settingsArray });
      if (res.data.success) {
        setSuccess('Global policies updated!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      alert('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/admin/admins');
      if (res.data.success) setAdmins(res.data.admins);
    } catch (err) {
      console.error('Error fetching admins:', err);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.fullName || !newAdmin.email || !newAdmin.password) return;
    setAdminLoading(true);
    try {
      const res = await api.post('/admin/admins', newAdmin);
      if (res.data.success) {
        setSuccess('New administrator added!');
        setNewAdmin({ fullName: '', email: '', password: '' });
        fetchAdmins();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating admin');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (adminId === currentUser.id) {
      alert("You cannot delete your own account while logged in.");
      return;
    }
    if (!window.confirm('Are you sure you want to remove this administrator? They will lose all access.')) return;
    try {
      const res = await api.delete(`/admin/admins/${adminId}`);
      if (res.data.success) {
        setAdmins(admins.filter(a => a._id !== adminId));
        setSuccess('Administrator removed');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      alert('Error deleting admin');
    }
  };

  return (
    <AdminLayout title="System Configuration" subtitle="Define organization-wide policies and system parameters.">
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#1e293b] p-8 rounded-[40px] text-white shadow-xl shadow-slate-200 overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
           <div className="relative z-10 text-center md:text-left">
              <h3 className="text-2xl font-black mb-1">Global Policy Control</h3>
              <p className="text-white/50 text-xs font-medium uppercase tracking-widest">Update rules across all employee portals.</p>
           </div>
           <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
              {success && (
                <div className="hidden lg:flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest animate-in slide-in-from-right-4">
                   <CheckCircle2 size={16} /> {success}
                </div>
              )}
              <button 
                onClick={handleSave}
                disabled={loading}
                className="flex-1 md:flex-none flex items-center justify-center gap-3 px-10 py-4 bg-white text-[#1e293b] rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10 disabled:opacity-50"
              >
                {loading ? <div className="w-4 h-4 border-2 border-[#1e293b]/30 border-t-[#1e293b] rounded-full animate-spin"></div> : <Save size={16} />}
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
           </div>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {/* Timing Section */}
          <section>
            <div className="flex items-center gap-3 mb-6 px-4">
              <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
                <Clock size={20} />
              </div>
              <h4 className="text-lg font-black text-[#1e293b] uppercase tracking-widest">Timing & Attendance Rules</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <SettingCard label="Shift Start" name="workday_start" value={settings.workday_start} onChange={handleChange} type="time" colorClass="bg-sky-500" />
              <SettingCard label="Shift End" name="logout_time" value={settings.logout_time} onChange={handleChange} type="time" colorClass="bg-sky-500" />
              <SettingCard label="Late Threshold" name="late_threshold" value={settings.late_threshold} onChange={handleChange} type="time" colorClass="bg-rose-500" />
              <SettingCard label="Daily Max Hours" name="max_work_hours" value={settings.max_work_hours} onChange={handleChange} suffix="HRS" type="number" colorClass="bg-emerald-500" />
            </div>
          </section>

          {/* Leave Section */}
          <section>
            <div className="flex items-center gap-3 mb-6 px-4">
              <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                <Calendar size={20} />
              </div>
              <h4 className="text-lg font-black text-[#1e293b] uppercase tracking-widest">Yearly Leave Quotas</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl">
              <SettingCard label="Casual Leave" name="casual_leave" value={settings.casual_leave} onChange={handleChange} suffix="DAYS" type="number" colorClass="bg-violet-500" />
              <SettingCard label="Sick Leave" name="sick_leave" value={settings.sick_leave} onChange={handleChange} suffix="DAYS" type="number" colorClass="bg-violet-500" />
            </div>
          </section>

          {/* Geofencing Section */}
          <section>
            <div className="flex items-center justify-between mb-6 px-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Navigation size={20} />
                </div>
                <h4 className="text-lg font-black text-[#1e293b] uppercase tracking-widest">Geofencing & Security</h4>
              </div>
              <button onClick={handleGetLocation} className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-2">
                <MapPin size={12} /> Sync Office Coordinates
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <SettingCard label="Office Latitude" name="office_lat" value={settings.office_lat} onChange={handleChange} type="number" colorClass="bg-[#1e293b]" />
              <SettingCard label="Office Longitude" name="office_lng" value={settings.office_lng} onChange={handleChange} type="number" colorClass="bg-[#1e293b]" />
              <SettingCard label="Verification Radius" name="geofence_radius" value={settings.geofence_radius} onChange={handleChange} suffix="METERS" type="number" colorClass="bg-emerald-500" />
            </div>
          </section>
        </div>

        {/* Notifications & Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-6">
           {/* Add Notice */}
           <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-violet-500"></div>
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-14 h-14 bg-violet-50 text-violet-600 rounded-[20px] flex items-center justify-center">
                    <Bell size={28} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-[#1e293b]">Publish Notice</h3>
                    <p className="text-slate-400 text-xs font-medium">Post a festival or official holiday notice.</p>
                 </div>
              </div>

              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                  <input type="text" placeholder="Festival Holiday Notice" className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-50 transition-all font-black text-[#1e293b] placeholder:text-slate-300" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valid Until</label>
                    <input type="date" className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-50 transition-all font-black text-[#1e293b]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                    <select className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-50 transition-all font-black text-[#1e293b]">
                      <option>Normal</option>
                      <option>Urgent</option>
                      <option>Holiday</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
                  <textarea rows="3" placeholder="Description of the notice..." className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-50 transition-all font-medium text-[#1e293b] resize-none"></textarea>
                </div>
                <button className="w-full py-5 bg-violet-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-violet-100 hover:scale-[1.02] active:scale-95 transition-all">
                  Publish Announcement
                </button>
              </form>
           </div>

           {/* Active Notices */}
           <div className="space-y-6">
              <h3 className="text-xl font-black text-[#1e293b] px-4 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Active Announcements
              </h3>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {[
                  { title: 'Ram Navami Holiday', date: '27 Mar 2026', msg: 'The office will remain closed for the festival.', priority: 'Holiday' },
                  { title: 'Annual Maintenance', date: '02 Apr 2026', msg: 'System will be offline for 2 hours.', priority: 'Urgent' },
                ].map((notice, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative group hover:border-violet-100 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-black text-[#1e293b] mb-1">{notice.title}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{notice.date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${notice.priority === 'Urgent' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {notice.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4">{notice.msg}</p>
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                       <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                         <Trash2 size={16} />
                       </button>
                       <button className="p-2 text-slate-400 hover:text-violet-500 hover:bg-violet-50 rounded-lg transition-all">
                         <Archive size={16} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Administrator Access Control */}
        <section className="pt-10">
          <div className="flex items-center gap-3 mb-8 px-4">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-xl font-black text-[#1e293b] uppercase tracking-widest">Administrator Access Control</h4>
              <p className="text-slate-400 text-xs font-bold mt-1">Manage users with full administrative privileges.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Add New Admin Form */}
            <div className="lg:col-span-1 bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-900"></div>
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-xl flex items-center justify-center border border-slate-100">
                    <UserPlus size={24} />
                  </div>
                  <h3 className="text-lg font-black text-[#1e293b]">Add New Admin</h3>
               </div>

               <form onSubmit={handleCreateAdmin} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                       <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                       <input 
                         type="text" 
                         required
                         value={newAdmin.fullName}
                         onChange={(e) => setNewAdmin({...newAdmin, fullName: e.target.value})}
                         placeholder="Admin Name" 
                         className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-sm text-[#1e293b]" 
                       />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                       <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                       <input 
                         type="email" 
                         required
                         value={newAdmin.email}
                         onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                         placeholder="admin@company.com" 
                         className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-sm text-[#1e293b]" 
                       />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Temporary Password</label>
                    <div className="relative">
                       <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                       <input 
                         type="password" 
                         required
                         value={newAdmin.password}
                         onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                         placeholder="••••••••" 
                         className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-sm text-[#1e293b]" 
                       />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={adminLoading}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4"
                  >
                    {adminLoading ? 'Creating Account...' : 'Grant Admin Access'}
                  </button>
               </form>
            </div>

            {/* Existing Admins List */}
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Active Administrators</h3>
                     <span className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black text-slate-400">{admins.length} ACCOUNTS</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {admins.map((admin) => (
                      <div key={admin._id} className="p-6 flex items-center justify-between group hover:bg-slate-50/50 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-black text-sm border-2 border-white shadow-sm">
                            {admin.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                               <h4 className="font-black text-[#1e293b]">{admin.fullName}</h4>
                               {admin._id === currentUser.id && (
                                 <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded-md uppercase tracking-widest border border-emerald-100">You</span>
                               )}
                            </div>
                            <p className="text-xs text-slate-400 font-bold">{admin.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="text-right mr-4 hidden sm:block">
                              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Last Activity</p>
                              <p className="text-[10px] font-bold text-slate-500">
                                {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                              </p>
                           </div>
                           {admin._id !== currentUser.id && (
                             <button 
                               onClick={() => handleDeleteAdmin(admin._id)}
                               className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                             >
                               <Trash2 size={18} />
                             </button>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
               
               <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-3xl flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Security Notice</p>
                    <p className="text-xs text-amber-700/70 font-medium leading-relaxed">
                      Administrators have full access to employee records, salaries, and system configurations. Only grant access to trusted team members.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
