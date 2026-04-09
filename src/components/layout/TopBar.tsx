import { Search, Bell, HelpCircle, RefreshCw } from 'lucide-react';
import React from 'react';

interface TopBarProps {
  /** Optional page title (e.g. "Templates Management") */
  title?: string;
  /** Breadcrumb path, e.g. ["CONNECTE", "TEMPLATES"] */
  breadcrumb?: string[];
  /** Optional right-side content (tabs, buttons, etc.) */
  rightSlot?: React.ReactNode;
  searchPlaceholder?: string;
  /** Optional sync action */
  onSync?: () => void;
  /** Sync status */
  isSyncing?: boolean;
  /** Optional high-priority metrics or navigation tabs */
  stats?: Array<{ label: string; value?: string | number; color?: string; isActive?: boolean; onClick?: () => void }>;
}

export function TopBar({
  title,
  breadcrumb = [],
  rightSlot,
  searchPlaceholder = 'Search...',
  onSync,
  isSyncing = false,
  stats = [],
}: TopBarProps) {
  return (
    <header className="flex items-center justify-between h-14 px-8 bg-white border-b border-[#E8E8E8] shrink-0">
      {/* Left: title or breadcrumb */}
      <div className="flex items-center gap-1">
        {title ? (
          <h3 className="text-sm font-black text-[#1B1B1B] uppercase tracking-wider">{title}</h3>
        ) : (
          <div className="flex items-center gap-1 text-sm font-semibold text-[#1B1B1B]">
            {breadcrumb.map((crumb, i) => (
              <React.Fragment key={crumb}>
                {i > 0 && <span className="text-[#1B1B1B]/30 mx-1">/</span>}
                <span className={i === breadcrumb.length - 1 ? 'text-[#1B1B1B]' : 'text-[#1B1B1B]/40'}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Middle: centered stats / rightSlot */}
      <div className="flex items-center gap-8">
        {stats.length > 0 && (
          <div className="flex items-center gap-8">
            {stats.map((s, i) => (
              <div 
                key={i} 
                onClick={s.onClick}
                className={`relative flex flex-col items-center justify-center h-14 px-1 cursor-pointer group transition-all leading-none`}
              >
                <span className={`text-[10px] font-black tracking-widest uppercase mb-0.5 transition-colors ${
                  s.isActive ? 'text-[#1B1B1B]' : 'text-[#1B1B1B]/30 group-hover:text-[#1B1B1B]/60'
                }`}>
                  {s.label}
                </span>
                {s.value !== undefined && (
                  <span className={`text-sm font-black tracking-tight ${s.color || 'text-[#1B1B1B]'}`}>
                    {s.value}
                  </span>
                )}
                {s.isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#25D366]" />
                )}
              </div>
            ))}
          </div>
        )}
        {rightSlot}
      </div>

      {/* Right: search + icons */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          {onSync && (
            <button 
              onClick={onSync}
              disabled={isSyncing}
              className={`w-8 h-8 flex items-center justify-center text-[#1B1B1B]/50 hover:text-[#25D366] transition-all ${isSyncing ? 'cursor-not-allowed opacity-50' : ''}`}
              title="Refresh / Sync"
            >
              <RefreshCw size={18} className={isSyncing ? 'animate-spin text-[#25D366]' : ''} />
            </button>
          )}
          <div className="flex items-center gap-2 bg-[#F3F3F3] px-3 h-9 w-52">
            <Search size={14} className="text-[#1B1B1B]/40 shrink-0" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="bg-transparent text-sm text-[#1B1B1B] placeholder:text-[#1B1B1B]/40 outline-none w-full"
            />
          </div>
          <button className="w-8 h-8 flex items-center justify-center text-[#1B1B1B]/50 hover:text-[#1B1B1B] transition-colors">
            <Bell size={18} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-[#1B1B1B]/50 hover:text-[#1B1B1B] transition-colors" title="Settings & Help">
            <HelpCircle size={18} />
          </button>
        </div>
      </div>
    </header>
);
}
