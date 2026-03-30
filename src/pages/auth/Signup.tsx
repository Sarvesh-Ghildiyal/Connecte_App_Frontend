import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';

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
    if (!email.trim()) return setError('Email is required.');
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
    w-full h-14 px-4
    bg-[#E2E2E2] border-0 border-b-2 border-transparent
    text-[#1B1B1B] placeholder:text-[#1B1B1B]/30 text-sm font-medium
    transition-all outline-none
    focus:border-b-[#006D2F] focus:bg-[#EBEBEB]
    disabled:opacity-50
    rounded-none
  `;

  return (
    <div className="flex min-h-screen bg-[#F3F3F3]">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[58%] flex-col justify-between bg-[#F3F3F3] p-12">
        <p className="text-label-md text-[#1B1B1B] opacity-40 tracking-[0.12em]">
          SYSTEM_VERSION_1.0.4
        </p>
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
        <p className="text-label-md text-[#1B1B1B] opacity-30 tracking-[0.12em]">
          ENCRYPTED_NODE_STABLE
        </p>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-[42%] flex flex-col justify-center px-12 py-16 bg-white min-h-screen">
        <div className="max-w-sm w-full mx-auto">
          <div className="mb-10">
            <h2 className="text-headline-lg text-[#1B1B1B] mb-2">REQUEST ACCESS</h2>
            <p className="text-sm text-[#1B1B1B] opacity-50">
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
            <div className="space-y-2">
              <label htmlFor="signup-name" className="text-label-md text-[#1B1B1B] tracking-[0.1em]">
                DISPLAY_NAME
              </label>
              <input
                id="signup-name"
                type="text"
                placeholder="JOHN_DOE"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className={inputCls}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="signup-email" className="text-label-md text-[#1B1B1B] tracking-[0.1em]">
                IDENTIFIER
              </label>
              <input
                id="signup-email"
                type="email"
                placeholder="user@domain.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className={inputCls}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="signup-password" className="text-label-md text-[#1B1B1B] tracking-[0.1em]">
                SECURITY_KEY
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
                  w-full h-14 flex items-center justify-center gap-3
                  text-white font-semibold text-sm tracking-[0.1em] uppercase
                  transition-all disabled:opacity-60 disabled:cursor-not-allowed
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
                    CREATE_ACCOUNT
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center pt-2">
              <Link
                to="/auth/login"
                id="signup-login-link"
                className="text-label-md text-[#1B1B1B] opacity-40 hover:opacity-70 transition-opacity tracking-[0.08em]"
              >
                ALREADY_HAVE_ACCESS? LOGIN →
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
