import React from 'react';
import EmployeeLayout from '../layouts/EmployeeLayout';

const EmployeePaySlip = () => {
  return (
    <EmployeeLayout title="Pay Slip" subtitle="View and download your monthly salary slips.">
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 text-center">
        <h2 className="text-2xl font-black text-[#1e293b] mb-4">Pay Slips Coming Soon</h2>
        <p className="text-slate-400 font-medium">
          The pay slip feature is currently under development. You will be able to access your monthly salary slips here shortly.
        </p>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeePaySlip;
