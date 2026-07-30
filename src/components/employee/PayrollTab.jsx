import React, { useState, useEffect } from 'react';
import {
  Calendar, FileText, DollarSign, Loader2, CheckCircle2, Lock,
  TrendingUp, TrendingDown, ArrowRight, ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ─── Utilities ─────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

/**
 * Given payroll month (1-12) and year, compute 21st-prev → 20th-current period.
 * Mirrors the backend helper so the UI always shows the right period.
 */
const getPayrollPeriod = (month, year) => {
  let prevMonth = month - 1, prevYear = year;
  if (prevMonth === 0) { prevMonth = 12; prevYear = year - 1; }
  const pad = (n) => String(n).padStart(2, '0');
  return {
    periodStart: `${prevYear}-${pad(prevMonth)}-21`,
    periodEnd:   `${year}-${pad(month)}-20`
  };
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─── Sub-components ────────────────────────────────────────────────────────────
const InputField = ({ label, value, onChange, disabled }) => (
  <div>
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
      <input
        type="number" min="0" value={value}
        onChange={e => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        placeholder="0"
      />
    </div>
  </div>
);

const AttCard = ({ label, value, color = 'slate' }) => {
  const map = {
    slate:  'bg-slate-50 border-slate-200 text-slate-700',
    green:  'bg-emerald-50 border-emerald-100 text-emerald-700',
    red:    'bg-rose-50 border-rose-100 text-rose-700',
    amber:  'bg-amber-50 border-amber-100 text-amber-700',
    blue:   'bg-blue-50 border-blue-100 text-blue-700',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
    orange: 'bg-orange-50 border-orange-100 text-orange-700',
    violet: 'bg-violet-50 border-violet-100 text-violet-700',
  };
  return (
    <div className={`rounded-xl p-4 border ${map[color]}`}>
      <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const PayrollTab = ({ employeeId, employee }) => {
  const [month, setMonth]           = useState(new Date().getMonth() + 1);
  const [year, setYear]             = useState(new Date().getFullYear());
  const [loading, setLoading]       = useState(false);
  const [generating, setGenerating] = useState(false);
  const [payrollData, setPayrollData] = useState(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [history, setHistory]       = useState([]);

  // Salary inputs
  const [basicSalary, setBasicSalary]           = useState(30000);
  const [hra, setHra]                           = useState(0);
  const [medicalAllowance, setMedicalAllowance] = useState(0);
  const [travelAllowance, setTravelAllowance]   = useState(0);
  const [foodAllowance, setFoodAllowance]       = useState(0);
  const [specialAllowance, setSpecialAllowance] = useState(0);
  const [bonus, setBonus]                       = useState(0);
  const [overtime, setOvertime]                 = useState(0);
  const [otherEarnings, setOtherEarnings]       = useState(0);

  // Deductions
  const [professionalTax, setProfessionalTax] = useState(0);
  const [pf, setPf]                           = useState(0);
  const [esi, setEsi]                         = useState(0);
  const [tds, setTds]                         = useState(0);
  const [advance, setAdvance]                 = useState(0);
  const [loan, setLoan]                       = useState(0);
  const [lateFine, setLateFine]               = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);

  // Computed period for current selection (client-side — mirrors backend)
  const { periodStart, periodEnd } = getPayrollPeriod(month, year);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/payroll/${employeeId}/${month}/${year}`);
      if (res.data.success) {
        setPayrollData(res.data.data);
        setIsGenerated(res.data.isGenerated);
        if (res.data.isGenerated) {
          const d = res.data.data;
          setBasicSalary(d.basicSalary || 30000);
          setHra(d.hra || 0);                   setMedicalAllowance(d.medicalAllowance || 0);
          setTravelAllowance(d.travelAllowance || 0); setFoodAllowance(d.foodAllowance || 0);
          setSpecialAllowance(d.specialAllowance || 0); setBonus(d.bonus || 0);
          setOvertime(d.overtime || 0);         setOtherEarnings(d.otherEarnings || 0);
          setProfessionalTax(d.professionalTax || 0); setPf(d.pf || 0);
          setEsi(d.esi || 0);  setTds(d.tds || 0);   setAdvance(d.advance || 0);
          setLoan(d.loan || 0); setLateFine(d.lateFine || 0); setOtherDeductions(d.otherDeductions || 0);
        }
      }
    } catch { toast.error('Failed to load payroll data'); }
    finally { setLoading(false); }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/payroll/history/${employeeId}`);
      if (res.data.success) setHistory(res.data.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (employeeId) { fetchPayroll(); fetchHistory(); }
  }, [employeeId, month, year]);

  // ── Live salary preview calculations ──────────────────────────────────────
  const att = payrollData || {};
  const workDays = att.workingDays || 26;
  const pd = att.perDaySalary || (basicSalary / workDays);

  const totalAllowances = hra + medicalAllowance + travelAllowance + foodAllowance +
    specialAllowance + bonus + overtime + otherEarnings;
  const grossSalary = basicSalary + totalAllowances;

  const absentDeduction      = (att.absentDays || 0) * pd;
  const unpaidLeaveDeduction = (att.unpaidLeaves || 0) * pd;
  const halfDayDeduction     = (att.halfDays || 0) * (pd / 2);
  const totalDeductions = professionalTax + pf + esi + tds + advance + loan +
    lateFine + otherDeductions + absentDeduction + unpaidLeaveDeduction + halfDayDeduction;
  const netSalary = Math.max(0, grossSalary - totalDeductions);

  const displayGross      = isGenerated ? (att.grossSalary || 0)      : grossSalary;
  const displayDeductions = isGenerated ? (att.totalDeductions || 0)   : totalDeductions;
  const displayNet        = isGenerated ? (att.netSalary || 0)         : netSalary;

  const handleGenerate = async () => {
    if (!basicSalary || basicSalary <= 0) return toast.error('Enter a valid basic salary');
    if (!window.confirm(
      `Generate payroll for ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}?\n` +
      `Cycle: ${formatDateLabel(periodStart)} → ${formatDateLabel(periodEnd)}\n\nThis will lock it until deleted.`
    )) return;
    try {
      setGenerating(true);
      const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');
      const res = await api.post('/payroll/generate', {
        employeeId, month, year,
        basicSalary, workingDays: att.workingDays || 26,
        presentDays: att.presentDays || 0, absentDays: att.absentDays || 0,
        halfDays: att.halfDays || 0, paidLeaves: att.paidLeaves || 0,
        unpaidLeaves: att.unpaidLeaves || 0, weeklyOffs: att.weeklyOffs || 0,
        holidays: att.holidays || 0, lateMarks: att.lateMarks || 0,
        payableDays: att.payableDays || 0,
        hra, medicalAllowance, travelAllowance, foodAllowance,
        specialAllowance, bonus, overtime, otherEarnings,
        professionalTax, pf, esi, tds, advance, loan, lateFine, otherDeductions,
        adminId: adminInfo._id
      });
      if (res.data.success) { toast.success('Payroll generated!'); fetchPayroll(); fetchHistory(); }
    } catch (e) { toast.error(e.response?.data?.message || 'Error generating payroll'); }
    finally { setGenerating(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payroll record?')) return;
    try {
      setLoading(true);
      await api.delete(`/payroll/${id}`);
      toast.success('Payroll deleted');
      if (isGenerated && payrollData?._id === id) { setPayrollData(null); setIsGenerated(false); }
      fetchHistory();
    } catch { toast.error('Failed to delete'); }
    finally { setLoading(false); }
  };

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  if (loading && !payrollData) return (
    <div className="flex justify-center items-center h-48">
      <Loader2 className="animate-spin text-primary w-8 h-8" />
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ── Header Controls with Cycle Badge ──────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-border">
        <div className="flex flex-wrap gap-4 items-start justify-between">
          {/* Left: title + period */}
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
              <DollarSign size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="font-black text-slate-800">Payroll Calculator</h2>
              <p className="text-xs font-bold text-slate-500 mt-0.5">
                Payroll Month: <span className="text-slate-800">{monthName} {year}</span>
              </p>
              {/* Cycle period badge */}
              <div className="mt-2 inline-flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-xl px-3 py-1.5">
                <Calendar size={13} className="text-primary shrink-0" />
                <span className="text-[11px] font-black text-primary">
                  {formatDateLabel(periodStart)}
                </span>
                <ArrowRight size={12} className="text-primary/60" />
                <span className="text-[11px] font-black text-primary">
                  {formatDateLabel(periodEnd)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: selectors + cycle label */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2 bg-slate-50 p-1 rounded-xl border border-border">
              <select value={month} onChange={e => setMonth(Number(e.target.value))} disabled={loading}
                className="bg-white rounded-lg text-sm font-semibold text-slate-700 px-3 py-2 border-none shadow-sm focus:ring-0 cursor-pointer">
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select value={year} onChange={e => setYear(Number(e.target.value))} disabled={loading}
                className="bg-white rounded-lg text-sm font-semibold text-slate-700 px-3 py-2 border-none shadow-sm focus:ring-0 cursor-pointer">
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">
              Payroll Cycle: 21st → 20th
            </span>
          </div>
        </div>
      </div>

      {/* ── Attendance Summary ─────────────────────────────────────────────── */}
      {payrollData && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Calendar size={14} /> Attendance — Auto-fetched for payroll period
            </h3>
            <span className="text-[10px] font-black text-primary bg-primary/8 border border-primary/15 rounded-lg px-2.5 py-1">
              {formatDateLabel(att.periodStart || periodStart)} → {formatDateLabel(att.periodEnd || periodEnd)}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-3">
            <AttCard label="Working Days" value={att.workingDays || 0} color="slate" />
            <AttCard label="Present"      value={att.presentDays || 0} color="green" />
            <AttCard label="Absent"       value={att.absentDays || 0}  color="red" />
            <AttCard label="Half Day"     value={att.halfDays || 0}    color="amber" />
            <AttCard label="Paid Leave"   value={att.paidLeaves || 0}  color="blue" />
            <AttCard label="Unpaid Leave" value={att.unpaidLeaves || 0} color="orange" />
            <AttCard label="Weekly Off"   value={att.weeklyOffs || 0}  color="slate" />
            <AttCard label="Holidays"     value={att.holidays || 0}    color="indigo" />
            <AttCard label="Late Marks"   value={att.lateMarks || 0}   color="amber" />
            <AttCard label="Payable Days" value={att.payableDays || 0} color="green" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left: Inputs ────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Basic Salary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
              <DollarSign size={14} /> Basic Salary (Admin Editable)
            </h3>
            <div className="max-w-xs">
              <InputField label="Basic Salary" value={basicSalary} onChange={setBasicSalary} disabled={isGenerated} />
            </div>
            {isGenerated && (
              <div className="mt-3 flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-emerald-700">
                <Lock size={14} />
                <p className="text-xs font-bold">Payroll is locked. Delete from history to regenerate.</p>
              </div>
            )}
          </div>

          {/* Earnings */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-5 flex items-center gap-2">
              <TrendingUp size={14} /> Earnings &amp; Allowances
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InputField label="HRA"                value={hra}               onChange={setHra}               disabled={isGenerated} />
              <InputField label="Medical Allowance"  value={medicalAllowance}  onChange={setMedicalAllowance}  disabled={isGenerated} />
              <InputField label="Travel Allowance"   value={travelAllowance}   onChange={setTravelAllowance}   disabled={isGenerated} />
              <InputField label="Food Allowance"     value={foodAllowance}     onChange={setFoodAllowance}     disabled={isGenerated} />
              <InputField label="Special Allowance"  value={specialAllowance}  onChange={setSpecialAllowance}  disabled={isGenerated} />
              <InputField label="Bonus"              value={bonus}             onChange={setBonus}             disabled={isGenerated} />
              <InputField label="Overtime"           value={overtime}          onChange={setOvertime}           disabled={isGenerated} />
              <InputField label="Other Earnings"     value={otherEarnings}     onChange={setOtherEarnings}     disabled={isGenerated} />
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
              <span className="text-sm font-black text-slate-600">Total Allowances</span>
              <span className="font-black text-emerald-600 text-lg">{fmt(totalAllowances)}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-5 flex items-center gap-2">
              <TrendingDown size={14} /> Deductions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InputField label="Professional Tax" value={professionalTax} onChange={setProfessionalTax} disabled={isGenerated} />
              <InputField label="PF"               value={pf}             onChange={setPf}             disabled={isGenerated} />
              <InputField label="ESI"              value={esi}            onChange={setEsi}            disabled={isGenerated} />
              <InputField label="TDS"              value={tds}            onChange={setTds}            disabled={isGenerated} />
              <InputField label="Advance"          value={advance}        onChange={setAdvance}        disabled={isGenerated} />
              <InputField label="Loan"             value={loan}           onChange={setLoan}           disabled={isGenerated} />
              <InputField label="Late Fine"        value={lateFine}       onChange={setLateFine}       disabled={isGenerated} />
              <InputField label="Other Deductions" value={otherDeductions} onChange={setOtherDeductions} disabled={isGenerated} />
            </div>

            {/* Auto-calculated attendance deductions info */}
            {(att.absentDays > 0 || att.unpaidLeaves > 0 || att.halfDays > 0) && (
              <div className="mt-4 bg-rose-50 border border-rose-100 rounded-xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2">
                  Auto-Calculated from Attendance
                </p>
                {att.absentDays > 0 && (
                  <div className="flex justify-between text-sm font-medium text-rose-700 py-0.5">
                    <span>Absent ({att.absentDays} days)</span><span>-{fmt(absentDeduction)}</span>
                  </div>
                )}
                {att.unpaidLeaves > 0 && (
                  <div className="flex justify-between text-sm font-medium text-rose-700 py-0.5">
                    <span>Unpaid Leave ({att.unpaidLeaves} days)</span><span>-{fmt(unpaidLeaveDeduction)}</span>
                  </div>
                )}
                {att.halfDays > 0 && (
                  <div className="flex justify-between text-sm font-medium text-rose-700 py-0.5">
                    <span>Half Day ({att.halfDays} days)</span><span>-{fmt(halfDayDeduction)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
              <span className="text-sm font-black text-slate-600">Total Deductions</span>
              <span className="font-black text-rose-600 text-lg">-{fmt(displayDeductions)}</span>
            </div>
          </div>
        </div>

        {/* ── Right: Summary Card ─────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Salary Summary */}
          <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white sticky top-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Payroll Month</p>
            <p className="text-base font-black text-white mb-1">{monthName} {year}</p>

            {/* Period pill */}
            <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-2 mb-6 w-fit">
              <Calendar size={12} className="text-slate-400 shrink-0" />
              <span className="text-[10px] font-black text-slate-300">
                {formatDateLabel(att.periodStart || periodStart)}
              </span>
              <ArrowRight size={10} className="text-slate-500" />
              <span className="text-[10px] font-black text-slate-300">
                {formatDateLabel(att.periodEnd || periodEnd)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-slate-300 text-sm">Gross Salary</span>
                <span className="font-black">{fmt(displayGross)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-slate-300 text-sm">Total Deductions</span>
                <span className="font-black text-rose-400">-{fmt(displayDeductions)}</span>
              </div>
              <div className="pt-2">
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Net Payable</p>
                <p className="text-3xl font-black text-emerald-400">{fmt(displayNet)}</p>
              </div>
            </div>

            <div className="mt-6">
              {!isGenerated ? (
                <button onClick={handleGenerate} disabled={generating || loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-black rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50">
                  {generating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  Generate Payroll
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 justify-center bg-emerald-500/20 text-emerald-400 font-black text-sm py-2.5 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 size={15} /> Payroll Generated
                  </div>
                  <p className="text-center text-[10px] text-slate-500 font-medium">
                    View the full slip in the <span className="text-slate-300 font-black">Payslips</span> tab
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── History Table ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5">Payroll History</h3>
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  {['Payroll Month', 'Payroll Period', 'Basic', 'Gross', 'Deductions', 'Net Salary', 'Status', 'Action']
                    .map(h => <th key={h} className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4 whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.map(r => {
                  const rPeriodStart = r.periodStart || getPayrollPeriod(r.month, r.year).periodStart;
                  const rPeriodEnd   = r.periodEnd   || getPayrollPeriod(r.month, r.year).periodEnd;
                  return (
                    <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4">
                        <span className="font-black text-slate-800 block">
                          {new Date(r.year, r.month - 1).toLocaleString('default', { month: 'long' })}
                        </span>
                        <span className="text-xs text-slate-500">{r.year}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-50 border border-border rounded-lg px-2 py-1 whitespace-nowrap">
                          <Calendar size={10} className="text-primary" />
                          {formatDateLabel(rPeriodStart)}
                          <ArrowRight size={9} className="text-slate-400" />
                          {formatDateLabel(rPeriodEnd)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-slate-600">{fmt(r.basicSalary)}</td>
                      <td className="py-3 pr-4 font-bold text-slate-800">{fmt(r.grossSalary)}</td>
                      <td className="py-3 pr-4 font-bold text-rose-600">-{fmt(r.totalDeductions || r.deduction || 0)}</td>
                      <td className="py-3 pr-4 font-black text-emerald-600 text-base">{fmt(r.netSalary)}</td>
                      <td className="py-3 pr-4">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase">{r.status}</span>
                      </td>
                      <td className="py-3">
                        <button onClick={() => handleDelete(r._id)}
                          className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg transition-colors">
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 font-medium text-sm">No payroll history found.</div>
        )}
      </div>
    </div>
  );
};

export default PayrollTab;
