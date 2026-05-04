import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const LoginPage = ({ isAdmin = false }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const data = await login(loginId, password, isAdmin);
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('token', data.token);
        
        if (isAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate(`/employee/${data.user.slug}/dashboard`);
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div className="bg-surface rounded-[24px] p-10 md:p-12 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02),0_20px_25px_-5px_rgba(0,0,0,0.03),0_0_0_1px_rgba(0,0,0,0.02)]">
          <div className="flex justify-center mb-8">
            <img src="/logo.jpeg" alt="Company Logo" className="w-16 h-16 rounded-[16px] object-cover shadow-[0_8px_16px_rgba(15,23,42,0.12)]" />
          </div>
          
          <div className="text-center mb-10">
            <div className="text-text-muted text-[0.85rem] font-bold uppercase tracking-[1.5px] mb-2">
              Oditech Global Pvt. Ltd.
            </div>
            <h1 className="text-text-main text-2xl font-semibold tracking-tight mb-2">
              {isAdmin ? 'Admin Portal' : 'Employee Portal'}
            </h1>
            <p className="text-text-muted text-sm">
              Enter your credentials to continue
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-500 p-3.5 rounded-xl text-sm font-medium text-center mb-6 flex items-center justify-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-text-main text-sm font-semibold" htmlFor="login_id">
                {isAdmin ? 'Username' : 'Work Email or Employee Code'}
              </label>
              <input
                type="text"
                id="login_id"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full p-3.5 bg-background border border-border rounded-xl text-sm text-text-main transition-all duration-200 focus:outline-none focus:border-slate-400 focus:bg-surface focus:ring-4 focus:ring-slate-900/5"
                placeholder={isAdmin ? "admin_username" : "EMP001 or name@company.com"}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mt-1">
                <label className="block text-text-main text-sm font-semibold" htmlFor="password">
                  Password
                </label>
                <button 
                  type="button" 
                  onClick={() => navigate(isAdmin ? '/admin/forgot-password' : '/forgot-password')} 
                  className="text-[11px] font-black text-slate-400 hover:text-primary transition-colors tracking-wide"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 bg-background border border-border rounded-xl text-sm text-text-main transition-all duration-200 focus:outline-none focus:border-slate-400 focus:bg-surface focus:ring-4 focus:ring-slate-900/5"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full p-3.5 bg-primary text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/15 active:translate-y-0"
            >
              Sign In to Portal
            </button>
          </form>
        </div>
        
        <div className="text-center mt-8 text-[0.85rem] text-slate-400">
          © 2026 HR Management System. Secure portal.
        </div>
      </div>
      
      <div className="fixed bottom-6 w-full text-center text-[10px] text-slate-300 font-black uppercase tracking-[0.3em]">
        Designed & Developed by <span className="text-slate-400">Manas Kumar Gumansingh</span>
      </div>
    </div>
  );
};

export default LoginPage;
