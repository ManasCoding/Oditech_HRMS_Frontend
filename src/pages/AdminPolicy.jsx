import React from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { BookOpen, Shield, Clock, Laptop, Heart, Upload, ChevronRight, Edit3 } from 'lucide-react';

const PolicyCard = ({ title, icon: Icon, updatedDate, bgClass, textClass }) => (
  <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-300 group">
    <div className="flex items-start justify-between mb-6">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgClass} ${textClass}`}>
        <Icon size={26} strokeWidth={2.5} />
      </div>
      <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors">
        <Edit3 size={14} />
      </button>
    </div>
    <div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Updated: {updatedDate}</p>
        <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors group-hover:translate-x-1" />
      </div>
    </div>
  </div>
);

const AdminPolicy = () => {
  return (
    <AdminLayout title="Company Policy" subtitle="Manage and update organizational guidelines and protocols.">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Action */}
        <div className="bg-gradient-to-r from-[#0f172a] to-slate-800 rounded-[32px] p-8 md:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-20 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">Policy Repository</h2>
            <p className="text-slate-300 font-medium max-w-md leading-relaxed">
              Ensure your workforce is aligned by keeping company policies up to date. Upload new guidelines or modify existing ones.
            </p>
          </div>
          
          <button className="w-full md:w-auto px-8 py-4 bg-white text-[#0f172a] rounded-2xl text-sm font-black tracking-wide hover:bg-blue-50 hover:text-blue-600 hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-3 relative z-10">
            <Upload size={18} strokeWidth={2.5} />
            Upload New Policy
          </button>
        </div>

        {/* Policy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PolicyCard 
            title="Code of Conduct" 
            icon={Shield} 
            updatedDate="Jan 15, 2026"
            bgClass="bg-blue-50"
            textClass="text-blue-600"
          />
          <PolicyCard 
            title="Attendance & Leave" 
            icon={Clock} 
            updatedDate="Mar 02, 2026"
            bgClass="bg-emerald-50"
            textClass="text-emerald-600"
          />
          <PolicyCard 
            title="IT & Security Policy" 
            icon={Laptop} 
            updatedDate="Feb 20, 2026"
            bgClass="bg-violet-50"
            textClass="text-violet-600"
          />
          <PolicyCard 
            title="Health & Safety" 
            icon={Heart} 
            updatedDate="Nov 10, 2025"
            bgClass="bg-rose-50"
            textClass="text-rose-600"
          />
          <PolicyCard 
            title="Remote Work Guidelines" 
            icon={BookOpen} 
            updatedDate="Apr 05, 2026"
            bgClass="bg-orange-50"
            textClass="text-orange-600"
          />
        </div>

        {/* Audit Log / Recent Changes */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_20px_40px_rgb(0,0,0,0.04)] p-8 mt-8">
           <h3 className="text-xl font-black text-slate-800 tracking-tight mb-6">Recent Policy Updates</h3>
           <div className="space-y-6">
              {[
                { name: 'Remote Work Guidelines updated to Version 2.1', date: 'Apr 05, 2026', author: 'Super Admin' },
                { name: 'Attendance & Leave Policy modified (Section 3.B)', date: 'Mar 02, 2026', author: 'HR Manager' },
              ].map((log, idx) => (
                <div key={idx} className="flex items-start gap-4 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                     <Edit3 size={16} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm">{log.name}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      By <span className="font-bold">{log.author}</span> on {log.date}
                    </p>
                  </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminPolicy;
