import React, { useState, useEffect } from 'react';
import {
  Calendar, FileText, DollarSign, Loader2, CheckCircle2, Lock,
  TrendingUp, TrendingDown, Edit3, RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const InputField = ({ label, value, onChange, disabled, prefix = '₹' }) => (
  <div>
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</label>
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{prefix}</span>}
      <input
        type="number"
        min="0"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        disabled={disabled}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl ${prefix ? 'pl-7' : 'pl-3'} pr-3 py-2.5 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        placeholder="0"
      />
    </div>
  </div>
);

const SummaryCard = ({ label, value, color = 'slate' }) => {
  const colors = {
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
    green: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    red: 'bg-rose-50 border-rose-100 text-rose-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
    orange: 'bg-orange-50 border-orange-100 text-orange-700',
  };
  return (
    <div className={`rounded-xl p-4 border ${colors[color]}`}>
      <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
};

const PayrollTab = ({ employeeId, employee }) => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [payrollData, setPayrollData] = useState(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [history, setHistory] = useState([]);

  // Salary inputs
  const [basicSalary, setBasicSalary] = useState(30000);
  const [hra, setHra] = useState(0);
  const [medicalAllowance, setMedicalAllowance] = useState(0);
  const [travelAllowance, setTravelAllowance] = useState(0);
  const [foodAllowance, setFoodAllowance] = useState(0);
  const [specialAllowance, setSpecialAllowance] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [overtime, setOvertime] = useState(0);
  const [otherEarnings, setOtherEarnings] = useState(0);

  // Deduction inputs
  const [professionalTax, setProfessionalTax] = useState(0);
  const [pf, setPf] = useState(0);
  const [esi, setEsi] = useState(0);
  const [tds, setTds] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [loan, setLoan] = useState(0);
  const [lateFine, setLateFine] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);

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
          setHra(d.hra || 0); setMedicalAllowance(d.medicalAllowance || 0);
          setTravelAllowance(d.travelAllowance || 0); setFoodAllowance(d.foodAllowance || 0);
          setSpecialAllowance(d.specialAllowance || 0); setBonus(d.bonus || 0);
          setOvertime(d.overtime || 0); setOtherEarnings(d.otherEarnings || 0);
          setProfessionalTax(d.professionalTax || 0); setPf(d.pf || 0);
          setEsi(d.esi || 0); setTds(d.tds || 0); setAdvance(d.advance || 0);
          setLoan(d.loan || 0); setLateFine(d.lateFine || 0); setOtherDeductions(d.otherDeductions || 0);
        }
      }
    } catch (e) { toast.error('Failed to load payroll data'); }
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

  // Derived calculations
  const att = payrollData || {};
  const pd = att.perDaySalary || (basicSalary / (att.workingDays || 26));
  const totalAllowances = hra + medicalAllowance + travelAllowance + foodAllowance + specialAllowance + bonus + overtime + otherEarnings;
  const grossSalary = basicSalary + totalAllowances;
  const absentDeduction = (att.absentDays || 0) * pd;
  const unpaidLeaveDeduction = (att.unpaidLeaves || 0) * pd;
  const halfDayDeduction = (att.halfDays || 0) * (pd / 2);
  const totalDeductions = professionalTax + pf + esi + tds + advance + loan + lateFine + otherDeductions + absentDeduction + unpaidLeaveDeduction + halfDayDeduction;
  const netSalary = Math.max(0, grossSalary - totalDeductions);

  // If already generated, use stored values
  const displayGross = isGenerated ? (att.grossSalary || 0) : grossSalary;
  const displayDeductions = isGenerated ? (att.totalDeductions || 0) : totalDeductions;
  const displayNet = isGenerated ? (att.netSalary || 0) : netSalary;

  const handleGenerate = async () => {
    if (!basicSalary || basicSalary <= 0) return toast.error('Enter a valid basic salary');
    if (!window.confirm('Generate payroll for this month? This will lock it until deleted.')) return;
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
        hra, medicalAllowance, travelAllowance, foodAllowance, specialAllowance, bonus, overtime, otherEarnings,
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
    } catch (e) { toast.error('Failed to delete'); }
    finally { setLoading(false); }
  };

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  if (loading && !payrollData) return (
    <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-border flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <DollarSign size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="font-black text-slate-800">Payroll Calculator</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{monthName} {year}</p>
          </div>
        </div>
        <div className="flex gap-2 bg-slate-50 p-1 rounded-xl border border-border">
          <select value={month} onChange={e => setMonth(Number(e.target.value))} disabled={loading}
            className="bg-white rounded-lg text-sm font-semibold text-slate-700 px-3 py-2 border-none shadow-sm focus:ring-0 cursor-pointer">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} disabled={loading}
            className="bg-white rounded-lg text-sm font-semibold text-slate-700 px-3 py-2 border-none shadow-sm focus:ring-0 cursor-pointer">
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance Summary */}
      {payrollData && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
            <Calendar size={14} /> Auto-Fetched Attendance — {monthName} {year}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <SummaryCard label="Working Days" value={att.workingDays || 0} color="slate" />
            <SummaryCard label="Present" value={att.presentDays || 0} color="green" />
            <SummaryCard label="Absent" value={att.absentDays || 0} color="red" />
            <SummaryCard label="Half Day" value={att.halfDays || 0} color="amber" />
            <SummaryCard label="Paid Leave" value={att.paidLeaves || 0} color="blue" />
            <SummaryCard label="Unpaid Leave" value={att.unpaidLeaves || 0} color="orange" />
            <SummaryCard label="Weekly Off" value={att.weeklyOffs || 0} color="slate" />
            <SummaryCard label="Holidays" value={att.holidays || 0} color="indigo" />
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <SummaryCard label="Late Marks" value={att.lateMarks || 0} color="amber" />
            <SummaryCard label="Payable Days" value={att.payableDays || 0} color="green" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Salary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
              <DollarSign size={14} /> Basic Salary (Admin Editable)
            </h3>
            <div className="max-w-xs">
              <InputField label="Basic Salary" value={basicSalary} onChange={setBasicSalary} disabled={isGenerated} />
            </div>
            {isGenerated && <div className="mt-3 flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
              <Lock size={14} /><p className="text-xs font-bold">Payroll locked. Delete from history to regenerate.</p>
            </div>}
          </div>

          {/* Allowances */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-5 flex items-center gap-2">
              <TrendingUp size={14} /> Earnings & Allowances
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InputField label="House Rent Allowance" value={hra} onChange={setHra} disabled={isGenerated} />
              <InputField label="Medical Allowance" value={medicalAllowance} onChange={setMedicalAllowance} disabled={isGenerated} />
              <InputField label="Travel Allowance" value={travelAllowance} onChange={setTravelAllowance} disabled={isGenerated} />
              <InputField label="Food Allowance" value={foodAllowance} onChange={setFoodAllowance} disabled={isGenerated} />
              <InputField label="Special Allowance" value={specialAllowance} onChange={setSpecialAllowance} disabled={isGenerated} />
              <InputField label="Bonus" value={bonus} onChange={setBonus} disabled={isGenerated} />
              <InputField label="Overtime" value={overtime} onChange={setOvertime} disabled={isGenerated} />
              <InputField label="Other Earnings" value={otherEarnings} onChange={setOtherEarnings} disabled={isGenerated} />
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
              <span className="text-sm font-black text-slate-600">Total Allowances</span>
              <span className="font-black text-emerald-600 text-lg">{fmt(hra + medicalAllowance + travelAllowance + foodAllowance + specialAllowance + bonus + overtime + otherEarnings)}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-5 flex items-center gap-2">
              <TrendingDown size={14} /> Deductions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InputField label="Professional Tax" value={professionalTax} onChange={setProfessionalTax} disabled={isGenerated} />
              <InputField label="PF" value={pf} onChange={setPf} disabled={isGenerated} />
              <InputField label="ESI" value={esi} onChange={setEsi} disabled={isGenerated} />
              <InputField label="TDS" value={tds} onChange={setTds} disabled={isGenerated} />
              <InputField label="Advance" value={advance} onChange={setAdvance} disabled={isGenerated} />
              <InputField label="Loan" value={loan} onChange={setLoan} disabled={isGenerated} />
              <InputField label="Late Fine" value={lateFine} onChange={setLateFine} disabled={isGenerated} />
              <InputField label="Other Deductions" value={otherDeductions} onChange={setOtherDeductions} disabled={isGenerated} />
            </div>
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              {(att.absentDays > 0 || att.unpaidLeaves > 0 || att.halfDays > 0) && (
                <div className="bg-rose-50 rounded-xl p-3 text-sm font-medium text-rose-700 border border-rose-100">
                  <p className="font-black text-rose-600 text-[10px] uppercase tracking-widest mb-1">Auto-Calculated Deductions</p>
                  {att.absentDays > 0 && <div className="flex justify-between"><span>Absent ({att.absentDays}d)</span><span>-{fmt(absentDeduction)}</span></div>}
                  {att.unpaidLeaves > 0 && <div className="flex justify-between"><span>Unpaid Leave ({att.unpaidLeaves}d)</span><span>-{fmt(unpaidLeaveDeduction)}</span></div>}
                  {att.halfDays > 0 && <div className="flex justify-between"><span>Half Day ({att.halfDays}d)</span><span>-{fmt(halfDayDeduction)}</span></div>}
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm font-black text-slate-600">Total Deductions</span>
                <span className="font-black text-rose-600 text-lg">{fmt(displayDeductions)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="space-y-5">
          {/* Final Summary Card */}
          <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white sticky top-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Salary Summary</p>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-slate-300 text-sm">Gross Salary</span>
                <span className="font-black">{fmt(displayGross)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-slate-300 text-sm">Total Earnings</span>
                <span className="font-black text-emerald-400">{fmt(displayGross)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-slate-300 text-sm">Total Deductions</span>
                <span className="font-black text-rose-400">-{fmt(displayDeductions)}</span>
              </div>
              <div className="pt-2">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Net Payable Salary</p>
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
                  <div className="flex items-center gap-2 justify-center bg-emerald-500/20 text-emerald-400 font-black text-sm py-2 rounded-xl">
                    <CheckCircle2 size={16} /> Payroll Generated
                  </div>
                  <p className="text-center text-[10px] text-slate-500 font-medium">View full payslip in the <strong className="text-slate-300">Payslips</strong> tab</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5">Payroll History</h3>
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  {['Month/Year','Basic','Gross','Deductions','Net Salary','Status','Action'].map(h => (
                    <th key={h} className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4">
                      <span className="font-bold text-slate-800 block">{new Date(r.year, r.month - 1).toLocaleString('default', { month: 'long' })}</span>
                      <span className="text-xs text-slate-500">{r.year}</span>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-slate-700">{fmt(r.basicSalary)}</td>
                    <td className="py-3 pr-4 font-bold text-slate-800">{fmt(r.grossSalary)}</td>
                    <td className="py-3 pr-4 font-bold text-rose-600">-{fmt(r.totalDeductions || r.deduction)}</td>
                    <td className="py-3 pr-4 font-black text-emerald-600">{fmt(r.netSalary)}</td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase">{r.status}</span>
                    </td>
                    <td className="py-3">
                      <button onClick={() => handleDelete(r._id)} className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                    </td>
                  </tr>
                ))}
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
