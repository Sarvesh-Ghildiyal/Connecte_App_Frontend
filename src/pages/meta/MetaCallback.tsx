import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Page: /meta/callback
// Handles the OAuth redirect from Meta (if not using postMessage approach).
// In the Embedded Signup flow this page is rarely hit directly — the token
// exchange is done inside MetaLogin via postMessage + /meta/callback API.
// ─────────────────────────────────────────────────────────────────────────────

export default function MetaCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // After a short delay, redirect back to dashboard
    // In production, URL search params (code, etc.) would be picked up here
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F9F9]">
      <div className="flex flex-col items-center gap-6 text-center">
        <Loader2 size={40} className="animate-spin text-[#25D366]" />
        <div>
          <p className="text-label-md text-[#1B1B1B] tracking-[0.1em] mb-1">
            PROCESSING_AUTH
          </p>
          <p className="text-sm text-[#1B1B1B]/50">
            Synchronizing with Meta infrastructure…
          </p>
        </div>
      </div>
    </div>
  );
}
