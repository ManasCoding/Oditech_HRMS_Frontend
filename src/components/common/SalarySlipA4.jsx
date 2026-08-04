import React from 'react';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);


const SalarySlipA4 = ({ data, employee, containerId = 'salary-slip-print' }) => {
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
    <div id={containerId} style={{ fontFamily: "'Segoe UI', Arial, sans-serif", background: '#fff', width: '794px', height: '1123px', overflow: 'hidden', margin: '0 auto', padding: '36px 40px', boxSizing: 'border-box', position: 'relative', fontSize: '12px', color: '#1a1a2e' }}>
      {/* Watermark */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(-35deg)', fontSize: '80px', fontWeight: '900', color: 'rgba(99,102,241,0.04)', whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none', zIndex: 0 }}>
        ODITECH HRMS
      </div>

      {/* Premium Header - Tailwind Implementation */}
      <div className="relative w-full h-[250px] overflow-hidden rounded-[28px] p-8 mb-6 flex justify-between items-center shadow-[0_8px_30px_rgba(0,0,0,0.15)] bg-gradient-to-r from-[#07152E] to-[#0B2347]">
        
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-32 h-32 opacity-10" style={{ backgroundImage: 'radial-gradient(#1976FF 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}></div>
        <div className="absolute top-0 right-0 w-40 h-40 opacity-10" style={{ backgroundImage: 'radial-gradient(#1976FF 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}></div>
        
        {/* Decorative Bottom Left Waves */}
        <svg className="absolute bottom-0 left-0 w-[400px] h-[100px] pointer-events-none" viewBox="0 0 400 100" preserveAspectRatio="none">
           <path d="M0,100 C150,100 200,40 400,0 L400,100 Z" fill="#041f4d" />
           <path d="M0,100 C120,100 160,50 300,0 L0,0 Z" fill="transparent" stroke="#F6B000" strokeWidth="2" className="opacity-80" />
           <path d="M0,100 C150,100 220,50 350,0 L0,0 Z" fill="transparent" stroke="#1976FF" strokeWidth="4" className="opacity-60" />
        </svg>

        {/* Left Section (Width: 55%) */}
        <div className="w-[55%] h-full z-10 flex items-center justify-start gap-6">
          
          {/* Logo */}
          <div className="h-[140px] flex items-center justify-center shrink-0">
            <img src="/logo.jpeg" alt="Oditech Global" className="h-full w-auto object-contain" />
          </div>

          {/* Vertical Divider */}
          <div className="w-[1px] h-[140px] shrink-0" style={{ background: 'linear-gradient(to bottom, transparent, rgba(25,118,255,0.4), transparent)' }}></div>

          {/* Contact Info */}
          <div className="flex flex-col justify-center shrink-0">
            <div className="text-white text-[28px] font-[800] mb-4 tracking-wide font-poppins">ODITECH GLOBAL</div>
            <div className="flex flex-col gap-[14px]">
              <div className="flex items-center gap-4">
                <div className="w-[28px] h-[28px] rounded-full bg-[#1976FF] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(25,118,255,0.4)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <span className="text-white text-[13px] font-[600] font-poppins">Bhubaneswar, Odisha, India</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-[28px] h-[28px] rounded-full bg-[#1976FF] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(25,118,255,0.4)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <span className="text-white text-[13px] font-[600] font-poppins">official@oditechglobal.com</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-[28px] h-[28px] rounded-full bg-[#1976FF] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(25,118,255,0.4)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <span className="text-white text-[13px] font-[600] font-poppins">9124670011</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel (Width: 42%) */}
        <div className="w-[42%] h-full z-10 bg-[#061530]/80 backdrop-blur-md rounded-[30px] border border-[#1976FF]/60 px-5 py-4 shadow-xl flex flex-col justify-between">
          <div className="text-center text-white text-[22px] font-[800] tracking-wide font-poppins mt-2">SALARY SLIP</div>
          
          {/* Custom Divider with Diamond */}
          <div className="flex items-center justify-center my-2">
            <div className="flex-1 h-[1px]" style={{ background: 'linear-gradient(to left, rgba(25,118,255,0.6), transparent)' }}></div>
            <div className="w-[4px] h-[4px] bg-[#1976FF] rotate-45 mx-2 rounded-[1px] shadow-[0_0_8px_#1976FF]"></div>
            <div className="flex-1 h-[1px]" style={{ background: 'linear-gradient(to right, rgba(25,118,255,0.6), transparent)' }}></div>
          </div>
          
          <div className="flex flex-col flex-1 justify-center gap-1">
            
            {/* Row 1 */}
            <div className="flex items-center justify-between h-[44px]">
              <div className="flex items-center gap-3">
                <div className="w-[32px] h-[32px] rounded-full bg-[#1976FF]/10 border border-[#1976FF]/40 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1976FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <span className="text-[#EAF3FF] text-[13px] font-[600] font-poppins">Payroll Month:</span>
              </div>
              <span className="text-[#1976FF] text-[13px] font-[700] font-poppins">{monthName} {data.year}</span>
            </div>
            
            <div className="w-full h-[1px] bg-[#1976FF]/30"></div>
            
            {/* Row 2 */}
            <div className="flex items-center justify-between h-[44px]">
              <div className="flex items-center gap-3">
                <div className="w-[32px] h-[32px] rounded-full bg-[#F6B000]/10 border border-[#F6B000]/40 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F6B000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <span className="text-[#EAF3FF] text-[13px] font-[600] font-poppins">Payroll Period:</span>
              </div>
              <span className="text-[#F6B000] text-[12px] font-[700] font-poppins">{new Date(data.periodStart).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} to {new Date(data.periodEnd).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>

            <div className="w-full h-[1px] bg-[#1976FF]/30"></div>
            
            {/* Row 3 */}
            <div className="flex items-center justify-between h-[44px]">
              <div className="flex items-center gap-3">
                <div className="w-[32px] h-[32px] rounded-full bg-[#4CD964]/10 border border-[#4CD964]/40 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CD964" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <span className="text-[#EAF3FF] text-[13px] font-[600] font-poppins">Generated:</span>
              </div>
              <span className="text-[#4CD964] text-[13px] font-[700] font-poppins">{generatedDate}</span>
            </div>
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

export default SalarySlipA4;
