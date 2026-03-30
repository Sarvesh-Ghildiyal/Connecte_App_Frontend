import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Zap } from 'lucide-react';
import { metaService } from '@/services/meta';
import { useAuthStore } from '@/store/authStore';

// ─────────────────────────────────────────────────────────────────────────────
// Page: /meta/login
// Design reference: page2.png
// Capitol Lean — "Precision Integration"
// Split layout: left dark panel (50%) | right authorize form (50%)
// ─────────────────────────────────────────────────────────────────────────────

// Extend window type for Facebook SDK
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FB: any;
    fbAsyncInit: () => void;
  }
}

const META_APP_ID = import.meta.env.VITE_META_APP_ID ?? '';
const META_CONFIG_ID = import.meta.env.VITE_META_CONFIG_ID ?? '';
const META_API_VERSION = import.meta.env.VITE_META_API_VERSION ?? 'v21.0';

interface EmbeddedSignupData {
  phone_number_id: string;
  waba_id: string;
  business_id: string;
}

type ConnectionStep = 'idle' | 'loading' | 'sdk_ready' | 'connecting' | 'success' | 'error';

export default function MetaLogin() {
  const navigate = useNavigate();
  const { setMetaConnection } = useAuthStore();

  const [step, setStep] = useState<ConnectionStep>('loading');
  const [error, setError] = useState<string | null>(null);

  // Captured from WA_EMBEDDED_SIGNUP postMessage event
  const embeddedDataRef = useRef<EmbeddedSignupData | null>(null);

  // ── Facebook SDK loader ────────────────────────────────────────────────────
  useEffect(() => {
    // Listen for Meta postMessage events from the FB popup
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.endsWith('facebook.com')) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP' && data.event === 'FINISH_TYPE') {
          embeddedDataRef.current = {
            phone_number_id: data.data.phone_number_id,
            waba_id: data.data.waba_id,
            business_id: data.data.business_id,
          };
        }
      } catch {
        // Non-JSON message — ignore
      }
    };
    window.addEventListener('message', handleMessage);

    // Inject FB SDK script
    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // SDK init callback
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: META_APP_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: META_API_VERSION,
      });
      setStep('sdk_ready');
    };

    // If SDK already loaded (hot reload)
    if (typeof window.FB !== 'undefined') {
      setStep('sdk_ready');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // ── Launch Meta OAuth popup ────────────────────────────────────────────────
  const launchWhatsAppSignup = () => {
    if (typeof window.FB === 'undefined') {
      setError('Facebook SDK not loaded. Please refresh and try again.');
      return;
    }

    setStep('connecting');
    setError(null);

    window.FB.login(
      async (response: { authResponse?: { code: string } }) => {
        if (!response.authResponse?.code) {
          setStep('sdk_ready');
          setError('Meta authorization was cancelled or failed. Please try again.');
          return;
        }

        const code = response.authResponse.code;
        const embedded = embeddedDataRef.current;

        if (!embedded) {
          setStep('sdk_ready');
          setError(
            'WhatsApp Business data not received. Please complete the Meta setup flow.'
          );
          return;
        }

        try {
          const result = await metaService.sendCallback({
            code,
            waba_id: embedded.waba_id,
            phone_number_id: embedded.phone_number_id,
            business_id: embedded.business_id,
          });

          if (result.success) {
            setMetaConnection({
              waba_id: result.waba_id,
              phone_number_id: result.phone_number_id,
            });
            setStep('success');
            setTimeout(() => navigate('/dashboard', { replace: true }), 1200);
          } else {
            throw new Error('Backend reported failure');
          }
        } catch (err: unknown) {
          const axiosError = err as { response?: { data?: { detail?: string } } };
          setError(
            axiosError?.response?.data?.detail ??
              'Failed to connect WhatsApp Business. Please try again.'
          );
          setStep('sdk_ready');
        }
      },
      {
        config_id: META_CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras: { setup: {} },
      }
    );
  };

  // ── Derived UI state ───────────────────────────────────────────────────────
  const isBusy = step === 'loading' || step === 'connecting';
  const isSuccess = step === 'success';

  return (
    <div className="flex min-h-screen">
      {/* ── LEFT: Dark precision panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#1B1B1B] p-12 relative overflow-hidden">
        {/* Geo coordinates */}
        <div>
          <p className="text-[10px] text-white/30 tracking-widest uppercase">
            LAT: 37.4848° N
          </p>
          <p className="text-[10px] text-white/30 tracking-widest uppercase">
            LON: 122.1484° W
          </p>
        </div>

        {/* Brand lockup */}
        <div className="flex items-center gap-3 absolute top-12 left-12">
          <div className="w-8 h-8 bg-[#25D366] flex items-center justify-center">
            <Zap size={16} className="text-black" />
          </div>
          <span className="text-white font-bold text-sm tracking-[0.15em] uppercase">
            CONNECTE
          </span>
        </div>

        {/* Hero text */}
        <div className="mt-20">
          <div className="mb-8">
            <h1
              className="font-black uppercase text-white leading-none"
              style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', letterSpacing: '-0.02em' }}
            >
              PRECISION
              <br />
              <span className="text-[#25D366]">INTEGRATION.</span>
            </h1>
          </div>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Direct server-to-server authorization.{' '}
            Experience the power of Meta Cloud API without the latency of traditional web
            pairing.
          </p>
        </div>

        {/* Subtle wireframe trapezoid decoration */}
        <div
          className="absolute right-0 top-1/4 w-56 h-72 opacity-10 border border-white"
          style={{ clipPath: 'polygon(20% 0%, 100% 10%, 100% 90%, 0% 100%)' }}
        />

        {/* Feature bullets */}
        <div className="flex flex-col gap-3">
          {[
            'ENCRYPTED END-TO-END',
            '99.9% API UPTIME',
            'ZERO WEB DEPENDENCY',
          ].map((f) => (
            <div key={f} className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[#25D366]" />
              <span className="text-label-md text-white/60 tracking-[0.08em]">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Authorization panel ────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 bg-[#F9F9F9] flex flex-col justify-between p-12">
        <div className="flex-1 flex items-center">
          <div className="w-full max-w-md">
            {/* Section label */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-6 border-t border-[#1B1B1B]/30" />
              <p className="text-label-md text-[#1B1B1B]/40 tracking-[0.12em]">
                SYSTEM_AUTH_01
              </p>
            </div>

            {/* Heading */}
            <h2
              className="font-black uppercase text-[#1B1B1B] leading-none mb-4"
              style={{ fontSize: 'clamp(2rem, 4vw, 2.875rem)', letterSpacing: '-0.02em' }}
            >
              AUTHORIZE META
              <br />
              CLOUD API
            </h2>
            <p className="text-sm text-[#1B1B1B]/60 leading-relaxed mb-10 max-w-sm">
              Connect via Meta Cloud API. No WhatsApp Web or QR pairing required. This
              direct integration ensures architectural stability and enterprise-grade
              performance.
            </p>

            {/* Error state */}
            {error && (
              <div
                id="meta-login-error"
                role="alert"
                className="mb-6 px-4 py-3 bg-red-50 border-l-2 border-red-500 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* Success state */}
            {isSuccess && (
              <div
                id="meta-login-success"
                role="status"
                className="mb-6 px-4 py-3 bg-green-50 border-l-2 border-[#25D366] text-sm text-green-800"
              >
                WhatsApp Business connected successfully. Redirecting…
              </div>
            )}

            {/* Feature cards */}
            <div className="bg-white mb-8">
              <div className="p-5 border-l-4 border-transparent">
                <div className="flex items-start gap-4 pb-5 border-b border-[#E8E8E8]">
                  <Shield size={18} className="text-[#1B1B1B]/40 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-[#1B1B1B] text-sm mb-1">
                      DIRECT LINKAGE
                    </p>
                    <p className="text-sm text-[#1B1B1B]/50 leading-relaxed">
                      Authorized through Meta Business Manager infrastructure.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 pt-5">
                  <Zap size={18} className="text-[#1B1B1B]/40 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-[#1B1B1B] text-sm mb-1">
                      INSTANT ACTIVATION
                    </p>
                    <p className="text-sm text-[#1B1B1B]/50 leading-relaxed">
                      Average setup completion time: 45 seconds.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary CTA */}
            <button
              id="meta-connect-btn"
              type="button"
              onClick={launchWhatsAppSignup}
              disabled={isBusy || isSuccess}
              className="
                w-full h-14 flex items-center justify-center gap-3 mb-3
                text-white font-semibold text-sm tracking-[0.1em] uppercase
                transition-all disabled:opacity-50 disabled:cursor-not-allowed
                rounded-none
              "
              style={{
                background:
                  isBusy || isSuccess
                    ? '#25D366'
                    : 'linear-gradient(45deg, #006D2F, #25D366)',
              }}
            >
              {step === 'loading' && (
                <>
                  <span
                    className="w-4 h-4 border-2 border-white border-t-transparent animate-spin"
                    style={{ borderRadius: '50%' }}
                  />
                  LOADING SDK...
                </>
              )}
              {(step === 'sdk_ready' || step === 'error' || step === 'idle') && (
                <>
                  CONNECT WITH META
                  <ArrowRight size={16} />
                </>
              )}
              {step === 'connecting' && (
                <>
                  <span
                    className="w-4 h-4 border-2 border-white border-t-transparent animate-spin"
                    style={{ borderRadius: '50%' }}
                  />
                  AUTHORIZING...
                </>
              )}
              {step === 'success' && (
                <>
                  CONNECTED ✓
                </>
              )}
            </button>

            {/* Secondary CTA */}
            <button
              id="meta-learn-btn"
              type="button"
              className="
                w-full h-14 flex items-center justify-center
                bg-white text-[#1B1B1B] font-semibold text-sm tracking-[0.1em] uppercase
                hover:bg-[#F3F3F3] transition-colors
                rounded-none
              "
              onClick={() =>
                window.open(
                  'https://developers.facebook.com/docs/whatsapp/cloud-api',
                  '_blank'
                )
              }
            >
              LEARN ABOUT ARCHITECTURE
            </button>
          </div>
        </div>

        {/* Footer bar */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t border-[#E8E8E8]">
          <p className="text-label-md text-[#1B1B1B]/30 tracking-widest">
            © 2024 CONNECTE SYSTEM
          </p>
          <div className="flex items-center gap-6">
            <button className="text-label-md text-[#1B1B1B]/30 hover:text-[#1B1B1B]/60 transition-colors tracking-widest">
              PRIVACY
            </button>
            <button className="text-label-md text-[#1B1B1B]/30 hover:text-[#1B1B1B]/60 transition-colors tracking-widest">
              SECURITY
            </button>
          </div>
        </div>

        {/* Radical Precision tag */}
        <div className="flex items-center gap-4 mt-6 justify-end">
          <div className="w-12 border-t border-[#1B1B1B]/20" />
          <p className="text-label-md text-[#1B1B1B]/20 tracking-[0.2em]">
            RADICAL PRECISION
          </p>
        </div>
      </div>
    </div>
  );
}
