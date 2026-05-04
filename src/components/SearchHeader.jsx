import React from 'react';
import { Search, Filter, ArrowLeft } from 'lucide-react';

const SearchHeader = ({ 
  title, 
  subtitle, 
  count, 
  searchTerm, 
  setSearchTerm, 
  placeholder = "Search...",
  onBack,
  showBack = false,
  filterOptions = [],
  filterValue = 'All',
  onFilterChange
}) => {
  return (
    <div className="bg-white rounded-[32px] p-8 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8 transition-all">
      <div className="flex items-center gap-4">
        {showBack && (
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#1e293b]">{title}</h2>
            {count !== undefined && (
              <span className="bg-[#2563eb] text-white text-[12px] font-bold px-3 py-1 rounded-full shadow-sm">
                {count}
              </span>
            )}
          </div>
          {subtitle && <p className="text-slate-400 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
        <div className="relative group w-full sm:w-auto">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-14 pr-6 py-4 bg-[#f8fafc] border border-slate-100 rounded-[20px] text-sm focus:outline-none focus:ring-4 focus:ring-slate-50 transition-all w-full md:w-[380px] font-bold placeholder:text-slate-400 shadow-sm"
          />
        </div>
        
        {filterOptions.length > 0 ? (
          <div className="relative group w-full sm:w-auto">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Filter size={18} />
            </div>
            <select
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
              className="pl-12 pr-10 py-4 bg-white border border-slate-100 rounded-[20px] text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-50 transition-all appearance-none cursor-pointer w-full shadow-sm hover:border-slate-200"
            >
              {filterOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ) : (
          <button className="w-[56px] h-[56px] flex items-center justify-center bg-white border border-slate-100 rounded-[20px] text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all shadow-sm shrink-0">
            <Filter size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchHeader;
