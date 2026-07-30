import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText, Download, Printer, Trash2, Eye, Loader2, CheckCircle2,
  Building2, User, Calendar, X
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

// ─── A4 Salary Slip Template ──────────────────────────────────────────────────
const SalarySlipA4 = ({ data, employee }) => {
  const monthName = new Date(data.year, data.month - 1).toLocaleString('default', { month: 'long' });
  const generatedDate = new Date(data.generatedDate || data.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const earningsRows = [
    { label: 'Basic Salary', amount: data.basicSalary },
    { label: 'House Rent Allowance (HRA)', amount: data.hra },
    { label: 'Medical Allowance', amount: data.medicalAllowance },
    { label: 'Travel Allowance', amount: data.travelAllowance },
    { label: 'Food Allowance', amount: data.foodAllowance },
    { label: 'Special Allowance', amount: data.specialAllowance },
    { label: 'Bonus', amount: data.bonus },
    { label: 'Overtime', amount: data.overtime },
    { label: 'Other Earnings', amount: data.otherEarnings },
  ].filter(r => r.amount > 0);

  const deductionRows = [
    { label: 'Professional Tax', amount: data.professionalTax },
    { label: 'Provident Fund (PF)', amount: data.pf },
    { label: 'ESI', amount: data.esi },
    { label: 'TDS', amount: data.tds },
    { label: 'Advance', amount: data.advance },
    { label: 'Loan', amount: data.loan },
    { label: 'Absent Deduction', amount: data.absentDeduction },
    { label: 'Unpaid Leave Deduction', amount: data.unpaidLeaveDeduction },
    { label: 'Late Fine', amount: data.lateFine },
    { label: 'Other Deductions', amount: data.otherDeductions },
  ].filter(r => r.amount > 0);

  const maxRows = Math.max(earningsRows.length, deductionRows.length);

  return (
    <div id="salary-slip-print" style={{ fontFamily: "'Segoe UI', Arial, sans-serif", background: '#fff', width: '794px', minHeight: '1123px', margin: '0 auto', padding: '36px 40px', boxSizing: 'border-box', position: 'relative', fontSize: '12px', color: '#1a1a2e' }}>
      {/* Watermark */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(-35deg)', fontSize: '80px', fontWeight: '900', color: 'rgba(99,102,241,0.04)', whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none', zIndex: 0 }}>
        ODITECH HRMS
      </div>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', borderRadius: '16px', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🏢</div>
            <div style={{ color: '#fff', fontSize: '22px', fontWeight: '900', letterSpacing: '-0.5px' }}>ODITECH GLOBAL</div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Bhubaneswar, Odisha, India</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px' }}>hr@oditechglobal.com | +91-XXXXXXXXXX</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '12px 20px', textAlign: 'right' }}>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: '900', letterSpacing: '1px' }}>SALARY SLIP</div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginTop: '4px' }}>
              Payroll Month: <strong>{monthName} {data.year}</strong>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginTop: '2px' }}>
              Payroll Period:<br/>
              {new Date(data.periodStart).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} to {new Date(data.periodEnd).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', marginTop: '4px' }}>Generated: {generatedDate}</div>
          </div>
        </div>
      </div>

      {/* Employee Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: '800', fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Employee Information</div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            {(data.employeePhoto || employee?.profileImage) ? (
              <img src={data.employeePhoto || employee?.profileImage} alt="emp" style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
            ) : (
              <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '900', color: '#4f46e5' }}>
                {(data.employeeName || employee?.fullName || 'E')[0]}
              </div>
            )}
            <div>
              <div style={{ fontWeight: '900', fontSize: '14px', color: '#1e293b' }}>{data.employeeName || employee?.fullName}</div>
              <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>{data.designation || employee?.role}</div>
              <div style={{ color: '#4f46e5', fontSize: '11px', fontWeight: '700', marginTop: '2px' }}>{data.employeeCode || employee?.empCode}</div>
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: '11px' }}>
            {[
              ['Department', data.department || employee?.department],
              ['Email', data.employeeEmail || employee?.email],
              ['Phone', data.employeePhone || employee?.phone],
              ['Joining Date', data.joiningDate ? new Date(data.joiningDate).toLocaleDateString('en-IN') : employee?.joinDate ? new Date(employee.joinDate).toLocaleDateString('en-IN') : '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <span style={{ color: '#94a3b8', fontWeight: '600' }}>{k}: </span>
                <span style={{ color: '#334155', fontWeight: '700' }}>{v || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: '800', fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Bank & ID Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: '11px' }}>
            {[
              ['PAN', data.panNumber || '—'],
              ['Aadhar', data.aadharNumber || '—'],
              ['Bank', data.bankName || '—'],
              ['Account No', data.accountNumber || '—'],
              ['IFSC', data.ifscCode || '—'],
              ['Branch', data.branchName || '—'],
              ['UPI', data.upiId || '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <span style={{ color: '#94a3b8', fontWeight: '600' }}>{k}: </span>
                <span style={{ color: '#334155', fontWeight: '700' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontWeight: '800', fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Attendance Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '6px' }}>
          {[
            { label: 'Working Days', value: data.workingDays, bg: '#f1f5f9', color: '#334155' },
            { label: 'Present', value: data.presentDays, bg: '#f0fdf4', color: '#16a34a' },
            { label: 'Absent', value: data.absentDays, bg: '#fff1f2', color: '#e11d48' },
            { label: 'Half Day', value: data.halfDays, bg: '#fffbeb', color: '#d97706' },
            { label: 'Paid Leave', value: data.paidLeaves, bg: '#eff6ff', color: '#2563eb' },
            { label: 'Unpaid Leave', value: data.unpaidLeaves, bg: '#fff7ed', color: '#ea580c' },
            { label: 'Weekly Off', value: data.weeklyOffs, bg: '#f8fafc', color: '#64748b' },
            { label: 'Holiday', value: data.holidays, bg: '#eef2ff', color: '#4f46e5' },
            { label: 'Late Marks', value: data.lateMarks || 0, bg: '#fffbeb', color: '#b45309' },
            { label: 'Payable Days', value: data.payableDays || data.presentDays, bg: '#f0fdf4', color: '#15803d' },
          ].map(({ label, value, bg, color }) => (
            <div key={label} style={{ background: bg, borderRadius: '8px', padding: '8px 6px', textAlign: 'center', border: `1px solid ${bg}` }}>
              <div style={{ fontSize: '14px', fontWeight: '900', color }}>{value ?? 0}</div>
              <div style={{ fontSize: '8.5px', fontWeight: '700', color: '#94a3b8', marginTop: '2px', lineHeight: '1.2' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings & Deductions Table */}
      <div style={{ marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          {/* Earnings */}
          <div style={{ borderRight: '1px solid #e2e8f0' }}>
            <div style={{ background: '#f0fdf4', padding: '10px 14px', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: '900', fontSize: '11px', color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Earnings</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '0 14px', gap: '0 10px' }}>
              <div style={{ color: '#64748b', padding: '5px 0', borderBottom: '1px solid #f1f5f9', fontSize: '10px', fontWeight: '700' }}>Description</div>
              <div style={{ color: '#64748b', padding: '5px 0', borderBottom: '1px solid #f1f5f9', fontSize: '10px', fontWeight: '700', textAlign: 'right' }}>Amount</div>
              {earningsRows.map((r, i) => (
                <React.Fragment key={i}>
                  <div style={{ color: '#334155', padding: '5px 0', borderBottom: '1px solid #f8fafc', fontSize: '11px', background: i % 2 === 0 ? 'transparent' : '#fafbfc' }}>{r.label}</div>
                  <div style={{ color: '#16a34a', padding: '5px 0', borderBottom: '1px solid #f8fafc', fontSize: '11px', fontWeight: '700', textAlign: 'right', background: i % 2 === 0 ? 'transparent' : '#fafbfc' }}>{fmt(r.amount)}</div>
                </React.Fragment>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f0fdf4', borderTop: '2px solid #bbf7d0', marginTop: '4px' }}>
              <span style={{ fontWeight: '900', fontSize: '11px', color: '#15803d' }}>Total Earnings</span>
              <span style={{ fontWeight: '900', fontSize: '11px', color: '#15803d' }}>{fmt(data.totalEarnings || data.grossSalary)}</span>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <div style={{ background: '#fff1f2', padding: '10px 14px', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: '900', fontSize: '11px', color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deductions</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '0 14px', gap: '0 10px' }}>
              <div style={{ color: '#64748b', padding: '5px 0', borderBottom: '1px solid #f1f5f9', fontSize: '10px', fontWeight: '700' }}>Description</div>
              <div style={{ color: '#64748b', padding: '5px 0', borderBottom: '1px solid #f1f5f9', fontSize: '10px', fontWeight: '700', textAlign: 'right' }}>Amount</div>
              {deductionRows.map((r, i) => (
                <React.Fragment key={i}>
                  <div style={{ color: '#334155', padding: '5px 0', borderBottom: '1px solid #f8fafc', fontSize: '11px', background: i % 2 === 0 ? 'transparent' : '#fafbfc' }}>{r.label}</div>
                  <div style={{ color: '#e11d48', padding: '5px 0', borderBottom: '1px solid #f8fafc', fontSize: '11px', fontWeight: '700', textAlign: 'right', background: i % 2 === 0 ? 'transparent' : '#fafbfc' }}>-{fmt(r.amount)}</div>
                </React.Fragment>
              ))}
              {deductionRows.length === 0 && (
                <div style={{ gridColumn: '1/-1', color: '#94a3b8', padding: '8px 0', fontSize: '11px' }}>No deductions</div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#fff1f2', borderTop: '2px solid #fecdd3', marginTop: '4px' }}>
              <span style={{ fontWeight: '900', fontSize: '11px', color: '#e11d48' }}>Total Deductions</span>
              <span style={{ fontWeight: '900', fontSize: '11px', color: '#e11d48' }}>-{fmt(data.totalDeductions || data.deduction)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Salary */}
      <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '2px solid #86efac', borderRadius: '14px', padding: '16px 20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: '800', color: '#15803d', textTransform: 'uppercase', letterSpacing: '1px' }}>Net Payable Salary</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#16a34a', marginTop: '4px' }}>{fmt(data.netSalary)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', fontWeight: '800', color: '#15803d', textTransform: 'uppercase', letterSpacing: '1px' }}>Amount in Words</div>
          <div style={{ fontSize: '11px', color: '#166534', fontWeight: '700', marginTop: '4px', maxWidth: '280px', fontStyle: 'italic' }}>
            {data.amountInWords || '—'}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '40px', borderBottom: '1px solid #cbd5e1', marginBottom: '6px' }}></div>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b' }}>Employee Signature</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '40px', borderBottom: '1px solid #cbd5e1', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94a3b8' }}>
            [HR Signature]
          </div>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b' }}>HR Manager</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: '40px', borderBottom: '1px solid #cbd5e1', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94a3b8' }}>
            [Company Seal]
          </div>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b' }}>Authorized Signatory</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '9px', color: '#94a3b8', fontWeight: '600' }}>
        This is a computer-generated salary slip. No physical signature is required. | Generated on {generatedDate}
      </div>
    </div>
  );
};

// ─── PayslipsTab Component ────────────────────────────────────────────────────
const PayslipsTab = ({ employeeId, employee }) => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchPayslips = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/payroll/history/${employeeId}`);
      if (res.data.success) setPayslips(res.data.data);
    } catch (e) { toast.error('Failed to load payslips'); }
    finally { setLoading(false); }
  }, [employeeId]);

  useEffect(() => { if (employeeId) fetchPayslips(); }, [employeeId, fetchPayslips]);

  const openSlip = (slip) => { setSelectedSlip(slip); setShowSlipModal(true); };

  const handlePrint = () => {
    const style = document.createElement('style');
    style.innerHTML = `@media print { body * { visibility: hidden; } #salary-slip-print, #salary-slip-print * { visibility: visible; } #salary-slip-print { position: fixed; left: 0; top: 0; width: 100%; } }`;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => document.head.removeChild(style), 1000);
  };

  const handleDownloadPDF = async (slip) => {
    try {
      setDownloadingId(slip._id);
      setSelectedSlip(slip);
      setShowSlipModal(true);
      // Give the DOM a moment to render
      await new Promise(r => setTimeout(r, 600));

      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('salary-slip-print');
      if (!element) { toast.error('Slip not rendered yet, try again'); return; }

      const monthName = new Date(slip.year, slip.month - 1).toLocaleString('default', { month: 'long' });
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `Salary_Slip_${slip.employeeName || employee?.fullName}_${monthName}_${slip.year}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all'] }
        })
        .from(element)
        .save();

      toast.success('PDF downloaded!');
    } catch (e) {
      console.error(e);
      toast.error('PDF generation failed. Try Print instead.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payslip?')) return;
    try {
      await api.delete(`/payroll/${id}`);
      toast.success('Payslip deleted');
      fetchPayslips();
      if (selectedSlip?._id === id) setShowSlipModal(false);
    } catch (e) { toast.error('Failed to delete'); }
  };

  const monthLabel = (m, y) => `${new Date(y, m - 1).toLocaleString('default', { month: 'long' })} ${y}`;
  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center">
            <FileText size={20} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="font-black text-slate-800">Salary Payslips</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">All Generated Payslips</p>
          </div>
        </div>
        <span className="bg-indigo-50 text-indigo-700 font-black text-sm px-4 py-2 rounded-xl border border-indigo-100">
          {payslips.length} slip{payslips.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin text-primary w-7 h-7" /></div>
      ) : payslips.length === 0 ? (
        <div className="bg-white rounded-2xl p-14 shadow-sm border border-border text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-slate-400" />
          </div>
          <h3 className="font-black text-slate-700 mb-1">No Payslips Yet</h3>
          <p className="text-sm text-slate-400 font-medium">Generate payroll from the Payroll tab to create payslips.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b-2 border-slate-100">
                <tr>
                  {['Month/Year', 'Basic Salary', 'Gross Salary', 'Total Deductions', 'Net Salary', 'Status', 'Generated On', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payslips.map((slip, idx) => (
                  <tr key={slip._id} className={`hover:bg-slate-50/70 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                    <td className="px-5 py-4">
                      <div className="font-black text-slate-800">{new Date(slip.year, slip.month - 1).toLocaleString('default', { month: 'long' })}</div>
                      <div className="text-xs font-semibold text-slate-400">{slip.year}</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700">{fmt(slip.basicSalary)}</td>
                    <td className="px-5 py-4 font-bold text-slate-800">{fmt(slip.grossSalary)}</td>
                    <td className="px-5 py-4 font-bold text-rose-600">-{fmt(slip.totalDeductions || slip.deduction || 0)}</td>
                    <td className="px-5 py-4 font-black text-emerald-600 text-base">{fmt(slip.netSalary)}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${slip.status === 'Locked' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {slip.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
                      {new Date(slip.generatedDate || slip.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openSlip(slip)} title="View"
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" >
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleDownloadPDF(slip)} disabled={downloadingId === slip._id} title="Download PDF"
                          className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-50">
                          {downloadingId === slip._id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        </button>
                        <button onClick={() => { openSlip(slip); setTimeout(handlePrint, 400); }} title="Print"
                          className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                          <Printer size={14} />
                        </button>
                        <button onClick={() => handleDelete(slip._id)} title="Delete"
                          className="p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slip Modal */}
      {showSlipModal && selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-sm overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <FileText size={16} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800">Salary Slip — {monthLabel(selectedSlip.month, selectedSlip.year)}</h3>
                  <p className="text-xs font-semibold text-slate-400">{selectedSlip.employeeName || employee?.fullName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDownloadPDF(selectedSlip)} disabled={downloadingId === selectedSlip._id}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50">
                  {downloadingId === selectedSlip._id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  Download PDF
                </button>
                <button onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">
                  <Printer size={14} /> Print
                </button>
                <button onClick={() => setShowSlipModal(false)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Slip Content */}
            <div className="overflow-x-auto p-4 bg-slate-50">
              <div style={{ transformOrigin: 'top left' }}>
                <SalarySlipA4 data={selectedSlip} employee={employee} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayslipsTab;
