import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, Calendar, Clock, ClipboardCheck, 
  Wallet, FileText, Download, Mail, Phone, MapPin, 
  AlertCircle, Briefcase, FileSignature, CircleDashed, User
} from 'lucide-react';
import api from '../services/api';
import EmployeeLayout from '../layouts/EmployeeLayout';

const EmployeeResignationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resignation, setResignation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResignationDetails();
  }, [id]);

  const fetchResignationDetails = async () => {
    try {
      // Mock data for testing period
      if (id === 'test') {
        setResignation({
          _id: 'mock12345678901234567890',
          resignationDate: new Date().toISOString(),
          lastWorkingDay: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
          reason: 'Better Career Opportunity',
          comments: 'Testing the details page layout.',
          attachment: 'https://example.com/mock.pdf',
          status: 'APPROVED',
          submittedOn: new Date().toISOString(),
          reviewedOn: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      const res = await api.get(`/employee/resignations/detail/${id}`);
      if (res.data.success) {
        setResignation(res.data.resignation);
      } else {
        setError(res.data.message || 'Failed to fetch details');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <EmployeeLayout title="Resignation Details" subtitle="Loading...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </EmployeeLayout>
    );
  }

  if (error || !resignation) {
    return (
      <EmployeeLayout title="Resignation Details" subtitle="Error">
        <div className="text-center py-12">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800">Error loading details</h3>
          <p className="text-slate-500 mt-2">{error}</p>
          <button onClick={() => navigate(-1)} className="mt-6 text-blue-600 font-medium hover:underline">Go Back</button>
        </div>
      </EmployeeLayout>
    );
  }

  // Calculate dynamic stats based on dates and status
  const submittedDate = new Date(resignation.submittedOn);
  const resDate = new Date(resignation.resignationDate);
  const lwd = resignation.lastWorkingDay ? new Date(resignation.lastWorkingDay) : null;
  const today = new Date();
  
  // Notice period calculations
  let noticePeriodTotal = 30; // Default notice period
  let daysCompleted = 0;
  let noticePeriodStart = resDate;
  let noticePeriodEnd = new Date(resDate);
  noticePeriodEnd.setDate(noticePeriodEnd.getDate() + noticePeriodTotal);

  if (lwd) {
     noticePeriodTotal = Math.round((lwd - resDate) / (1000 * 60 * 60 * 24));
     noticePeriodEnd = lwd;
  }
  
  let daysRemaining = noticePeriodTotal;
  
  if (resignation.status === 'APPROVED' || resignation.status === 'PENDING') {
     daysCompleted = Math.max(0, Math.round((today - noticePeriodStart) / (1000 * 60 * 60 * 24)));
     if (daysCompleted > noticePeriodTotal) daysCompleted = noticePeriodTotal;
     daysRemaining = noticePeriodTotal - daysCompleted;
  }
  
  const progressPercent = noticePeriodTotal > 0 ? Math.round((daysCompleted / noticePeriodTotal) * 100) : 0;

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  
  const formatDateTime = (d) => {
    if (!d) return 'N/A';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Mock HR info
  const hrContact = {
    name: "Sonali Das",
    role: "HR Manager",
    email: "hr@oditechglobal.com",
    phone: "+91 98765 43210",
    location: "HR Department, 2nd Floor",
    initials: "SD"
  };

  // Timeline Logic
  const timelineSteps = [
    { 
      title: 'Resignation Submitted', 
      desc: 'You have submitted your resignation request', 
      date: formatDateTime(submittedDate), 
      completed: true, 
      active: false 
    },
    { 
      title: 'Admin Review Completed', 
      desc: 'Your request is under review by admin', 
      date: resignation.reviewedOn ? formatDateTime(new Date(resignation.reviewedOn)) : (resignation.status !== 'PENDING' ? 'Completed' : 'Pending'), 
      completed: resignation.status !== 'PENDING', 
      active: resignation.status === 'PENDING' 
    },
    { 
      title: 'Resignation ' + (resignation.status === 'REJECTED' ? 'Rejected' : 'Approved'), 
      desc: resignation.status === 'REJECTED' ? 'Your resignation has been rejected' : 'Your resignation has been approved', 
      date: resignation.reviewedOn ? formatDateTime(new Date(resignation.reviewedOn)) : '-', 
      completed: resignation.status === 'APPROVED' || resignation.status === 'REJECTED', 
      active: false 
    },
    { 
      title: 'Notice Period Running', 
      desc: 'You are in notice period', 
      date: `${formatDate(resDate)} to ${formatDate(noticePeriodEnd)}`, 
      completed: daysRemaining === 0 && resignation.status === 'APPROVED', 
      active: daysRemaining > 0 && resignation.status === 'APPROVED' 
    },
    { 
      title: 'Exit Process Pending', 
      desc: 'Complete exit formalities', 
      date: '-', 
      completed: false, 
      active: daysRemaining === 0 && resignation.status === 'APPROVED' 
    },
    { 
      title: 'Marked as Resigned', 
      desc: 'After completing all exit formalities', 
      date: '-', 
      completed: false, 
      active: false 
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'PENDING': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'REJECTED': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIconColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'text-emerald-500 bg-emerald-100';
      case 'PENDING': return 'text-amber-500 bg-amber-100';
      case 'REJECTED': return 'text-red-500 bg-red-100';
      default: return 'text-slate-500 bg-slate-100';
    }
  };

  return (
    <EmployeeLayout title="My Resignation Details" subtitle="Track your resignation request and exit process">
      <div className="max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-4 text-sm font-semibold"
          >
            <ArrowLeft size={16} />
            Back to Resignation
          </button>
        </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {/* Status */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusIconColor(resignation.status)}`}>
            {resignation.status === 'APPROVED' ? <CheckCircle2 size={24} /> : (resignation.status === 'REJECTED' ? <AlertCircle size={24} /> : <Clock size={24} />)}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
            <p className={`text-lg font-black leading-none ${resignation.status === 'APPROVED' ? 'text-emerald-600' : (resignation.status === 'REJECTED' ? 'text-red-600' : 'text-amber-600')}`}>
              {resignation.status.charAt(0).toUpperCase() + resignation.status.slice(1).toLowerCase()}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1.5">
              Since {formatDate(new Date(resignation.submittedOn))}
            </p>
          </div>
        </div>

        {/* Days Remaining */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Days Remaining</p>
            <p className="text-lg font-black text-blue-600 leading-none">{daysRemaining} Days</p>
            <p className="text-xs text-slate-500 font-medium mt-1.5">Till Last Working Day</p>
          </div>
        </div>

        {/* Notice Period */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
            <CircleDashed size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notice Period</p>
            <p className="text-lg font-black text-[#1e293b] leading-none">
              <span className="text-indigo-600">{daysCompleted}</span> / {noticePeriodTotal} Days
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1.5">{daysCompleted} Completed</p>
          </div>
        </div>

        {/* Exit Tasks */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
            <ClipboardCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Exit Tasks</p>
            <p className="text-lg font-black text-[#1e293b] leading-none">
              <span className="text-orange-500">2</span> / 5 Completed
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1.5">3 Pending</p>
          </div>
        </div>

        {/* Final Settlement */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Final Settlement</p>
            <p className="text-lg font-black text-rose-500 leading-none">Pending</p>
            <p className="text-xs text-slate-500 font-medium mt-1.5">Will be processed after exit</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Information & Checklist) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Resignation Information Card */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h3 className="text-xl font-black text-[#1e293b]">Resignation Information</h3>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-1">Request ID</p>
                  <p className="text-sm font-bold text-blue-600">RES-{resignation._id.toString().slice(-6).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-1">Resignation Date</p>
                  <p className="text-sm font-bold text-[#1e293b] flex items-center gap-2">
                    {formatDate(resDate)} <Calendar size={14} className="text-slate-400" />
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-1">Last Working Day</p>
                  <p className="text-sm font-bold text-[#1e293b] flex items-center gap-2">
                    {formatDate(noticePeriodEnd)} <Calendar size={14} className="text-slate-400" />
                  </p>
                </div>
              </div>
              
              <div className="border-t border-slate-100 pt-6">
                <p className="text-xs font-bold text-slate-400 mb-1">Reason for Resignation</p>
                <p className="text-sm font-bold text-[#1e293b]">{resignation.reason}</p>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <p className="text-xs font-bold text-slate-400 mb-1">Comments</p>
                <p className="text-sm font-medium text-slate-700">{resignation.comments || 'No comments provided.'}</p>
              </div>

              {resignation.attachment && (
                <div className="border-t border-slate-100 pt-6">
                  <p className="text-xs font-bold text-slate-400 mb-2">Attachment</p>
                  <a href={resignation.attachment} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-500 flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1e293b]">resignation_letter.pdf</p>
                      <p className="text-xs text-slate-500">Document</p>
                    </div>
                    <div className="ml-8 text-blue-600 flex items-center gap-2 text-sm font-bold">
                      Download <Download size={16} />
                    </div>
                  </a>
                </div>
              )}

              {resignation.status === 'APPROVED' && (
                <div className="border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-2">Approved By</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1e293b]">Admin</p>
                        <p className="text-xs font-medium text-slate-500">HR Department</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1">Approved On</p>
                    <p className="text-sm font-bold text-[#1e293b] mt-3">
                      {resignation.reviewedOn ? formatDateTime(new Date(resignation.reviewedOn)) : '-'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Exit Process Checklist */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-50">
                <h3 className="text-lg font-black text-[#1e293b]">Exit Process Checklist</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Complete the following tasks for smooth exit process</p>
              </div>
              <div className="p-6 space-y-6 flex-1">
                {[
                  { title: 'Handover Documents', status: 'Completed', date: 'Completed on ' + formatDate(today) },
                  { title: 'Return Company Assets', status: 'Completed', date: 'Completed on ' + formatDate(today) },
                  { title: 'Clear Dues', status: 'Pending', date: 'Pending' },
                  { title: 'Exit Interview', status: 'Pending', date: 'Pending' },
                  { title: 'Final Settlement', status: 'Pending', date: 'Pending' }
                ].map((task, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 ${task.status === 'Completed' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                      {task.status === 'Completed' && <CheckCircle2 size={12} />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${task.status === 'Completed' ? 'text-[#1e293b]' : 'text-slate-600'}`}>{task.title}</p>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5">{task.date}</p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {task.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* HR Contact */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-50">
                <h3 className="text-lg font-black text-[#1e293b]">HR Contact</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">For any queries, reach out to HR</p>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-lg">
                    {hrContact.initials}
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#1e293b]">{hrContact.name}</p>
                    <p className="text-xs font-medium text-slate-500">{hrContact.role}</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm font-medium text-blue-600">
                    <Mail size={16} /> {hrContact.email}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                    <Phone size={16} className="text-blue-600" /> {hrContact.phone}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                    <MapPin size={16} className="text-blue-600" /> {hrContact.location}
                  </div>
                </div>

                <div className="mt-auto">
                  <a href={`mailto:${hrContact.email}`} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-blue-100 text-blue-600 font-bold hover:bg-blue-50 transition-colors">
                    <Mail size={16} /> Send Email
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Progress & Timeline) */}
        <div className="space-y-8">
          
          {/* Notice Period Progress */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-8">
            <h3 className="text-lg font-black text-[#1e293b] mb-6">Notice Period Progress</h3>
            
            <div className="flex items-center justify-between mb-8">
              <div className="text-center">
                <p className="text-2xl font-black text-[#1e293b]">{daysCompleted} <span className="text-sm font-medium text-slate-500">Days</span></p>
                <p className="text-xs font-medium text-slate-400 mt-1">Completed</p>
              </div>
              
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="36" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                  <circle 
                    cx="48" cy="48" r="36" fill="none" stroke="#2563eb" strokeWidth="8" 
                    strokeDasharray="226.2" 
                    strokeDashoffset={226.2 - (226.2 * progressPercent) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xl font-black text-[#1e293b]">{progressPercent}%</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-2xl font-black text-[#1e293b]">{daysRemaining} <span className="text-sm font-medium text-slate-500">Days</span></p>
                <p className="text-xs font-medium text-slate-400 mt-1">Remaining</p>
              </div>
            </div>

            <div className="h-2 w-full bg-slate-100 rounded-full mb-6 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" style={{ width: `${progressPercent}%` }}></div>
            </div>

            <div className="flex justify-between items-center text-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notice Period Start</p>
                <p className="text-sm font-bold text-[#1e293b]">{formatDate(resDate)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notice Period End</p>
                <p className="text-sm font-bold text-[#1e293b]">{formatDate(noticePeriodEnd)}</p>
              </div>
            </div>
          </div>

          {/* Resignation Timeline */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-8">
            <h3 className="text-lg font-black text-[#1e293b] mb-8">Resignation Timeline</h3>
            
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="relative pl-8">
                  {/* Circle Indicator */}
                  <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white ${step.completed ? 'bg-emerald-500' : (step.active ? 'bg-blue-600' : 'bg-slate-200')} flex items-center justify-center`}>
                    {step.completed && <CheckCircle2 size={12} className="text-white absolute" />}
                  </div>
                  
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-bold ${step.completed || step.active ? 'text-[#1e293b]' : 'text-slate-400'}`}>{step.title}</h4>
                    <span className="text-[10px] font-bold text-slate-400">{step.date}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-500">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
    </EmployeeLayout>
  );
};

export default EmployeeResignationDetails;
