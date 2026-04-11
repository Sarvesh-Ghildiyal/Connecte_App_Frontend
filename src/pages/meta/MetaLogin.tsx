import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertTriangle, Shield, Zap } from 'lucide-react';
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
      if (!event.origin.endsWith('facebook.com')) return;
      
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          logger.info('META_LOGIN', `Meta SDK message received: ${data.event}`, data);

          if (data.event === 'CANCEL' || data.event === 'ERROR') {
            triggerSetupAndNavigate({
              event: data.event,
              data: data.data,
            });
            return;
          }

          // Capture success data
          messageDataRef.current = data.data;

          // Check for extra fields (ad accounts, catalogs, etc.)
          const knownFields = ['phone_number_id', 'waba_id', 'business_id'];
          const extraFields = Object.keys(data.data || {}).filter(k => !knownFields.includes(k));
          if (extraFields.length > 0) {
            logger.warn('META_LOGIN', 'Extra fields detected in Meta message data', { fields: extraFields });
          }

          // If we already have the OAuth code, we can finish
          if (oauthCodeRef.current !== null) {
            triggerSetupAndNavigate({
              event: data.event,
              data: messageDataRef.current,
              code: oauthCodeRef.current,
            });
          }
        }
      } catch (err) {
        logger.error('META_LOGIN', 'Failed to parse Meta SDK message', { raw: event.data, error: err });
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
            {/* App Review Notice */}
            <div className="mb-6 rounded-3xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
                  <AlertTriangle size={18} />
                </div>
                <div className="grow">
                  <p className="font-semibold text-sm text-yellow-950 mb-2">App Under Meta Review</p>
                  <p className="text-sm text-yellow-900 leading-relaxed">
                    Our Meta app is currently in review, so direct onboarding to the WhatsApp Cloud API is temporarily unavailable.
                    Please reach out to{' '}
                    <a
                      href="mailto:founders@connecte.in"
                      className="font-semibold text-yellow-950 underline hover:text-yellow-800"
                    >
                      founders@connecte.in
                    </a>{' '}
                    to coordinate access with our developer team.
                  </p>
                </div>
              </div>
            </div>

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
              disabled={true}
              className="
                w-full h-14 flex items-center justify-center gap-3 mb-3
                text-white font-semibold text-sm tracking-[0.1em] uppercase
                bg-gray-400 cursor-not-allowed
                rounded-none
              "
            >
              ONBOARDING UNAVAILABLE
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
