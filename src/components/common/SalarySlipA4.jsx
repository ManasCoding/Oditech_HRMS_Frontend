import React from 'react';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

/* ─── tiny helpers ─── */
const IconCircle = ({ color, borderColor, children, size = 28 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: color, border: `1.5px solid ${borderColor}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    boxShadow: `0 0 8px ${borderColor}60`,
  }}>
    {children}
  </div>
);

/* ──────────────────────────────────────────────
   HEADER COMPONENT  (matches reference exactly)
   794 px wide · 215 px tall
────────────────────────────────────────────── */
const Header = ({ data, employee }) => {
  const monthName = new Date(data.year, data.month - 1).toLocaleString('default', { month: 'long' });
  const generatedDate = new Date(data.generatedDate || data.createdAt)
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace(/ /g, ' ');

  const periodStart = data.periodStart
    ? new Date(data.periodStart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
  const periodEnd = data.periodEnd
    ? new Date(data.periodEnd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div style={{
      width: '100%',
      height: 215,
      borderRadius: 22,
      background: 'linear-gradient(130deg, #07142F 0%, #0A234A 55%, #0D2B58 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px 0 18px',
      boxSizing: 'border-box',
      marginBottom: 18,
      fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    }}>

      {/* ── Dotted pattern – top-left ── */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: 120, height: 110, opacity: 0.18, pointerEvents: 'none' }}
        viewBox="0 0 120 110">
        {Array.from({ length: 8 }, (_, row) =>
          Array.from({ length: 10 }, (_, col) => (
            <circle key={`tl-${row}-${col}`} cx={col * 13 + 6} cy={row * 13 + 6} r={1.8} fill="#4A9EFF" />
          ))
        )}
      </svg>

      {/* ── Dotted pattern – top-right ── */}
      <svg style={{ position: 'absolute', top: 0, right: 0, width: 110, height: 90, opacity: 0.18, pointerEvents: 'none' }}
        viewBox="0 0 110 90">
        {Array.from({ length: 7 }, (_, row) =>
          Array.from({ length: 9 }, (_, col) => (
            <circle key={`tr-${row}-${col}`} cx={col * 13 + 6} cy={row * 13 + 6} r={1.8} fill="#4A9EFF" />
          ))
        )}
      </svg>

      {/* ── Bottom waves ── */}
      <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 90, pointerEvents: 'none' }}
        viewBox="0 0 794 90" preserveAspectRatio="none">
        {/* Dark fill wave */}
        <path d="M0,90 C200,90 380,30 794,0 L794,90 Z" fill="#051226" />
        {/* Gold thin curved line */}
        <path d="M0,90 C160,90 280,42 480,8" fill="none" stroke="#F6B000" strokeWidth="1.8" opacity="0.85" />
        {/* Blue medium wave */}
        <path d="M0,90 C220,90 400,38 794,4 L794,90 Z" fill="none" stroke="#1E6FE0" strokeWidth="3" opacity="0.55" />
        {/* Subtle blue abstract curves lower-right */}
        <path d="M500,90 C580,60 680,30 794,20" fill="none" stroke="#2488FF" strokeWidth="1.2" opacity="0.35" />
        <path d="M620,90 C700,70 760,50 794,40" fill="none" stroke="#2488FF" strokeWidth="0.8" opacity="0.25" />
      </svg>

      {/* ══════════════════════════════════════
          LEFT BLOCK – Logo + Company name
      ══════════════════════════════════════ */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: 130, flexShrink: 0, zIndex: 2,
      }}>
        {/* Logo box */}
        <div style={{
          width: 110, height: 110,
          background: '#000',
          borderRadius: 10,
          overflow: 'hidden',
          border: '2px solid #1E3A6E',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src="/logo.jpeg" alt="Oditech Global" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Company name under logo */}
        <div style={{ marginTop: 8, textAlign: 'center', lineHeight: 1.15 }}>
          <div style={{ fontWeight: 900, fontSize: 14, color: '#fff', letterSpacing: 1.5, textTransform: 'uppercase' }}>
            ODITECH
          </div>
          <div style={{ fontWeight: 600, fontSize: 9, color: '#8ab4e8', letterSpacing: 0.8 }}>
            GLOBAL Pvt. Ltd
          </div>
        </div>

        {/* Gold decorative line with arrows */}
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, width: '100%', justifyContent: 'center' }}>
          {/* Left arrow-head */}
          <svg width="14" height="8" viewBox="0 0 14 8">
            <polyline points="13,4 4,1" stroke="#F6B000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <polyline points="4,1 4,7" stroke="#F6B000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
          {/* Line */}
          <div style={{ flex: 1, height: 1.5, background: 'linear-gradient(90deg, #F6B000aa, #F6B000, #F6B000aa)', borderRadius: 1 }} />
          {/* Right arrow-head */}
          <svg width="14" height="8" viewBox="0 0 14 8">
            <polyline points="1,4 10,1" stroke="#F6B000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <polyline points="10,1 10,7" stroke="#F6B000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* ── Thin vertical gradient divider ── */}
      <div style={{
        width: 1, height: 140, flexShrink: 0,
        background: 'linear-gradient(to bottom, transparent, rgba(30,136,255,0.45), transparent)',
        marginLeft: 16, marginRight: 18, zIndex: 2,
      }} />

      {/* ══════════════════════════════════════
          CENTER BLOCK – Company info
      ══════════════════════════════════════ */}
      <div style={{ flex: 1, zIndex: 2, paddingTop: 8 }}>
        <div style={{
          fontWeight: 800, fontSize: 22, color: '#fff',
          letterSpacing: 1.2, marginBottom: 14, lineHeight: 1,
        }}>
          ODITECH GLOBAL
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconCircle color="#1E6FE0" borderColor="#2488FF">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </IconCircle>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>Bhubaneswar, Odisha, India</span>
          </div>

          {/* Email */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconCircle color="#1E6FE0" borderColor="#2488FF">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </IconCircle>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>official@oditechglobal.com</span>
          </div>

          {/* Phone */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconCircle color="#1E6FE0" borderColor="#2488FF">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 12 19.79 19.79 0 0 1 1.06 3.4 2 2 0 0 1 3.04 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </IconCircle>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>9124670011</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT PANEL – Floating Salary Slip card
      ══════════════════════════════════════ */}
      <div style={{
        width: 290, flexShrink: 0, zIndex: 10,
        background: 'rgba(4,18,46,0.82)',
        backdropFilter: 'blur(12px)',
        borderRadius: 18,
        border: '1.5px solid rgba(30,136,255,0.65)',
        boxShadow: '0 0 24px rgba(30,136,255,0.18), 0 4px 24px rgba(0,0,0,0.35)',
        padding: '14px 18px 14px',
        display: 'flex', flexDirection: 'column', gap: 0,
      }}>
        {/* Title */}
        <div style={{
          textAlign: 'center', color: '#fff',
          fontWeight: 800, fontSize: 18, letterSpacing: 1.5,
          marginBottom: 8,
        }}>
          SALARY SLIP
        </div>

        {/* Divider with glowing center dot */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(30,136,255,0.7))' }} />
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#1E88FF',
            boxShadow: '0 0 8px #1E88FF, 0 0 14px #1E88FF80',
            margin: '0 6px',
          }} />
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(30,136,255,0.7), transparent)' }} />
        </div>

        {/* ── Row 1: Payroll Month ── */}
        <div style={{ display: 'flex', alignItems: 'center', height: 44, gap: 10 }}>
          <IconCircle color="rgba(30,136,255,0.12)" borderColor="rgba(30,136,255,0.5)" size={32}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E88FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </IconCircle>
          <span style={{ color: '#EAF3FF', fontSize: 12, fontWeight: 600, flex: 1 }}>Payroll Month:</span>
          <span style={{ color: '#1E88FF', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {monthName} {data.year}
          </span>
        </div>

        <div style={{ height: 1, background: 'rgba(30,136,255,0.28)', margin: '0 0' }} />

        {/* ── Row 2: Payroll Period ── */}
        <div style={{ display: 'flex', alignItems: 'center', height: 52, gap: 10 }}>
          <IconCircle color="rgba(246,176,0,0.12)" borderColor="rgba(246,176,0,0.45)" size={32}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F6B000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </IconCircle>
          <span style={{ color: '#EAF3FF', fontSize: 12, fontWeight: 600, flex: 1 }}>Payroll Period:</span>
          <span style={{ color: '#F6B000', fontSize: 11, fontWeight: 700, textAlign: 'right', maxWidth: 120 }}>
            {periodStart} to {periodEnd}
          </span>
        </div>

        <div style={{ height: 1, background: 'rgba(30,136,255,0.28)', margin: '0 0' }} />

        {/* ── Row 3: Generated Date ── */}
        <div style={{ display: 'flex', alignItems: 'center', height: 44, gap: 10 }}>
          <IconCircle color="rgba(61,220,132,0.12)" borderColor="rgba(61,220,132,0.45)" size={32}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3DDC84" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </IconCircle>
          <span style={{ color: '#EAF3FF', fontSize: 12, fontWeight: 600, flex: 1 }}>Generated:</span>
          <span style={{ color: '#3DDC84', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {generatedDate}
          </span>
        </div>
      </div>
    </div>
  );
};


/* ──────────────────────────────────────────────
   MAIN SALARY SLIP A4  (794 × 1123 px)
────────────────────────────────────────────── */
const SalarySlipA4 = ({ data, employee, containerId = 'salary-slip-print' }) => {
  const generatedDate = new Date(data.generatedDate || data.createdAt)
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const earningsRows = [
    { label: 'Basic Salary',              amount: data.basicSalary },
    { label: 'House Rent Allowance (HRA)', amount: data.hra },
    { label: 'Medical Allowance',          amount: data.medicalAllowance },
    { label: 'Travel Allowance',           amount: data.travelAllowance },
    { label: 'Food Allowance',             amount: data.foodAllowance },
    { label: 'Special Allowance',          amount: data.specialAllowance },
    { label: 'Bonus',                      amount: data.bonus },
    { label: 'Overtime',                   amount: data.overtime },
    { label: 'Other Earnings',             amount: data.otherEarnings },
  ].filter(r => r.amount > 0);

  const deductionRows = [
    { label: 'Professional Tax',       amount: data.professionalTax },
    { label: 'Provident Fund (PF)',    amount: data.pf },
    { label: 'ESI',                    amount: data.esi },
    { label: 'TDS',                    amount: data.tds },
    { label: 'Advance',                amount: data.advance },
    { label: 'Loan',                   amount: data.loan },
    { label: 'Penalty',                amount: data.penalty },
    { label: 'Absent Deduction',       amount: data.absentDeduction },
    { label: 'Unpaid Leave Deduction', amount: data.unpaidLeaveDeduction },
    { label: 'Late Fine',              amount: data.lateFine },
    { label: 'Other Deductions',       amount: data.otherDeductions },
  ].filter(r => r.amount > 0);

  return (
    <div id={containerId} style={{
      fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
      background: '#fff',
      width: 794,
      height: 1123,
      overflow: 'hidden',
      margin: '0 auto',
      padding: '32px 36px',
      boxSizing: 'border-box',
      position: 'relative',
      fontSize: 12,
      color: '#1a1a2e',
    }}>
      {/* Watermark */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%) rotate(-35deg)',
        fontSize: 75, fontWeight: 900, color: 'rgba(99,102,241,0.035)',
        whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none', zIndex: 0,
      }}>
        ODITECH HRMS
      </div>

      {/* ── HEADER ── */}
      <Header data={data} employee={employee} />

      {/* ── EMPLOYEE INFO + BANK DETAILS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        {/* Employee info */}
        <div style={{ background: '#f8fafc', borderRadius: 12, padding: 14, border: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: 800, fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            Employee Information
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {(data.employeePhoto || employee?.profileImage) ? (
              <img src={data.employeePhoto || employee?.profileImage} alt="emp"
                style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', border: '2px solid #e2e8f0' }} />
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: 10, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#4f46e5' }}>
                {(data.employeeName || employee?.fullName || 'E')[0]}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 900, fontSize: 13, color: '#1e293b' }}>{data.employeeName || employee?.fullName}</div>
              <div style={{ color: '#64748b', fontSize: 11, marginTop: 1 }}>{data.designation || employee?.role}</div>
              <div style={{ color: '#4f46e5', fontSize: 11, fontWeight: 700, marginTop: 1 }}>{data.employeeCode || employee?.empCode}</div>
            </div>
          </div>
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 10px', fontSize: 11 }}>
            {[
              ['Department', data.department || employee?.department],
              ['Email',      data.employeeEmail || employee?.email],
              ['Phone',      data.employeePhone || employee?.phone],
              ['Joining Date', data.joiningDate
                ? new Date(data.joiningDate).toLocaleDateString('en-IN')
                : employee?.joinDate
                  ? new Date(employee.joinDate).toLocaleDateString('en-IN')
                  : '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>{k}: </span>
                <span style={{ color: '#334155', fontWeight: 700 }}>{v || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bank & ID */}
        <div style={{ background: '#f8fafc', borderRadius: 12, padding: 14, border: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: 800, fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            Bank &amp; ID Details
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 10px', fontSize: 11 }}>
            {[
              ['PAN',        data.panNumber],
              ['Aadhar',     data.aadharNumber],
              ['Bank',       data.bankName],
              ['Account No', data.accountNumber],
              ['IFSC',       data.ifscCode],
              ['Branch',     data.branchName],
              ['UPI',        data.upiId],
            ].map(([k, v]) => (
              <div key={k}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>{k}: </span>
                <span style={{ color: '#334155', fontWeight: 700 }}>{v || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ATTENDANCE SUMMARY ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
          Attendance Summary
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 6 }}>
          {[
            { label: 'Working Days',  value: data.workingDays,                           bg: '#f1f5f9', color: '#334155' },
            { label: 'Present',       value: data.presentDays,                           bg: '#f0fdf4', color: '#16a34a' },
            { label: 'Absent',        value: data.absentDays,                            bg: '#fff1f2', color: '#e11d48' },
            { label: 'Half Day',      value: data.halfDays,                              bg: '#fffbeb', color: '#d97706' },
            { label: 'Paid Leave',    value: data.paidLeaves,                            bg: '#eff6ff', color: '#2563eb' },
            { label: 'Unpaid Leave',  value: data.unpaidLeaves,                          bg: '#fff7ed', color: '#ea580c' },
            { label: 'Weekly Off',    value: data.weeklyOffs,                            bg: '#f8fafc', color: '#64748b' },
            { label: 'Holiday',       value: data.holidays,                              bg: '#eef2ff', color: '#4f46e5' },
            { label: 'Late Marks',    value: data.lateMarks || 0,                       bg: '#fffbeb', color: '#b45309' },
            { label: 'Payable Days',  value: data.payableDays || data.presentDays,      bg: '#f0fdf4', color: '#15803d' },
          ].map(({ label, value, bg, color }) => (
            <div key={label} style={{ background: bg, borderRadius: 8, padding: '7px 5px', textAlign: 'center', border: `1px solid ${bg}` }}>
              <div style={{ fontSize: 13, fontWeight: 900, color }}>{value ?? 0}</div>
              <div style={{ fontSize: 8, fontWeight: 700, color: '#94a3b8', marginTop: 2, lineHeight: 1.2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── EARNINGS & DEDUCTIONS ── */}
      <div style={{ marginBottom: 16, border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          {/* Earnings */}
          <div style={{ borderRight: '1px solid #e2e8f0' }}>
            <div style={{ background: '#f0fdf4', padding: '9px 13px', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: 900, fontSize: 11, color: '#15803d', textTransform: 'uppercase', letterSpacing: 0.5 }}>Earnings</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '0 13px', gap: '0 8px' }}>
              <div style={{ color: '#64748b', padding: '5px 0', borderBottom: '1px solid #f1f5f9', fontSize: 10, fontWeight: 700 }}>Description</div>
              <div style={{ color: '#64748b', padding: '5px 0', borderBottom: '1px solid #f1f5f9', fontSize: 10, fontWeight: 700, textAlign: 'right' }}>Amount</div>
              {earningsRows.map((r, i) => (
                <React.Fragment key={i}>
                  <div style={{ color: '#334155', padding: '5px 0', borderBottom: '1px solid #f8fafc', fontSize: 11, background: i % 2 === 0 ? 'transparent' : '#fafbfc' }}>{r.label}</div>
                  <div style={{ color: '#16a34a', padding: '5px 0', borderBottom: '1px solid #f8fafc', fontSize: 11, fontWeight: 700, textAlign: 'right', background: i % 2 === 0 ? 'transparent' : '#fafbfc' }}>{fmt(r.amount)}</div>
                </React.Fragment>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 13px', background: '#f0fdf4', borderTop: '2px solid #bbf7d0', marginTop: 4 }}>
              <span style={{ fontWeight: 900, fontSize: 11, color: '#15803d' }}>Total Earnings</span>
              <span style={{ fontWeight: 900, fontSize: 11, color: '#15803d' }}>{fmt(data.totalEarnings || data.grossSalary)}</span>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <div style={{ background: '#fff1f2', padding: '9px 13px', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: 900, fontSize: 11, color: '#e11d48', textTransform: 'uppercase', letterSpacing: 0.5 }}>Deductions</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '0 13px', gap: '0 8px' }}>
              <div style={{ color: '#64748b', padding: '5px 0', borderBottom: '1px solid #f1f5f9', fontSize: 10, fontWeight: 700 }}>Description</div>
              <div style={{ color: '#64748b', padding: '5px 0', borderBottom: '1px solid #f1f5f9', fontSize: 10, fontWeight: 700, textAlign: 'right' }}>Amount</div>
              {deductionRows.map((r, i) => (
                <React.Fragment key={i}>
                  <div style={{ color: '#334155', padding: '5px 0', borderBottom: '1px solid #f8fafc', fontSize: 11, background: i % 2 === 0 ? 'transparent' : '#fafbfc' }}>{r.label}</div>
                  <div style={{ color: '#e11d48', padding: '5px 0', borderBottom: '1px solid #f8fafc', fontSize: 11, fontWeight: 700, textAlign: 'right', background: i % 2 === 0 ? 'transparent' : '#fafbfc' }}>-{fmt(r.amount)}</div>
                </React.Fragment>
              ))}
              {deductionRows.length === 0 && (
                <div style={{ gridColumn: '1/-1', color: '#94a3b8', padding: '8px 0', fontSize: 11 }}>No deductions</div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 13px', background: '#fff1f2', borderTop: '2px solid #fecdd3', marginTop: 4 }}>
              <span style={{ fontWeight: 900, fontSize: 11, color: '#e11d48' }}>Total Deductions</span>
              <span style={{ fontWeight: 900, fontSize: 11, color: '#e11d48' }}>-{fmt(data.totalDeductions || data.deduction)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── NET SALARY ── */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        border: '2px solid #86efac', borderRadius: 14,
        padding: '14px 18px', marginBottom: 14,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: 1 }}>Net Payable Salary</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#16a34a', marginTop: 3 }}>{fmt(data.netSalary)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: 1 }}>Amount in Words</div>
          <div style={{ fontSize: 11, color: '#166534', fontWeight: 700, marginTop: 3, maxWidth: 280, fontStyle: 'italic' }}>
            {data.amountInWords || '—'}
          </div>
        </div>
      </div>

      {/* ── FOOTER SIGNATURES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginTop: 16, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
        {[
          ['Employee Signature', ''],
          ['HR Manager', '[HR Signature]'],
          ['Authorized Signatory', '[Company Seal]'],
        ].map(([label, placeholder]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ height: 38, borderBottom: '1px solid #cbd5e1', marginBottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#94a3b8' }}>
              {placeholder}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── BOTTOM NOTE ── */}
      <div style={{ textAlign: 'center', marginTop: 14, fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>
        This is a computer-generated salary slip. No physical signature is required. | Generated on {generatedDate}
      </div>
    </div>
  );
};

export default SalarySlipA4;
