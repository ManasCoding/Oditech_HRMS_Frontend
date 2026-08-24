import React, { useState } from 'react';
import EmployeeLayout from '../layouts/EmployeeLayout';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const EmployeeSiteVisitRequest = () => {
  const { employeeSlug } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    siteName: '',
    siteAddress: '',
    purpose: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:30',
    contactPerson: '',
    contactNumber: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/site-visits', {
        ...formData,
        employeeId: user.id
      });
      toast.success('Site visit request submitted successfully');
      navigate(`/employee/${employeeSlug}/site-visits`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmployeeLayout title="New Site Visit Request" subtitle="Submit a request for field work">
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Client / Company Name *</label>
                <input required type="text" name="clientName" value={formData.clientName} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-medium text-slate-800" placeholder="Enter client or company name" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Site Name *</label>
                <input required type="text" name="siteName" value={formData.siteName} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-medium text-slate-800" placeholder="Enter site name" />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Site Address *</label>
                <textarea required name="siteAddress" value={formData.siteAddress} onChange={handleChange} rows="3" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-medium text-slate-800" placeholder="Enter complete site address"></textarea>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Purpose of Visit *</label>
                <input required type="text" name="purpose" value={formData.purpose} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-medium text-slate-800" placeholder="Enter purpose of visit" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Start Date *</label>
                <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-medium text-slate-800 cursor-pointer" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Start Time *</label>
                <input required type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-medium text-slate-800 cursor-pointer" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Contact Person (Optional)</label>
                <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-medium text-slate-800" placeholder="Enter contact person name" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Contact Number (Optional)</label>
                <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-medium text-slate-800" placeholder="Enter contact phone number" />
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-xs uppercase tracking-wider">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all text-xs uppercase tracking-wider disabled:opacity-50 shadow-lg shadow-blue-200">
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeSiteVisitRequest;
