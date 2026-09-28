import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { Edit2, Check, X } from 'lucide-react';
import api from '../services/api';

const AdminEmployeeMails = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/employees');
      if (response.data.success) {
        setEmployees(response.data.employees);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEditClick = (emp) => {
    setEditingId(emp._id);
    setEditForm({ email: emp.email || '', password: emp.password || '' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ email: '', password: '' });
  };

  const handleSave = async (id) => {
    try {
      const response = await api.put(`/admin/employees/${id}`, editForm);
      if (response.data.success) {
        setEmployees(employees.map(emp => emp._id === id ? { ...emp, email: editForm.email, password: editForm.password } : emp));
        setEditingId(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating credentials');
    }
  };

  return (
    <AdminLayout title="Employee Mails & Credentials" subtitle="Manage and store all employee emails and passwords.">
      <div className="mb-6 flex justify-start">
        <button 
          onClick={() => navigate('/admin/employees')}
          className="text-sm font-bold text-blue-600 hover:underline"
        >
          &larr; Back to Employees
        </button>
      </div>

      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee Code</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email (Gmail)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Password</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map(emp => (
                  <tr key={emp._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{emp.fullName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-bold bg-slate-50/50">{emp.empCode}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {editingId === emp._id ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                          placeholder="Employee Email"
                        />
                      ) : (
                        emp.email || '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {editingId === emp._id ? (
                        <input
                          type="text"
                          value={editForm.password}
                          onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                          className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                          placeholder="Password"
                        />
                      ) : (
                        emp.password || 'Not Set'
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingId === emp._id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleSave(emp._id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Save">
                            <Check size={18} />
                          </button>
                          <button onClick={handleCancelEdit} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg" title="Cancel">
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditClick(emp)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit Credentials">
                          <Edit2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No employees found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminEmployeeMails;
