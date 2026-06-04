import React, { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { 
  FileText, 
  Clock, 
  CheckSquare, 
  XCircle, 
  CalendarCheck, 
  Search, 
  Download, 
  Filter,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const AdminResignation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Real data mimicking the screenshot
  const mockResignations = [
    {
      id: 1,
      name: 'Manas Kumar',
      role: 'Software Engineer',
      avatar: 'https://i.pravatar.cc/150?u=manas',
      department: 'IT Department',
      resignationDate: '04 Jun 2026',
      lastWorkingDay: '04 Jul 2026',
      status: 'PENDING'
    },
    {
      id: 2,
      name: 'Rohit Sharma',
      role: 'UI/UX Designer',
      avatar: 'https://i.pravatar.cc/150?u=rohit',
      department: 'Design',
      resignationDate: '01 Jun 2026',
      lastWorkingDay: '01 Jul 2026',
      status: 'PENDING'
    },
    {
      id: 3,
      name: 'Priya Patel',
      role: 'HR Executive',
      avatar: 'https://i.pravatar.cc/150?u=priya',
      department: 'Human Resources',
      resignationDate: '15 May 2026',
      lastWorkingDay: '15 Jun 2026',
      status: 'APPROVED'
    },
    {
      id: 4,
      name: 'Amit Verma',
      role: 'Marketing Executive',
      avatar: 'https://i.pravatar.cc/150?u=amit',
      department: 'Marketing',
      resignationDate: '20 Apr 2026',
      lastWorkingDay: '20 May 2026',
      status: 'REJECTED'
    },
    {
      id: 5,
      name: 'Neha Singh',
      role: 'Business Analyst',
      avatar: 'https://i.pravatar.cc/150?u=neha',
      department: 'Operations',
      resignationDate: '10 Mar 2026',
      lastWorkingDay: '10 Apr 2026',
      status: 'APPROVED'
    }
  ];

  return (
    <AdminLayout 
      title="Resignation Management" 
      subtitle="Review and manage resignation requests"
    >
      <div className="space-y-6">
        
        {/* Top Controls: Filters, Search, Export */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <select className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 shadow-sm cursor-pointer">
              <option>All Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
            <select className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 shadow-sm cursor-pointer">
              <option>01/05/2026 - 30/06/2026</option>
              <option>01/04/2026 - 30/04/2026</option>
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search employee..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 shadow-sm w-[240px]"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-blue-600 rounded-xl text-sm font-bold hover:bg-slate-50 shadow-sm transition-all">
              <Download size={16} />
              Export
            </button>
            <button className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 shadow-sm transition-all">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50/50 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-blue-600 flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-800">8</h4>
              <p className="text-[10px] font-bold text-slate-500">Total Requests</p>
            </div>
          </div>
          
          <div className="bg-orange-50/50 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-orange-500 flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-800">3</h4>
              <p className="text-[10px] font-bold text-slate-500">Pending</p>
            </div>
          </div>
          
          <div className="bg-emerald-50/50 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-emerald-500 flex items-center justify-center">
              <CheckSquare size={24} />
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-800">3</h4>
              <p className="text-[10px] font-bold text-slate-500">Approved</p>
            </div>
          </div>
          
          <div className="bg-rose-50/50 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-rose-500 flex items-center justify-center">
              <XCircle size={24} />
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-800">1</h4>
              <p className="text-[10px] font-bold text-slate-500">Rejected</p>
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-blue-500 flex items-center justify-center">
              <CalendarCheck size={24} />
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-800">1</h4>
              <p className="text-[10px] font-bold text-slate-500">Completed</p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-5 text-xs font-black text-slate-800 bg-white">Employee</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-800 bg-white">Department</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-800 bg-white">Resignation Date</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-800 bg-white">Last Working Day</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-800 bg-white">Status</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-800 bg-white text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {mockResignations.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={req.avatar} alt={req.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm" />
                        <div>
                          <p className="text-sm font-black text-slate-800">{req.name}</p>
                          <p className="text-[11px] font-bold text-slate-500">{req.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-700">{req.department}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-800">{req.resignationDate}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-800">{req.lastWorkingDay}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        req.status === 'PENDING' ? 'text-orange-500 bg-orange-50' : 
                        req.status === 'APPROVED' ? 'text-emerald-500 bg-emerald-50' : 
                        'text-rose-500 bg-rose-50'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition-colors">
                          <Eye size={16} />
                        </button>
                        {req.status === 'PENDING' ? (
                          <>
                            <button className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center hover:bg-emerald-100 transition-colors">
                              <Check size={16} />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors">
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors">
                            <Eye size={16} className="opacity-50" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
            <span className="text-sm font-medium text-slate-500">Showing 1 to 5 of 8 entries</span>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg text-slate-400 flex items-center justify-center hover:bg-slate-50 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 rounded-lg bg-white border border-blue-500 text-blue-600 font-bold text-sm flex items-center justify-center">
                1
              </button>
              <button className="w-8 h-8 rounded-lg text-slate-600 font-bold text-sm flex items-center justify-center hover:bg-slate-50 transition-colors">
                2
              </button>
              <button className="w-8 h-8 rounded-lg text-slate-400 flex items-center justify-center hover:bg-slate-50 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminResignation;
