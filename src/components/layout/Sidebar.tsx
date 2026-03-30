import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Users,
  Radio,
  MessageSquare,
  User,
  Settings,
} from 'lucide-react';

// ─── Navigation items ──────────────────────────────────────────────────────
const mainNav = [
  { label: 'Dashboard',  to: '/dashboard',  icon: LayoutDashboard },
  { label: 'Templates',  to: '/templates',  icon: FileText },
  { label: 'Contacts',   to: '/contacts',   icon: Users },
  { label: 'Broadcast',  to: '/broadcast',  icon: Radio },
  { label: 'Chat',       to: '/chat',       icon: MessageSquare },
];

const bottomNav = [
  { label: 'Profile',   to: '/profile',   icon: User },
  { label: 'Settings',  to: '/settings',  icon: Settings },
];

// ─── Sidebar ───────────────────────────────────────────────────────────────
export function Sidebar() {
  return (
    <aside className="flex flex-col w-52 min-h-screen bg-white border-r border-[#E8E8E8] shrink-0">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
        <p className="font-black text-[#1B1B1B] text-base leading-none tracking-tight">
          CONNECTE
        </p>
        <p className="text-[10px] text-[#1B1B1B]/40 tracking-[0.12em] uppercase mt-0.5">
          Meta Cloud API
        </p>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-2 py-2">
        {mainNav.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 mb-0.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-[#25D366] text-[#1B1B1B] font-semibold'
                  : 'text-[#1B1B1B]/60 hover:text-[#1B1B1B] hover:bg-[#F3F3F3]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-[#1B1B1B]' : 'text-[#1B1B1B]/50'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom nav */}
      <nav className="px-2 pb-6 border-t border-[#E8E8E8] pt-3">
        {bottomNav.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 mb-0.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-[#25D366] text-[#1B1B1B] font-semibold'
                  : 'text-[#1B1B1B]/60 hover:text-[#1B1B1B] hover:bg-[#F3F3F3]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-[#1B1B1B]' : 'text-[#1B1B1B]/50'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
