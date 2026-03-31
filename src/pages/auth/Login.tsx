import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';

// ── Icons ───────────────────────────────────────────────────────────────────
const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const NodeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
    <polyline points="7.5 19.79 7.5 14.6 3 12" />
    <polyline points="21 12 16.5 14.6 16.5 19.79" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Page: /auth/login
// Design reference: page1.png (Top-Left Precision)
// ─────────────────────────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Credentials required.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login({ email: email.trim(), password });
      login(response.access_token, {
        id: '',
        email: email.trim(),
        name: email.split('@')[0],
      });
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError('Invalid credentials. Access denied by secure node.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white overflow-hidden font-sans">
      {/* ── LEFT: Brand panel (Top-Left Branding) ────────────────────────── */}
      <div className="hidden lg:flex lg:w-[58%] flex-col justify-between p-12 bg-[#F9F9F9]">
        <div className="space-y-4">
            <p className="text-[10px] font-bold text-black/30 tracking-[0.2em] uppercase mb-4">
                SYSTEM_VERSION_1.0.4
            </p>
            
            <div className="space-y-1">
                <h1 className="text-[4rem] font-black text-black leading-none tracking-tighter uppercase">
                    CONNECTE.
                </h1>
                <p className="text-[11px] font-black text-black opacity-30 tracking-[0.4em] uppercase">
                    THE PRECISION LEDGER
                </p>
            </div>
        </div>

        <div className="flex items-center gap-3 text-black/20 uppercase font-black tracking-widest text-[9px]">
          <NodeIcon />
          <span>ENCRYPTED_NODE_STABLE</span>
        </div>
      </div>

      {/* ── RIGHT: Access form panel ─────────────────────────────────────────── */}
      <div className="w-full lg:w-[42%] flex flex-col justify-center px-16 lg:px-24 py-16 bg-white min-h-screen">
        <div className="max-w-[420px] w-full mx-auto lg:mx-0">
          <div className="mb-14 space-y-4">
            <h2 className="text-[4.5rem] font-black text-black leading-[1] uppercase tracking-tight">
              ACCESS SYSTEM
            </h2>
            <p className="text-[14px] text-black/40 font-medium leading-relaxed">
              Enter credentials to synchronize with the core.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {error && (
               <div className="p-4 bg-black text-white text-[10px] font-black tracking-widest uppercase mb-6">
                  Error: {error}
               </div>
            )}

            <div className="space-y-3">
              <label className="text-[11px] font-black text-black/30 tracking-[0.2em] uppercase">
                IDENTIFIER
              </label>
              <input
                type="email"
                placeholder="ADMIN_USR_01"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-16 bg-[#F3F3F3] border-none px-6 text-[12px] font-black tracking-widest uppercase text-black outline-none transition-all focus:bg-[#EDEDED] placeholder:text-black/10"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-black/30 tracking-[0.2em] uppercase">
                SECURITY_KEY
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-16 bg-[#F3F3F3] border-none px-6 text-[12px] font-black tracking-widest uppercase text-black outline-none transition-all focus:bg-[#EDEDED] placeholder:text-black/10"
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-20 bg-[#25D366] text-white flex items-center justify-center gap-4 text-[12px] font-black tracking-[0.2em] uppercase hover:bg-black transition-all disabled:opacity-20 shadow-none border-none"
              >
                {isLoading ? 'INITIALIZING...' : (
                  <>INITIALIZE SESSION <ArrowRightIcon /></>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between mt-4">
              <button type="button" className="text-[10px] font-black tracking-widest text-black/40 uppercase hover:text-black transition-colors">
                FORGOT_KEY?
              </button>
              <button type="button" className="text-[10px] font-black tracking-widest text-black/40 uppercase hover:text-black transition-colors">
                REQUEST_ACCESS
              </button>
            </div>
          </form>

          {/* Metadata Footer */}
          <div className="mt-28 flex items-start gap-12 border-t border-[#F3F3F3] pt-12">
            <div className="space-y-1">
                <p className="text-[9px] font-black text-black/10 tracking-widest uppercase">Secure By</p>
                <p className="text-[11px] font-black text-black tracking-[0.1em] uppercase">QUANTUM_VAULT</p>
            </div>
            <div className="space-y-1">
                <p className="text-[9px] font-black text-black/10 tracking-widest uppercase">Status</p>
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                    <p className="text-[11px] font-black text-black tracking-[0.1em] uppercase">OPERATIONAL</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
