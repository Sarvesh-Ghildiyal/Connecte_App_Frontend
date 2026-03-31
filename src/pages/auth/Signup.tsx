import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';

// ── Icons ───────────────────────────────────────────────────────────────────
const NodeIcon = () => (
  <svg width="18" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
    <polyline points="7.5 19.79 7.5 14.6 3 12" />
    <polyline points="21 12 16.5 14.6 16.5 19.79" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Page: /auth/signup
// Capitol Lean — mirrors Login layout
// ─────────────────────────────────────────────────────────────────────────────

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError('Name is required.');
    if (!email.trim()) return setError('email is required.');
    if (!password || password.length < 8)
      return setError('Password must be at least 8 characters.');

    setIsLoading(true);

    try {
      await authService.signup({ name: name.trim(), email: email.trim(), password });

      // Auto-login after signup
      const authRes = await authService.login({ email: email.trim(), password });
      login(authRes.access_token, {
        id: '',
        email: email.trim(),
        name: name.trim(),
      });

      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      setError(axiosError?.response?.data?.detail ?? 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = `
    w-full h-[55px] px-4
    bg-[#F3F3F3] border-none
    text-[16px] font-medium text-[#1B1B1B] placeholder:text-[#D1D5DB]
    transition-all outline-none
    focus:bg-[#EDEDED]
    disabled:opacity-50
    rounded-none
  `;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white font-plus-jakarta">
      {/* ── LEFT: Brand panel (60% Split) ────────────────────────── */}
      <div className="flex w-full lg:w-[60%] flex-col justify-between pt-[63px] px-[64px] pb-[64px] bg-[#F9F9F9] min-h-[400px] lg:min-h-screen">
        <div className="space-y-[8.5px]">
          <p className="text-[11px] leading-[16px] font-normal text-[#6B7280] tracking-[2.2px] uppercase">
            SYSTEM_VERSION_1.0.4
          </p>

          <div className="space-y-[8.5px]">
            <h1 className="text-[96px] font-bold text-[#0B0C10] leading-[96px] tracking-[-3.84px] uppercase font-dm-sans">
              CONNECTE.
            </h1>
            <p className="text-[12px] font-semibold text-[#0B0C10] leading-[18px] tracking-[4.8px] uppercase font-dm-sans">
              THE PRECISION LEDGER
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[#0B0C10] opacity-40 font-normal tracking-[1.1px] text-[11px] leading-[16px]">
          <NodeIcon />
          <span>ENCRYPTED_NODE_STABLE</span>
        </div>
      </div>

      {/* ── RIGHT: Access form panel (40% Split) ─────────────────────────── */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center p-16 bg-white min-h-screen shadow-[-20px_0px_50px_rgba(11,12,16,0.02)]">
        <div className="max-w-[400px] w-full mx-auto space-y-[39px]">
          <div className="space-y-2">
            <h2 className="text-[32px] font-bold text-[#0B0C10] leading-[48px] tracking-[-0.8px] uppercase">
              REQUEST ACCESS
            </h2>
            <p className="text-[14px] leading-[21px] text-[#6B7280] font-normal">
              Create credentials to initialize your account.
            </p>
          </div>

          {error && (
            <div
              id="signup-error-banner"
              role="alert"
              className="mb-6 px-4 py-3 bg-red-50 border-l-2 border-red-500 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form id="signup-form" onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-[8.5px]">
              <label htmlFor="signup-name" className="text-[11px] leading-[16px] font-normal text-[#9CA3AF] tracking-[1.1px] uppercase">
                display name
              </label>
              <input
                id="signup-name"
                type="text"
                placeholder="john_doe"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className={inputCls}
              />
            </div>

            <div className="space-y-[8.5px]">
              <label htmlFor="signup-email" className="text-[11px] leading-[16px] font-normal text-[#9CA3AF] tracking-[1.1px] uppercase">
                email
              </label>
              <input
                id="signup-email"
                type="email"
                placeholder="user@domain.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                disabled={isLoading}
                className={inputCls}
              />
            </div>

            <div className="space-y-[8.5px]">
              <label htmlFor="signup-password" className="text-[11px] leading-[16px] font-normal text-[#9CA3AF] tracking-[1.1px] uppercase">
                password
              </label>
              <input
                id="signup-password"
                type="password"
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={inputCls}
              />
            </div>

            <div className="pt-4">
              <button
                id="signup-submit-btn"
                type="submit"
                disabled={isLoading}
                className="
                  w-full h-[61px] flex items-center justify-center gap-3
                  text-white font-semibold text-[14px] leading-[21px] font-dm-sans tracking-[1.4px] uppercase
                  transition-all disabled:opacity-60 disabled:cursor-not-allowed
                  bg-gradient-to-b from-[#25D366] to-[#1DA34D] rounded-none shadow-none border-none
                "
              >
                {isLoading ? (
                  <>
                    <span
                      className="w-4 h-4 border-2 border-white border-t-transparent animate-spin"
                      style={{ borderRadius: '50%' }}
                    />
                    INITIALIZING...
                  </>
                ) : (
                  <>
                    CREATE_ACCOUNT
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center pt-4">
              <Link
                to="/auth/login"
                id="signup-login-link"
                className="text-[10px] leading-[15px] font-normal tracking-[1px] text-[#9CA3AF] uppercase hover:text-black transition-colors"
              >
                ALREADY_HAVE_ACCESS? LOGIN →
              </Link>
            </div>
          </form>

          {/* Footer Annotations */}
          <div className="pt-[65px] flex items-center gap-[32px]">
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
          </div>
        </div>
      </div>
    </div>
  );
}
