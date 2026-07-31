import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, CheckCircle2,
  AlertCircle, Clock, Plane, Briefcase, Loader2
} from 'lucide-react';
import api from '../../services/api';

const AttCard = ({ label, value, color = 'slate', loading = false, icon: Icon, subtext }) => {
  const map = {
    slate:  { wrapper: 'hover:border-slate-200', iconBg: 'bg-slate-50 text-slate-500', valueText: 'text-slate-800', subText: 'text-slate-500' },
    green:  { wrapper: 'hover:border-emerald-200', iconBg: 'bg-emerald-50 text-emerald-500', valueText: 'text-slate-800', subText: 'text-emerald-500' },
    red:    { wrapper: 'hover:border-rose-200', iconBg: 'bg-rose-50 text-rose-500', valueText: 'text-slate-800', subText: 'text-rose-500' },
    amber:  { wrapper: 'hover:border-amber-200', iconBg: 'bg-amber-50 text-amber-500', valueText: 'text-slate-800', subText: 'text-amber-500' },
    orange: { wrapper: 'hover:border-orange-200', iconBg: 'bg-orange-50 text-orange-500', valueText: 'text-slate-800', subText: 'text-orange-500' },
    blue:   { wrapper: 'hover:border-blue-200', iconBg: 'bg-blue-50 text-blue-500', valueText: 'text-slate-800', subText: 'text-blue-500' },
    indigo: { wrapper: 'hover:border-indigo-200', iconBg: 'bg-indigo-50 text-indigo-500', valueText: 'text-slate-800', subText: 'text-indigo-500' },
    violet: { wrapper: 'hover:border-violet-200', iconBg: 'bg-violet-50 text-violet-500', valueText: 'text-slate-800', subText: 'text-violet-500' },
    teal:   { wrapper: 'hover:border-teal-200', iconBg: 'bg-teal-50 text-teal-500', valueText: 'text-slate-800', subText: 'text-teal-500' },
    primary:{ wrapper: 'hover:border-primary/20 bg-slate-50/30', iconBg: 'bg-primary/10 text-primary', valueText: 'text-slate-800', subText: 'text-primary' },
  };

  const style = map[color] || map.slate;
  const isDays = !label.toLowerCase().includes('mark');

  return (
    <div className={`bg-white p-6 rounded-[32px] border border-border shadow-sm group ${style.wrapper} transition-all min-w-[200px]`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${style.iconBg} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform flex-shrink-0`}>
          {Icon ? <Icon size={22} /> : <Calendar size={22} />}
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight mb-1">{label}</p>
          {loading ? (
            <div className="h-7 flex items-center">
              <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin opacity-40" />
            </div>
          ) : (
            <>
              <p className="text-xl font-black text-slate-800 leading-none mb-1">{value ?? '0'} <span className="text-sm font-bold text-slate-500">{isDays ? 'Days' : ''}</span></p>
              {subtext && <p className={`text-[10px] font-bold ${style.subText}`}>{subtext}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getPayrollPeriod = (month, year) => {
  let prevMonth = month - 1, prevYear = year;
  if (prevMonth === 0) { prevMonth = 12; prevYear = year - 1; }
  const pad = (n) => String(n).padStart(2, '0');
  return {
    periodStart: `${prevYear}-${pad(prevMonth)}-21`,
    periodEnd:   `${year}-${pad(month)}-20`,
  };
};

const PayrollAttendanceSummary = ({ employeeId, month, year }) => {
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const fetchAttendanceSummary = useCallback(async () => {
    if (!employeeId) return;
    try {
      setSummaryLoading(true);
      const res = await api.get(`/payroll/attendance-summary/${employeeId}/${month}/${year}`);
      if (res.data.success) {
        setAttendanceSummary(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load attendance summary', err);
    } finally {
      setSummaryLoading(false);
    }
  }, [employeeId, month, year]);

  useEffect(() => {
    fetchAttendanceSummary();
  }, [fetchAttendanceSummary]);

  const { periodStart: clientPeriodStart, periodEnd: clientPeriodEnd } = getPayrollPeriod(month, year);
  const att = attendanceSummary || {};
  const periodFrom = att.payrollPeriod?.from || clientPeriodStart;
  const periodTo   = att.payrollPeriod?.to   || clientPeriodEnd;
  const hasAttendanceData = (att.present ?? 0) > 0 || (att.halfDay ?? 0) > 0 || (att.absent ?? 0) > 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Calendar size={14} /> Attendance — Auto-fetched for Payroll Period
        </h3>
        <div className="flex items-center gap-2">
          {summaryLoading && (
            <Loader2 size={13} className="animate-spin text-primary" />
          )}
          <span className="text-[10px] font-black text-slate-600 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1">
            {formatDateLabel(periodFrom)} → {formatDateLabel(periodTo)}
          </span>
        </div>
      </div>

      {!summaryLoading && !hasAttendanceData && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
          <AlertCircle size={16} className="text-amber-500 shrink-0" />
          <p className="text-amber-700 text-sm font-medium">
            No attendance records found for this payroll period.
          </p>
        </div>
      )}

      <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
        <AttCard label="Working Days" value={att.workingDays} color="primary" icon={Briefcase} loading={summaryLoading} />
        <AttCard label="Present"      value={att.present}     color="green"   icon={Calendar} loading={summaryLoading} subtext={att.workingDays ? `${Math.round(((att.present ?? 0) / att.workingDays) * 100)}%` : '0%'} />
        <AttCard label="Absent"       value={att.absent}      color="red"     icon={Calendar} loading={summaryLoading} subtext={att.workingDays ? `${Math.round(((att.absent ?? 0) / att.workingDays) * 100)}%` : '0%'} />
        <AttCard label="Half Day"     value={att.halfDay}     color="teal"    icon={Clock}    loading={summaryLoading} subtext={att.workingDays ? `${Math.round(((att.halfDay ?? 0) / att.workingDays) * 100)}%` : '0%'} />
        <AttCard label="Paid Leave"   value={att.paidLeave}   color="blue"    icon={Plane}    loading={summaryLoading} />
        <AttCard label="Unpaid Leave" value={att.unpaidLeave} color="orange"  icon={Plane}    loading={summaryLoading} />
        <AttCard label="Weekly Off"   value={att.weeklyOff}   color="slate"   icon={Calendar} loading={summaryLoading} />
        <AttCard label="Holidays"     value={att.holidays}    color="indigo"  icon={Calendar} loading={summaryLoading} />
        <AttCard label="Late Marks"   value={att.lateMarks}   color="amber"   icon={AlertCircle} loading={summaryLoading} />
        <AttCard label="Payable Days" value={att.payableDays} color="green"   icon={CheckCircle2} loading={summaryLoading} subtext="Total Payable" />
      </div>

      {!summaryLoading && attendanceSummary && (
        <p className="mt-3 text-[10px] text-slate-400 font-medium">
          Payable Days = Present ({att.present ?? 0}) + Paid Leave ({att.paidLeave ?? 0}) +
          Holidays ({att.holidays ?? 0}) + Weekly Off ({att.weeklyOff ?? 0}) +
          Half Day × 0.5 ({att.halfDay ?? 0} × 0.5 = {((att.halfDay ?? 0) * 0.5).toFixed(1)})
          = <strong className="text-slate-600">{att.payableDays}</strong>
        </p>
      )}
    </div>
  );
};

export default PayrollAttendanceSummary;
