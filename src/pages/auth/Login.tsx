import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';

// ── Icons ───────────────────────────────────────────────────────────────────
const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

// const NodeIcon = () => (
//   <svg width="18" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
//     <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
//     <polyline points="7.5 19.79 7.5 14.6 3 12" />
//     <polyline points="21 12 16.5 14.6 16.5 19.79" />
//     <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
//     <line x1="12" y1="22.08" x2="12" y2="12" />
//   </svg>
// );

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
      setError('credentials required.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login({ email: email.trim(), password });
      login(response.access_token, {
        id: '',
        email: email.trim(),
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('email or password was wrong!');
      } else {
        setError('Could not connect to the system. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white font-plus-jakarta">
      {/* ── LEFT: Brand panel (Top-Left Branding) ────────────────────────── */}
      {/* ── LEFT: Brand panel (60% Split) ────────────────────────── */}
      <div className="flex w-full lg:w-[60%] flex-col justify-between pt-[63px] px-[64px] pb-[64px] bg-[#F9F9F9] min-h-[400px] lg:min-h-screen">
        <div className="space-y-[8.5px]">
          <div className="space-y-[8.5px]">
            <h1 className="text-[96px] font-bold text-[#0B0C10] leading-[96px] tracking-[-3.84px] uppercase font-dm-sans">
              CONNECTE.
            </h1>
            <p className="text-[12px] font-semibold text-[#0B0C10] leading-[18px] tracking-[4.8px] uppercase font-dm-sans">
              CONNECT-ENTERPRISE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[#0B0C10] opacity-40 font-normal tracking-[1.1px] text-[11px] leading-[16px]">
          {/* <NodeIcon />
          <span>ENCRYPTED_NODE_STABLE</span> */}
          <p className="text-[11px] leading-[16px] font-normal text-[#6B7280] tracking-[2.2px] uppercase">
            APPLICATION_VERSION_1.0.0
          </p>
        </div>
      </div>

      {/* ── RIGHT: Access form panel (40% Split) ─────────────────────────── */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center p-16 bg-white min-h-screen shadow-[-20px_0px_50px_rgba(11,12,16,0.02)]">
        <div className="max-w-[400px] w-full mx-auto space-y-[39px]">
          <div className="space-y-2">
            <h2 className="text-[32px] font-bold text-[#0B0C10] leading-[48px] tracking-[-0.8px] uppercase">
              SIGN IN
            </h2>
            <p className="text-[14px] leading-[21px] text-[#6B7280] font-normal">
              Enter your email and password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {error && (
              <div className="p-4 bg-[#FF4D4D] text-white text-[12px] font-bold tracking-widest uppercase mb-6 shadow-[0px_4px_20px_rgba(255,77,77,0.2)]">
                {error}
              </div>
            )}

            <div className="space-y-[8.5px]">
              <label className="text-[11px] leading-[16px] font-normal text-[#9CA3AF] tracking-[1.1px] uppercase">
                EMAIL
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                autoComplete="email"
                className="w-full h-[55px] bg-[#F3F3F3] border-none px-4 text-[16px] font-medium text-[#1B1B1B] outline-none transition-all focus:bg-[#EDEDED] placeholder:text-[#D1D5DB]"
              />
            </div>

            <div className="space-y-[8.5px]">
              <label className="text-[11px] leading-[16px] font-normal text-[#9CA3AF] tracking-[1.1px] uppercase">
                PASSWORD
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full h-[55px] bg-[#F3F3F3] border-none px-4 text-[16px] font-medium text-[#1B1B1B] outline-none transition-all focus:bg-[#EDEDED] placeholder:text-[#D1D5DB]"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[61px] bg-gradient-to-b from-[#25D366] to-[#1DA34D] text-white flex items-center justify-center gap-3 text-[14px] leading-[21px] font-semibold font-dm-sans tracking-[1.4px] hover:opacity-90 transition-all disabled:opacity-20 shadow-none border-none"
              >
                {isLoading ? 'SIGNING IN...' : (
                  <>SIGN IN <ArrowRightIcon /></>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center pt-4">
              <Link to="/auth/signup" className="text-[10px] leading-[15px] font-normal tracking-[1px] text-[#9CA3AF] uppercase hover:text-black transition-colors">
                NEW_TO_PLATFORM? SIGN UP →
              </Link>
            </div>
          </form>

          {/* Footer Annotations */}
          {/* <div className="pt-[65px] flex items-center gap-[32px]">
            <div className="space-y-[0px]">
                <p className="text-[10px] leading-[15px] font-normal text-[#D1D5DB] tracking-[1px] uppercase">Secure By</p>
                <p className="text-[12px] leading-[18px] font-bold text-[#0B0C10] font-dm-sans tracking-[-0.6px]">QUANTUM_VAULT</p>
            </div>
            <div className="space-y-[0px]">
                <p className="text-[10px] leading-[15px] font-normal text-[#D1D5DB] tracking-[1px] uppercase">Status</p>
                <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                    <p className="text-[10px] leading-[15px] font-bold text-[#0B0C10] tracking-[1px]">OPERATIONAL</p>
                </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
