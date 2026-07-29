import React, { useState } from 'react';
import { Send, Megaphone, CheckCircle2, X } from 'lucide-react';
import api from '../services/api';

const PublishAnnouncement = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Normal',
    validUntil: ''
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.validUntil) {
      showToast('Please fill all required fields.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/announcements', form);
      if (res.data.success) {
        showToast('Announcement published successfully.');
        setForm({ title: '', description: '', priority: 'Normal', validUntil: '' });
      }
    } catch (err) {
      console.error('Error publishing announcement:', err);
      showToast('Failed to publish announcement.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1e293b]"></div>
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`absolute top-4 right-4 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold shadow-xl animate-in slide-in-from-right-4 z-50 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
          {toast.message}
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner">
          <Megaphone size={20} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-[#1e293b]">Publish Announcement</h3>
          <p className="text-xs text-slate-400 font-bold mt-1">Broadcast messages to all employees instantly.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g., Independence Day Holiday"
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1e293b]/10 focus:border-[#1e293b] transition-all placeholder:font-medium placeholder:text-slate-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Priority *</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1e293b]/10 focus:border-[#1e293b] transition-all text-[#1e293b]"
            >
              <option value="Normal">Normal</option>
              <option value="Holiday">Holiday</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Valid Until *</label>
            <input
              type="date"
              value={form.validUntil}
              onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1e293b]/10 focus:border-[#1e293b] transition-all text-[#1e293b]"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Enter announcement details..."
            rows="4"
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1e293b]/10 focus:border-[#1e293b] transition-all resize-none placeholder:font-medium placeholder:text-slate-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#1e293b] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Send size={16} /> Publish Announcement
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PublishAnnouncement;
