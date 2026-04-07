import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Users,
  Radio,
  MessageSquare,
  User,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

// ─── Navigation items ──────────────────────────────────────────────────────
const mainNav = [
  { label: 'Dashboard',  to: '/dashboard',  icon: LayoutDashboard },
  { label: 'Templates',  to: '/templates',  icon: FileText },
  { label: 'Contacts',   to: '/contacts',   icon: Users },
  { label: 'Broadcast',  to: '/broadcast',  icon: Radio },
  { label: 'Chat',       to: '/chat',       icon: MessageSquare },
];

const bottomNav = [
  { label: 'Profile',   to: '/settings',   icon: User },
];

// ─── Sidebar ───────────────────────────────────────────────────────────────
export function Sidebar() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleLogout = () => {
    setIsLogoutOpen(false);
    logout();
    navigate('/auth/login', { replace: true });
  };

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

        <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
          <DialogTrigger asChild>
            <button
              className="flex w-full items-center gap-3 px-3 py-2.5 mt-0.5 text-sm font-medium text-[#1B1B1B]/60 hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 transition-all text-left group"
            >
              <LogOut size={16} className="text-[#1B1B1B]/50 group-hover:text-[#FF4D4D]" />
              Logout
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-[18px] font-bold text-[#0B0C10] tracking-[-0.5px] uppercase">
                Confirm Logout
              </DialogTitle>
              <DialogDescription className="text-[14px] text-[#6B7280]">
                Are you sure you want to end your session? You will need to sign in again to access the platform.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 gap-2 sm:gap-0">
              <DialogClose asChild>
                <button
                  type="button"
                  className="px-6 py-2.5 bg-[#F3F3F3] text-[12px] font-semibold tracking-widest uppercase hover:bg-[#EDEDED] transition-all text-[#1B1B1B]"
                >
                  Cancel
                </button>
              </DialogClose>
              <button
                type="button"
                onClick={handleLogout}
                className="px-6 py-2.5 bg-[#FF4D4D] text-[12px] font-semibold tracking-widest uppercase hover:opacity-90 transition-all text-white"
              >
                Logout
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </nav>
    </aside>
  );
}
