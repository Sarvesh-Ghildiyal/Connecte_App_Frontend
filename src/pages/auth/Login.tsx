import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Network } from 'lucide-react';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';

// ─────────────────────────────────────────────────────────────────────────────
// Page: /auth/login
// Design reference: page1.png
// Capitol Lean — "The Precision Ledger"
// Split layout: left brand panel (60%) | right access form (40%)
// ─────────────────────────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Submit handler ───────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Basic client-side validation
    if (!email.trim()) {
      setError('Identifier is required.');
      return;
    }
    if (!password) {
      setError('Security key is required.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({ email: email.trim(), password });

      // Store token in sessionStorage and update Zustand store
      // User object derived from token — id and name will be updated via profile fetch if needed
      login(response.access_token, {
        id: '',       // Populated from token sub claim or future /auth/me endpoint
        email: email.trim(),
        name: email.split('@')[0], // Fallback display name
      });

      // Redirect to dashboard after successful login
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      setError(
        axiosError?.response?.data?.detail ?? 'Invalid credentials. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F3F3F3]">
      {/* ── LEFT: Brand panel ───────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[58%] flex-col justify-between bg-[#F3F3F3] p-12 relative overflow-hidden">
        {/* Version tag */}
        <p className="text-label-md text-[#1B1B1B] opacity-40 tracking-[0.12em]">
          SYSTEM_VERSION_1.0.4
        </p>

        {/* Hero wordmark */}
        <div className="flex flex-col gap-4">
          <h1
            className="font-black uppercase leading-none text-[#1B1B1B]"
            style={{ fontSize: 'clamp(5rem, 10vw, 8rem)', letterSpacing: '-0.02em' }}
          >
            CONNECTE.
          </h1>
          <p className="text-label-md text-[#1B1B1B] tracking-[0.2em] opacity-60">
            THE PRECISION LEDGER
          </p>
        </div>

        {/* Bottom node indicator */}
        <div className="flex items-center gap-3 text-[#1B1B1B] opacity-40">
          <Network size={18} />
          <span className="text-label-md tracking-[0.1em]">ENCRYPTED_NODE_STABLE</span>
        </div>
      </div>

      {/* ── RIGHT: Access form panel ─────────────────────────────────────────── */}
      <div className="w-full lg:w-[42%] flex flex-col justify-center px-12 py-16 bg-white min-h-screen">
        <div className="max-w-sm w-full mx-auto">
          {/* Form header */}
          <div className="mb-10">
            <h2 className="text-headline-lg text-[#1B1B1B] mb-2">ACCESS SYSTEM</h2>
            <p className="text-sm text-[#1B1B1B] opacity-50">
              Enter credentials to synchronize with the core.
            </p>
          </div>

          {/* Error state */}
          {error && (
            <div
              id="login-error-banner"
              role="alert"
              className="mb-6 px-4 py-3 bg-red-50 border-l-2 border-red-500 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form id="login-form" onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Email / Identifier */}
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="text-label-md text-[#1B1B1B] tracking-[0.1em]"
              >
                IDENTIFIER
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="ADMIN_USR_01"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="
                  w-full h-14 px-4
                  bg-[#E2E2E2] border-0 border-b-2 border-transparent
                  text-[#1B1B1B] placeholder:text-[#1B1B1B]/30 text-sm font-medium
                  transition-all outline-none
                  focus:border-b-[#006D2F] focus:bg-[#EBEBEB]
                  disabled:opacity-50
                  rounded-none
                "
              />
            </div>

            {/* Password / Security key */}
            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="text-label-md text-[#1B1B1B] tracking-[0.1em]"
              >
                SECURITY_KEY
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="
                  w-full h-14 px-4
                  bg-[#E2E2E2] border-0 border-b-2 border-transparent
                  text-[#1B1B1B] placeholder:text-[#1B1B1B]/30 text-sm font-medium
                  transition-all outline-none
                  focus:border-b-[#006D2F] focus:bg-[#EBEBEB]
                  disabled:opacity-50
                  rounded-none
                "
              />
            </div>

            {/* CTA */}
            <div className="pt-4">
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="
                  w-full h-14 flex items-center justify-center gap-3
                  text-white font-semibold text-sm tracking-[0.1em] uppercase
                  transition-all
                  disabled:opacity-60 disabled:cursor-not-allowed
                  rounded-none
                "
                style={{
                  background: isLoading
                    ? '#25D366'
                    : 'linear-gradient(45deg, #006D2F, #25D366)',
                }}
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
                    INITIALIZE SESSION
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

            {/* Footer links */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                id="login-forgot-btn"
                className="text-label-md text-[#1B1B1B] opacity-40 hover:opacity-70 transition-opacity tracking-[0.08em]"
              >
                FORGOT_KEY?
              </button>
              <Link
                to="/auth/signup"
                id="login-signup-link"
                className="text-label-md text-[#1B1B1B] opacity-40 hover:opacity-70 transition-opacity tracking-[0.08em]"
              >
                REQUEST_ACCESS
              </Link>
            </div>
          </form>

          {/* Bottom system info */}
          <div className="mt-20 flex items-start gap-12">
            <div>
              <p className="text-[10px] text-[#1B1B1B]/30 tracking-widest uppercase mb-0.5">
                Secure By
              </p>
              <p className="text-label-md text-[#1B1B1B] tracking-[0.08em]">
                QUANTUM_VAULT
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#1B1B1B]/30 tracking-widest uppercase mb-0.5">
                Status
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full inline-block" />
                <p className="text-label-md text-[#1B1B1B] tracking-[0.08em]">
                  OPERATIONAL
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
