import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { 
  BarChart3, 
  MapPin, 
  Users, 
  Clock, 
  Settings, 
  CheckSquare, 
  Calendar,
  FileText
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import DashboardView from './admin/siteVisits/DashboardView';
import RequestsView from './admin/siteVisits/RequestsView';
import ActiveView from './admin/siteVisits/ActiveView';
import SettingsView from './admin/siteVisits/SettingsView';

const AdminSiteVisits = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // We will build these subcomponents next
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'requests': return <RequestsView />;
      case 'active': return <ActiveView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={16} /> },
    { id: 'requests', label: 'All Requests', icon: <CheckSquare size={16} /> },
    { id: 'active', label: 'Active Visits', icon: <MapPin size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> }
  ];

  return (
    <AdminLayout title="Site Visits" subtitle="Manage employee field visits">
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm mb-6 border border-slate-200">
          <div className="flex overflow-x-auto custom-scrollbar p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-4">
          {renderContent()}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSiteVisits;
