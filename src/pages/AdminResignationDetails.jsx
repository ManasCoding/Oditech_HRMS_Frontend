import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  User,
  Building,
  Hash,
  Paperclip,
  Check,
  X,
  Info,
  CalendarDays,
  MoreVertical,
  Briefcase,
  Award,
  CheckCircle2,
  Circle
} from 'lucide-react';

const AdminResignationDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data for the specific resignation
  const data = {
    id: 'RES-0002',
    status: 'PENDING',
    submittedOn: '04 Jun 2026',
    employee: {
      name: 'Manas Kumar',
      role: 'Software Engineer',
      id: 'EMP-00023',
      department: 'IT Department',
      avatar: 'https://i.pravatar.cc/150?u=manas'
    },
    dates: {
      resignationDate: '04 Jun 2026',
      lastWorkingDay: '04 Jul 2026',
      submittedAt: '04 Jun 2026, 11:05 AM'
    },
    reason: 'Better Opportunity',
    internalStatus: 'Under Review',
    noticePeriod: {
      total: 30,
      remaining: 26,
      start: '05 Jun 2026',
      end: '04 Jul 2026'
    },
    comments: 'I have decided to move forward in my career with another opportunity that aligns with my long-term goals. Thank you for the support.',
    attachment: {
      name: 'resignation_letter.pdf',
      size: '245 KB'
    }
  };

  const calculatePercentage = (total, remaining) => {
    return Math.round(((total - remaining) / total) * 100);
  };
  const percentage = calculatePercentage(data.noticePeriod.total, data.noticePeriod.remaining);

  return (
    <AdminLayout hideHeader={true}>
      <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/resignations')}
              className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div className="w-px h-6 bg-slate-200"></div>
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-3">
              Request Details - {data.id}
              <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] uppercase tracking-widest rounded-md">
                {data.status}
              </span>
            </h1>
          </div>
          <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            Submitted on {data.submittedOn}
          </div>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Column 1: Request Details */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8">
            
            {/* Employee Info */}
            <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
              <img src={data.employee.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-4 border-slate-50 shadow-sm" />
              <div>
                <h2 className="text-lg font-black text-slate-800">{data.employee.name}</h2>
                <p className="text-sm font-bold text-slate-500 mb-2">{data.employee.role}</p>
                <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5"><Hash size={14} className="text-slate-400"/> Employee ID: {data.employee.id}</span>
                  <span className="flex items-center gap-1.5"><Building size={14} className="text-slate-400"/> Department: {data.employee.department}</span>
                </div>
              </div>
            </div>

            {/* Dates & Notice Period Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-slate-400" />
                  <span className="text-slate-500 font-medium w-32">Resignation Date</span>
                  <span className="font-bold text-slate-800">{data.dates.resignationDate}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CalendarDays size={16} className="text-slate-400" />
                  <span className="text-slate-500 font-medium w-32">Last Working Day</span>
                  <span className="font-bold text-slate-800">{data.dates.lastWorkingDay}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FileText size={16} className="text-slate-400" />
                  <span className="text-slate-500 font-medium w-32">Reason</span>
                  <span className="font-bold text-slate-800">{data.reason}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock size={16} className="text-slate-400" />
                  <span className="text-slate-500 font-medium w-32">Status</span>
                  <span className="font-bold text-slate-800">{data.internalStatus}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock size={16} className="text-slate-400" />
                  <span className="text-slate-500 font-medium w-32">Submitted On</span>
                  <span className="font-bold text-slate-800">{data.dates.submittedAt}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
                <h4 className="text-sm font-bold text-slate-800 mb-4">Notice Period</h4>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <span className="block text-2xl font-black text-emerald-500">{data.noticePeriod.total}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Days Total</span>
                  </div>
                  <div className="w-px h-10 bg-slate-200"></div>
                  <div className="text-center">
                    <span className="block text-2xl font-black text-emerald-500">{data.noticePeriod.remaining}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Days Remaining</span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-3">Comments</h4>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed font-medium">
                {data.comments}
              </div>
            </div>

            {/* Attachment */}
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end justify-between pt-4 border-t border-slate-100">
              <div className="flex-1 w-full">
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Paperclip size={16} className="text-blue-500" />
                  Attachment
                </h4>
                <div className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-blue-500" />
                    <span className="text-sm font-bold text-slate-700">{data.attachment.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{data.attachment.size}</span>
                </div>
              </div>

              {/* Take Action */}
              <div className="w-full sm:w-auto">
                <h4 className="text-sm font-bold text-slate-800 mb-3">Take Action</h4>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:shadow-sm border border-emerald-100 transition-all rounded-xl text-xs font-bold">
                    <Check size={16} />
                    Approve Request
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:shadow-sm border border-rose-100 transition-all rounded-xl text-xs font-bold">
                    <X size={16} />
                    Reject Request
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-sm border border-blue-100 transition-all rounded-xl text-xs font-bold">
                    <Info size={16} />
                    Request More Info
                  </button>
                </div>
              </div>
            </div>
            
          </div>

          {/* Column 2: Notice Period Tracking */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-800 mb-1">Notice Period Tracking</h2>
              <p className="text-xs font-medium text-slate-500">Track your notice period progress</p>
            </div>

            {/* Blue Banner & Dates */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-2xl text-white relative overflow-hidden shadow-lg shadow-blue-600/20">
                <CalendarDays size={80} className="absolute -right-4 -bottom-4 text-white/10" />
                <div className="relative z-10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black">{data.noticePeriod.remaining}</span>
                    <span className="text-sm font-bold text-white/80">Days Remaining</span>
                  </div>
                  <p className="text-xs font-medium text-white/60 mt-2">Out of {data.noticePeriod.total} Days</p>
                </div>
              </div>
              
              <div className="w-full sm:w-48 flex flex-col gap-3">
                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                    <Check size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notice Period Start</p>
                    <p className="text-xs font-black text-slate-800">{data.noticePeriod.start}</p>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                    <Calendar size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notice Period End</p>
                    <p className="text-xs font-black text-slate-800">{data.noticePeriod.end}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
              
              {/* Timeline */}
              <div>
                <h4 className="text-sm font-black text-slate-800 mb-6">Notice Period Timeline</h4>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-100">
                  
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 border-4 border-white shadow-sm shrink-0 z-10">
                      <Check size={12} className="text-white" />
                    </div>
                    <div className="w-[calc(100%-2.5rem)] pl-4">
                      <div className="text-[10px] font-bold text-slate-400 mb-0.5">05 Jun 2026</div>
                      <div className="text-sm font-black text-slate-800">Notice Period Started</div>
                    </div>
                  </div>
                  
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white border-4 border-blue-500 shadow-sm shrink-0 z-10">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="w-[calc(100%-2.5rem)] pl-4">
                      <div className="text-[10px] font-bold text-blue-500 mb-0.5">15 Jun 2026</div>
                      <div className="text-sm font-black text-blue-600">Mid Notice Review</div>
                      <div className="text-xs font-medium text-slate-500 mt-1">Meeting with Manager</div>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white border-4 border-rose-400 shadow-sm shrink-0 z-10">
                    </div>
                    <div className="w-[calc(100%-2.5rem)] pl-4">
                      <div className="text-[10px] font-bold text-slate-400 mb-0.5">04 Jul 2026</div>
                      <div className="text-sm font-black text-slate-800">Last Working Day</div>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white border-4 border-emerald-400 shadow-sm shrink-0 z-10">
                    </div>
                    <div className="w-[calc(100%-2.5rem)] pl-4">
                      <div className="text-[10px] font-bold text-slate-400 mb-0.5">05 Jul 2026</div>
                      <div className="text-sm font-black text-slate-800">Exit Process & Handover</div>
                    </div>
                  </div>
                  
                </div>
              </div>

              {/* Progress Chart */}
              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center">
                <h4 className="text-sm font-black text-slate-800 mb-6 w-full text-left">Your Progress</h4>
                
                <div className="relative w-32 h-32 mb-6">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-blue-600"
                      strokeWidth="3"
                      strokeDasharray={`${percentage}, 100`}
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-800">{percentage}%</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Completed</span>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span className="truncate">Handover Documents</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                    <Circle size={14} className="shrink-0" />
                    <span className="truncate">Complete Pending Tasks</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                    <Circle size={14} className="shrink-0" />
                    <span className="truncate">Exit Interview</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                    <Circle size={14} className="shrink-0" />
                    <span className="truncate">Return Company Assets</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Column 3: Exit Process Checklist */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-800 mb-1">Exit Process Checklist</h2>
              <p className="text-xs font-medium text-slate-500">Complete your exit formalities</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between px-2 py-1 mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Task</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                </div>
                
                {[
                  { name: 'Handover Documents', status: 'Pending' },
                  { name: 'Return Company Assets', status: 'Pending' },
                  { name: 'Clear Dues', status: 'Pending' },
                  { name: 'Exit Interview', status: 'Pending' },
                  { name: 'Final Settlement', status: 'Pending' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-slate-400" />
                      <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider rounded">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="w-full sm:w-48 space-y-6">
                {/* Overall Progress */}
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center">
                  <h4 className="text-xs font-bold text-slate-800 mb-4 w-full text-center">Overall Progress</h4>
                  <div className="relative w-24 h-24 mb-2">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black text-slate-800">0%</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Completed</span>
                    </div>
                  </div>
                </div>

                {/* After Completion */}
                <div>
                  <h4 className="text-sm font-black text-slate-800 mb-3">After Completion</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                      <Award size={16} className="text-blue-500 shrink-0" />
                      <span className="text-xs font-bold text-blue-900">Experience Letter</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                      <FileText size={16} className="text-blue-500 shrink-0" />
                      <span className="text-xs font-bold text-blue-900">Relieving Letter</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                      <Briefcase size={16} className="text-blue-500 shrink-0" />
                      <span className="text-xs font-bold text-blue-900">Final Settlement</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Illustration / Goodbye Message */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-blue-100/50 mt-6 flex flex-col items-center text-center">
               <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-4">
                 <Briefcase size={32} />
               </div>
               <p className="text-sm font-bold text-blue-900 italic max-w-[250px]">
                 "We wish you the best for your future endeavors! ✨"
               </p>
            </div>

          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminResignationDetails;
