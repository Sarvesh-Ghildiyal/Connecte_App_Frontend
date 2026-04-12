import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Zap } from 'lucide-react';
import { logger } from '@/utils/logger';

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
const META_API_VERSION = import.meta.env.VITE_META_API_VERSION ?? 'v21.0';
const META_ES_CONFIG_ID = import.meta.env.VITE_META_ES_CONFIG_ID ?? '';

interface MetaFlowData {
  phone_number_id?: string;
  waba_id?: string;
  business_id?: string;
  [key: string]: any;
}

type ConnectionStep = 'idle' | 'loading' | 'sdk_ready' | 'connecting' | 'success' | 'error';

export default function MetaLogin() {
  const navigate = useNavigate();

  const [step, setStep] = useState<ConnectionStep>('loading');
  const [error, setError] = useState<string | null>(null);

  // Refs to coordinate between the message event and the OAuth callback
  const messageDataRef = useRef<MetaFlowData | null>(null);
  const oauthCodeRef = useRef<string | null>(null);
  const flowTriggeredRef = useRef(false);
  // ── Route to Callback Logic ────────────────────────────────────────────────
  const triggerSetupAndNavigate = (params: {
    event: string;
    data?: any;
    code?: string | null;
  }) => {
    if (flowTriggeredRef.current) return;
    flowTriggeredRef.current = true;

    logger.debug('META_LOGIN', 'Handing off flow to callback page', params);

    // Navigate to callback page, passing the exact payload
    navigate('/meta/callback', {
      replace: true,
      state: { ...params }
    });
  };

  // ── Facebook SDK loader ────────────────────────────────────────────────────
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Only process messages from expected origins
      if (!event.origin.endsWith('facebook.com')) return;
      
      const rawData = event.data;
      let data: any = null;

      try {
        if (typeof rawData === 'string') {
          // 1. Check for URL-encoded query string (handles 'cb=...&code=...' payloads)
          if (rawData.includes('code=') || rawData.includes('cb=')) {
            const params = new URLSearchParams(rawData);
            const code = params.get('code');
            if (code) {
              logger.info('META_LOGIN', 'OAuth code detected in postMessage query string');
              oauthCodeRef.current = code;
              
              // If we already have the message data (like waba_id) from another event, finish now
              if (messageDataRef.current) {
                triggerSetupAndNavigate({
                  event: 'FINISH',
                  data: messageDataRef.current,
                  code: oauthCodeRef.current,
                });
              }
              return;
            }
          }

          // 2. Try JSON parsing (handles WA_EMBEDDED_SIGNUP events)
          try {
            data = JSON.parse(rawData);
          } catch {
            // Silently ignore non-JSON and non-code-bearing internal SDK chatter
            return;
          }
        } else if (typeof rawData === 'object' && rawData !== null) {
          data = rawData;
        }

        // We only care about WhatsApp Embedded Signup messages
        if (data?.type === 'WA_EMBEDDED_SIGNUP') {
          logger.info('META_LOGIN', `Meta SDK event: ${data.event}`, data);

          if (data.event === 'CANCEL' || data.event === 'ERROR') {
            triggerSetupAndNavigate({
              event: data.event,
              data: data.data,
            });
            return;
          }

          // Strict check for core required fields, but always allow and log extra info
          if (data.event === 'FINISH') {
            const requiredFields = ['phone_number_id', 'waba_id'];
            const missing = requiredFields.filter(f => !data.data?.[f]);
            
            if (missing.length > 0) {
              logger.warn('META_LOGIN', 'Meta FINISH message missing core fields', { missing });
            }

            // Always log extra fields for visibility
            const knownFields = [...requiredFields, 'business_id'];
            const extraFields = Object.keys(data.data || {}).filter(k => !knownFields.includes(k));
            if (extraFields.length > 0) {
              logger.info('META_LOGIN', 'Additional Meta fields detected', { fields: extraFields });
            }
          }

          // Merge all data fields to ensure we capture everything Meta provides
          messageDataRef.current = {
            ...(messageDataRef.current || {}),
            ...(data.data || {})
          };

          // If we have both the code and the message data, complete the flow
          if (oauthCodeRef.current !== null) {
            triggerSetupAndNavigate({
              event: data.event,
              data: messageDataRef.current,
              code: oauthCodeRef.current,
            });
          }
        }
      } catch (err) {
        logger.error('META_LOGIN', 'Error processing Meta SDK message', { 
          error: err instanceof Error ? err.message : String(err)
        });
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
      logger.info('META_LOGIN', 'Meta SDK initialization started', { appId: META_APP_ID, version: META_API_VERSION });
      window.FB.init({
        appId: META_APP_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: META_API_VERSION,
      });
      setStep('sdk_ready');
      logger.info('META_LOGIN', 'Meta SDK initialization completed');
    };

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
    logger.info('META_LOGIN', 'Launching WhatsApp signup popup', { configId: META_ES_CONFIG_ID });

    window.FB.login(
      (response: any) => {
        logger.debug('META_LOGIN', 'FB.login callback executed', response);

        if (response.authResponse?.code) {
          oauthCodeRef.current = response.authResponse.code;
          
          // If we already have the message data, we can finish
          if (messageDataRef.current) {
            triggerSetupAndNavigate({
              // When messageData exists, it should be a success event like FINISH
              event: 'FINISH', 
              data: messageDataRef.current,
              code: oauthCodeRef.current,
            });
          }
        } else {
          // No code returned — likely a cancellation or error from the FB.login side
          logger.warn('META_LOGIN', 'FB.login callback returned no auth code', response);
          // We wait for the 'CANCEL' message event to handle navigation uniformly
        }
      },
      {
        config_id: META_ES_CONFIG_ID,
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
        {/* <div>
          <p className="text-[10px] text-white/30 tracking-widest uppercase">
            LAT: 37.4848° N
          </p>
          <p className="text-[10px] text-white/30 tracking-widest uppercase">
            LON: 122.1484° W
          </p>
        </div> */}

        {/* Brand lockup */}
        <div 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 absolute top-12 left-12 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img src="/connecte.svg" alt="Connecte Logo" className="w-10 h-10 object-contain" />
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
              WHATSAPP
              <br />
              <span className="text-[#25D366]">EMBEDDED SIGNUP.</span>
            </h1>
          </div>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Connect your WhatsApp Business Account directly. Access the power of the WhatsApp Business Platform seamlessly without the friction of manual configuration.
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
            'STREAMLINED ONBOARDING',
            'SEAMLESS INTEGRATION',
            'INSTANT CLOUD API ACCESS',
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
              CONNECT
              <br />
              WHATSAPP API
            </h2>
            <p className="text-sm text-[#1B1B1B]/60 leading-relaxed mb-10 max-w-sm">
              Link your Meta Business Profile and WhatsApp Business Account (WABA) using Embedded Signup. This ensures robust, enterprise-grade access for your business messaging.
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
                      EMBEDDED SIGNUP FLOW
                    </p>
                    <p className="text-sm text-[#1B1B1B]/50 leading-relaxed">
                      Securely connects to your Meta Business Manager portfolio.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 pt-5">
                  <Zap size={18} className="text-[#1B1B1B]/40 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-[#1B1B1B] text-sm mb-1">
                      WABA PROVISIONING
                    </p>
                    <p className="text-sm text-[#1B1B1B]/50 leading-relaxed">
                      Automatically configures your WhatsApp Business Account.
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
                transition-all hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
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
                  CONNECT WHATSAPP
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
                hover:bg-[#F3F3F3] cursor-pointer transition-colors
                rounded-none
              "
              onClick={() =>
                window.open(
                  'https://developers.facebook.com/docs/whatsapp/cloud-api',
                  '_blank'
                )
              }
            >
              LEARN ABOUT EMBEDDED SIGNUP
            </button>
          </div>
        </div>

        {/* Footer bar */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t border-[#E8E8E8]">
          <p className="text-label-md text-[#1B1B1B]/30 tracking-widest">
            © 2026 CONNECT-ENTERPRISE
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
            SECURE INTEGRATION
          </p>
        </div>
      </div>
    </div>
  );
}
