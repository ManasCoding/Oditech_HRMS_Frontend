import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import ForgotPassword from '../pages/ForgotPassword';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import EmployeeAttendance from '../pages/EmployeeAttendance';
import EmployeeCheckIn from '../pages/EmployeeCheckIn';
import EmployeeProfile from '../pages/EmployeeProfile';
import EmployeeDirectory from '../pages/EmployeeDirectory';
import EmployeeSchedule from '../pages/EmployeeSchedule';


import AdminDashboard from '../pages/AdminDashboard';
import AdminAttendance from '../pages/AdminAttendance';
import AdminLeaves from '../pages/AdminLeaves';
import AdminSettings from '../pages/AdminSettings';
import AdminReports from '../pages/AdminReports';
import AdminPolicy from '../pages/AdminPolicy';

import AdminEmployees from '../pages/AdminEmployees';
import AdminExEmployees from '../pages/AdminExEmployees';
import AdminEmployeeDetails from '../pages/AdminEmployeeDetails';
import EmployeePaySlip from '../pages/EmployeePaySlip';
import EmployeeApplyLeave from '../pages/EmployeeApplyLeave';

import MaintenanceMode from '../pages/MaintenanceMode';
import api from '../services/api';

const AppRouter = () => {
  const location = useLocation();
  const [maintenance, setMaintenance] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success && res.data.settings) {
          setMaintenance(res.data.settings.maintenance_mode === 'true' || res.data.settings.maintenance_mode === true);
        }
      } catch (err) {
        console.error('Error fetching settings in AppRouter:', err);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, [location.pathname]); // Re-verify settings on navigation to be responsive to changes

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isSuperAdmin = user.role === 'admin' && user.email === 'gumansingh.oditechglobal@gmail.com';
  const isAdminLoginPath = location.pathname === '/admin/login' || location.pathname === '/admin/forgot-password';

  if (loadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (maintenance && !isSuperAdmin && !isAdminLoginPath) {
    return <MaintenanceMode />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin/login" element={<LoginPage isAdmin={true} />} />
      <Route path="/admin/forgot-password" element={<ForgotPassword isAdmin={true} />} />
      
      {/* Employee Routes */}
      <Route path="/employee/:employeeSlug/dashboard" element={<EmployeeDashboard />} />
      <Route path="/employee/:employeeSlug/check-in" element={<EmployeeCheckIn />} />
      <Route path="/employee/:employeeSlug/attendance" element={<EmployeeAttendance />} />
      <Route path="/employee/:employeeSlug/payslip" element={<EmployeePaySlip />} />
      <Route path="/employee/:employeeSlug/profile" element={<EmployeeProfile />} />
      <Route path="/employee/:employeeSlug/directory" element={<EmployeeDirectory />} />
      <Route path="/employee/:employeeSlug/apply-leave" element={<EmployeeApplyLeave />} />
      <Route path="/employee/:employeeSlug/schedule" element={<EmployeeSchedule />} />


      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/attendance" element={<AdminAttendance />} />
      <Route path="/admin/employees" element={<AdminEmployees />} />
      <Route path="/admin/employees/ex" element={<AdminExEmployees />} />
      <Route path="/admin/employees/:id" element={<AdminEmployeeDetails />} />
      <Route path="/admin/leaves" element={<AdminLeaves />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
      <Route path="/admin/reports" element={<AdminReports />} />
      <Route path="/admin/policy" element={<AdminPolicy />} />
      
      {/* Fallback for other pages while they are being built */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
};

export default AppRouter;
