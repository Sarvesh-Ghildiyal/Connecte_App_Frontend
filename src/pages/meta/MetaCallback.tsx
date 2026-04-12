import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { metaSignupService } from '@/services/metaSignup';
import { useAuthStore } from '@/store/authStore';
import { logger } from '@/utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Page: /meta/callback
// Consumes the exact parsed state from MetaLogin, triggers backend provisioning,
// and gives the user real-time detailed step feedback.
// ─────────────────────────────────────────────────────────────────────────────

export default function MetaCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setMetaConnection } = useAuthStore();
  
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  // We use this to simulate progress visually for the user since the backend 
  // execution is synchronous within a single HTTP request.
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const processTriggered = useRef(false);

  const steps = [
    { label: "Authorizing Meta Configuration..." },
    { label: "Exchanging Token..." },
    { label: "Subscribing App to Webhooks..." },
    { label: "Registering Phone Number & PIN..." }
  ];

  useEffect(() => {
    // Only run once
    if (processTriggered.current) return;
    processTriggered.current = true;

    const payload = location.state as {
      event: string;
      type?: string;
      data?: any;
      code?: string | null;
    } | null;

    if (!payload || !payload.event) {
      setStatus('error');
      setErrorDetails('No Meta payload received. Please restart the authorization process.');
      return;
    }

    if (payload.event === 'CANCEL' || payload.event === 'ERROR') {
      setStatus('error');
      setErrorDetails(
        payload.event === 'CANCEL' 
          ? 'Setup was cancelled by the user.' 
          : 'An error occurred directly from Meta platform.'
      );
      // Removed auto-redirect to allow user to read the message
      return;
    }

    const runSetup = async () => {
      logger.info('META_CALLBACK', 'Initiating backend setup process', { 
        event: payload.event,
        type: payload.type 
      });
      // Start simulated step progression for UI
      const stepTimer1 = setTimeout(() => setActiveStepIndex(1), 1500);
      const stepTimer2 = setTimeout(() => setActiveStepIndex(2), 3000);
      const stepTimer3 = setTimeout(() => setActiveStepIndex(3), 4500);

      try {
        await metaSignupService.setup({
          event: payload.event,
          type: payload.type || 'WA_EMBEDDED_SIGNUP',
          code: payload.code,
          data: payload.data
        });

        logger.info('META_CALLBACK', 'Backend setup completed successfully');
        // Ensure all UI steps show completed
        setActiveStepIndex(4);
        setStatus('success');

        // Update auth state so the dashboard unlocks meta features
        setMetaConnection({
          waba_id: payload.data?.waba_id || null,
          phone_number_id: payload.data?.phone_number_id || null,
          connected_at: new Date().toISOString()
        });

        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);

      } catch (err: any) {
        // Handle FastAPI style validation errors which arrive as an array of objects
        const detail = err.response?.data?.detail;
        let errorMessage = 'The backend failed to complete the Meta setup protocol. Please try again.';

        if (Array.isArray(detail)) {
          errorMessage = detail.map((d: any) => `${d.loc?.[d.loc.length - 1] || 'error'}: ${d.msg}`).join(', ');
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (err.message) {
          errorMessage = err.message;
        }

        logger.error('META_CALLBACK', 'Backend setup failed', { 
          error: errorMessage,
          rawResponse: err.response?.data 
        });
        
        setStatus('error');
        setErrorDetails(errorMessage);
        
        // Removed auto-redirect to allow user to read the detailed error message
      } finally {
        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);
        clearTimeout(stepTimer3);
      }
    };

    runSetup();
  }, [location, navigate, setMetaConnection]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F9F9] font-plus-jakarta">
      <div className="max-w-[500px] w-full bg-white p-12 border border-[#E8E8E8] shadow-sm">
        
        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] text-[#1B1B1B]/40 tracking-[0.2em] font-semibold uppercase mb-2">
            System Initialization
          </p>
          <h1 className="text-[24px] font-bold text-[#0B0C10] leading-tight tracking-tight uppercase">
            {status === 'processing' && 'Processing Authorization'}
            {status === 'success' && 'Integration Complete'}
            {status === 'error' && 'Integration Failed'}
          </h1>
        </div>

        {/* Steps display */}
        {status === 'processing' && (
          <div className="space-y-5">
            {steps.map((step, idx) => {
              const state = idx < activeStepIndex 
                ? 'done' 
                : idx === activeStepIndex ? 'active' : 'pending';

              return (
                <div key={idx} className="flex items-center gap-4">
                  {state === 'done' ? (
                    <CheckCircle size={18} className="text-[#25D366] shrink-0" />
                  ) : state === 'active' ? (
                    <Loader2 size={18} className="animate-spin text-[#1B1B1B] shrink-0" />
                  ) : (
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-[#E8E8E8] shrink-0" />
                  )}
                  <p className={`text-[13px] font-medium transition-colors duration-300 ${
                    state === 'done' ? 'text-[#1B1B1B]/60' : 
                    state === 'active' ? 'text-[#1B1B1B]' : 'text-[#1B1B1B]/30'
                  }`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Success / Error Views */}
        {status === 'success' && (
          <div className="bg-[#25D366]/10 p-4 border-l-4 border-[#25D366]">
            <p className="text-[13px] font-semibold text-[#006D2F]">
              Your WhatsApp Business Account (WABA) has been successfully verified, tokenized, and subscribed to our webhooks. Redirecting to your dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 p-6 border-l-4 border-[#FF4D4D] flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <AlertCircle size={20} className="text-[#FF4D4D] shrink-0 mt-0.5" />
              <div>
                <p className="text-[14px] font-bold text-[#FF4D4D] mb-1 uppercase tracking-tight">
                  Protocol Error
                </p>
                <p className="text-[13px] text-[#FF4D4D]/80 leading-relaxed">
                  {errorDetails}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/meta/login')}
              className="w-full h-11 border border-[#FF4D4D]/30 text-[#FF4D4D] font-bold text-[11px] tracking-[0.15em] uppercase hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              ← Restart Integration
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
