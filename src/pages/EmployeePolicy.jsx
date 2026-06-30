import React from 'react';
import EmployeeLayout from '../layouts/EmployeeLayout';
import { useParams } from 'react-router-dom';
import { BookOpen, Shield, Clock, Laptop, Heart, Download, ChevronRight, FileText } from 'lucide-react';

const PolicyCard = ({ title, icon: Icon, updatedDate, bgClass, textClass, description }) => (
  <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-300 group flex flex-col h-full">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgClass} ${textClass}`}>
        <Icon size={26} strokeWidth={2.5} />
      </div>
      <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors" title="Download Policy">
        <Download size={18} />
      </button>
    </div>
    <div className="flex-1">
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4">{description}</p>
    </div>
    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Updated: {updatedDate}</p>
      <button className="text-sm font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
        Read <ChevronRight size={16} />
      </button>
    </div>
  </div>
);

const EmployeePolicy = () => {
  const { employeeSlug } = useParams();

  return (
    <EmployeeLayout title="Company Policy" subtitle="Review organizational guidelines, rules, and protocols.">
      <div className="max-w-7xl mx-auto space-y-8 pb-10">
        
        {/* Header Banner */}
        <div className="bg-[#0f172a] rounded-[32px] p-8 md:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-20 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
              <Shield className="text-blue-400" size={32} />
              Policy & Guidelines
            </h2>
            <p className="text-slate-300 font-medium max-w-xl leading-relaxed mt-4">
              Access all important company documents. Please ensure you are familiar with our latest policies and guidelines to maintain a safe and compliant work environment.
            </p>
          </div>
        </div>

        {/* Policy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PolicyCard 
            title="Code of Conduct" 
            description="Guidelines on professional behavior, ethics, and workplace compliance."
            icon={Shield} 
            updatedDate="Jan 15, 2026"
            bgClass="bg-blue-50"
            textClass="text-blue-600"
          />
          <PolicyCard 
            title="Attendance & Leave" 
            description="Rules regarding working hours, shifts, and leave application procedures."
            icon={Clock} 
            updatedDate="Mar 02, 2026"
            bgClass="bg-emerald-50"
            textClass="text-emerald-600"
          />
          <PolicyCard 
            title="IT & Security Policy" 
            description="Protocols for using company devices, internet, and data protection."
            icon={Laptop} 
            updatedDate="Feb 20, 2026"
            bgClass="bg-violet-50"
            textClass="text-violet-600"
          />
          <PolicyCard 
            title="Health & Safety" 
            description="Workplace safety standards, emergency procedures, and health guidelines."
            icon={Heart} 
            updatedDate="Nov 10, 2025"
            bgClass="bg-rose-50"
            textClass="text-rose-600"
          />
          <PolicyCard 
            title="Remote Work Guidelines" 
            description="Expectations, requirements, and support for working from home."
            icon={BookOpen} 
            updatedDate="Apr 05, 2026"
            bgClass="bg-orange-50"
            textClass="text-orange-600"
          />
          <PolicyCard 
            title="Expense Policy" 
            description="Reimbursement processes, eligible expenses, and claim submissions."
            icon={FileText} 
            updatedDate="Jan 20, 2026"
            bgClass="bg-indigo-50"
            textClass="text-indigo-600"
          />
        </div>

      </div>
    </EmployeeLayout>
  );
};

export default EmployeePolicy;
