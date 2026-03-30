import { Search, Bell, HelpCircle } from 'lucide-react';
import React from 'react';

interface TopBarProps {
  /** Breadcrumb path, e.g. ["CONNECTE", "TEMPLATES"] */
  breadcrumb?: string[];
  /** Optional right-side content (tabs, buttons, etc.) */
  rightSlot?: React.ReactNode;
  searchPlaceholder?: string;
}

export function TopBar({
  breadcrumb = [],
  rightSlot,
  searchPlaceholder = 'Search...',
}: TopBarProps) {
  return (
    <header className="flex items-center justify-between h-14 px-8 bg-white border-b border-[#E8E8E8] shrink-0">
      {/* Left: breadcrumb */}
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

      {/* Middle: tabs / nav slot */}
      {rightSlot && <div className="flex items-center gap-6">{rightSlot}</div>}

      {/* Right: search + icons */}
      <div className="flex items-center gap-3">
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
        <button className="w-8 h-8 flex items-center justify-center text-[#1B1B1B]/50 hover:text-[#1B1B1B] transition-colors">
          <HelpCircle size={18} />
        </button>
      </div>
    </header>
  );
}
