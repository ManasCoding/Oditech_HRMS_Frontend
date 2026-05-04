import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, CheckCircle2, AlertCircle, Loader2, Navigation, ArrowLeft } from 'lucide-react';
import EmployeeLayout from '../layouts/EmployeeLayout';
import api from '../services/api';

const EARTH_RADIUS_M = 6371000;

function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const EmployeeCheckIn = () => {
  const { employeeSlug } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const [status, setStatus] = useState('idle'); // idle | locating | success | failed | already
  const [message, setMessage] = useState('');
  const [coords, setCoords] = useState(null);
  const [distance, setDistance] = useState(null);

  const handleFindLocation = async () => {
    setStatus('locating');
    setMessage('');

    if (!navigator.geolocation) {
      setStatus('failed');
      setMessage('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });

        try {
          // Fetch office settings
          const settingsRes = await api.get('/settings');
          const settings = settingsRes.data.settings;

          const officeLat = parseFloat(settings.office_lat);
          const officeLng = parseFloat(settings.office_lng);
          const radius = parseFloat(settings.geofence_radius) || 50;

          const dist = getDistanceMeters(latitude, longitude, officeLat, officeLng);
          setDistance(Math.round(dist));

          if (dist <= radius) {
            // Within geofence — check in
            const checkInRes = await api.post('/employee/attendance/check-in', {
              employeeId: user.id,
              lat: latitude,
              lng: longitude,
            });

            if (checkInRes.data.alreadyCheckedIn) {
              setStatus('already');
              setMessage('You have already checked in today. Your attendance is recorded.');
            } else {
              setStatus('success');
              setMessage(`Check-in successful! You are ${Math.round(dist)}m from office.`);
              // Auto-navigate back to dashboard after 2.5 seconds
              setTimeout(() => navigate(`/employee/${user.slug}/dashboard`), 2500);
            }
          } else {
            setStatus('failed');
            setMessage(`You are ${Math.round(dist)}m away from the office. Geofence radius is ${radius}m.`);
          }
        } catch (err) {
          setStatus('failed');
          setMessage('Could not verify location. Please try again.');
        }
      },
      (error) => {
        setStatus('failed');
        setMessage('Location access denied. Please allow location access.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const slug = user.slug || employeeSlug;

  return (
    <EmployeeLayout title="Attendance Check-In" subtitle="Secured location verification for your work logs.">
      <div className="max-w-2xl mx-auto pb-20">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <button 
            onClick={() => navigate(`/employee/${slug}/dashboard`)}
            className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#1e293b] transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <div className="w-20 h-20 bg-[#1e293b] rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200">
            <MapPin size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-black text-[#1e293b] mb-2">Location Verification</h2>
          <p className="text-slate-400 text-sm font-medium">You must be within the office premises to mark your attendance.</p>
        </div>

        <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden p-10 relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#1e293b]"></div>

          <div className="space-y-8">
            {/* User Profile Summary */}
            <div className="flex items-center gap-4 p-6 bg-slate-50/50 rounded-[32px] border border-slate-100">
               <div className="w-14 h-14 bg-[#1e293b] rounded-2xl flex items-center justify-center text-white font-black text-xl overflow-hidden border border-slate-200">
                 {user.profileImage ? (
                   <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                 ) : (
                   user.name?.[0] || 'U'
                 )}
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Checking in as</p>
                 <h4 className="text-lg font-black text-[#1e293b]">{user.name}</h4>
               </div>
            </div>

            {/* Date/Time Display */}
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50/50 rounded-[32px] border border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Today's Date</p>
                <p className="text-lg font-black text-[#1e293b]">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="p-6 bg-slate-50/50 rounded-[32px] border border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Time</p>
                <p className="text-lg font-black text-[#1e293b]">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            {/* Status Messages */}
            {status === 'locating' && (
              <div className="py-8 flex flex-col items-center gap-4 animate-pulse">
                <Loader2 size={40} className="text-[#1e293b] animate-spin" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Verifying Coordinates...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="p-8 bg-emerald-50 rounded-[32px] border border-emerald-100 text-center animate-in zoom-in duration-300">
                <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-black text-emerald-900 mb-1">Check-In Successful</h3>
                <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest">{message}</p>
              </div>
            )}

            {(status === 'failed' || status === 'already') && (
              <div className={`p-8 rounded-[32px] border text-center animate-in zoom-in duration-300 ${status === 'already' ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100'}`}>
                <AlertCircle size={48} className={`mx-auto mb-4 ${status === 'already' ? 'text-amber-500' : 'text-rose-500'}`} />
                <h3 className={`text-xl font-black mb-1 ${status === 'already' ? 'text-amber-900' : 'text-rose-900'}`}>
                  {status === 'already' ? 'Check-In Complete' : 'Verification Failed'}
                </h3>
                <p className={`text-xs font-bold uppercase tracking-widest ${status === 'already' ? 'text-amber-600' : 'text-rose-600'}`}>{message}</p>
              </div>
            )}

            {/* Main Action Button */}
            {status !== 'success' && status !== 'already' && status !== 'locating' && (
              <button
                onClick={handleFindLocation}
                className="w-full py-6 bg-[#1e293b] text-white rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-300 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
              >
                <Navigation size={20} />
                Verify Location & Check In
              </button>
            )}

            {status === 'locating' && (
              <div className="w-full py-6 bg-slate-100 text-slate-400 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] text-center">
                Fetching GPS Signal...
              </div>
            )}

            {(status === 'success' || status === 'already') && (
              <button
                onClick={() => navigate(`/employee/${slug}/dashboard`)}
                className="w-full py-5 border-2 border-slate-100 text-slate-400 rounded-[32px] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Return to Dashboard
              </button>
            )}
          </div>
        </div>
        
        <p className="mt-10 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest px-10 leading-relaxed">
          Your attendance is strictly monitored based on geofencing technology. Please ensure your GPS is enabled and you are within the 50m office radius.
        </p>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeCheckIn;
