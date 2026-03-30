import { useNavigate } from 'react-router-dom';
import { FileText, Users, Radio, MessageSquare, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/layout/LoadingState';

// ─────────────────────────────────────────────────────────────────────────────
// Page: /dashboard
// Shows Meta connection status card + feature nav cards
// ─────────────────────────────────────────────────────────────────────────────

interface FeatureCard {
  label: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  requiresMeta: boolean;
}

const featureCards: FeatureCard[] = [
  {
    label: 'TEMPLATES',
    description: 'Manage your message templates for broadcast messaging.',
    icon: <FileText size={24} />,
    to: '/templates',
    requiresMeta: true,
  },
  {
    label: 'CONTACTS',
    description: 'Upload and manage your customer phone number list.',
    icon: <Users size={24} />,
    to: '/contacts',
    requiresMeta: true,
  },
  {
    label: 'BROADCAST',
    description: 'Send bulk messages to contacts using approved templates.',
    icon: <Radio size={24} />,
    to: '/broadcast',
    requiresMeta: true,
  },
  {
    label: 'CHAT',
    description: 'Real-time WhatsApp messaging interface.',
    icon: <MessageSquare size={24} />,
    to: '/chat',
    requiresMeta: true,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isMetaConnected, metaData } = useAuth();

  if (!isAuthenticated) {
    return <LoadingState message="AUTHENTICATING..." />;
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-10">
        <p className="text-label-md text-foreground/40 tracking-[0.12em] mb-1">
          SYSTEM_OVERVIEW
        </p>
        <h1 className="text-headline-lg text-foreground">CONNECTE DASHBOARD</h1>
      </div>

      {/* Meta connection status card */}
      <div
        className={`mb-10 p-6 ${
          isMetaConnected ? 'bg-[#FFFFFF]' : 'bg-[#FFFFFF] border-l-4 border-amber-400'
        }`}
      >
        {isMetaConnected ? (
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-[#25D366] inline-block" />
                <p className="text-label-md text-foreground tracking-[0.08em]">
                  WHATSAPP BUSINESS — CONNECTED
                </p>
              </div>
              {metaData.waba_id && (
                <p className="text-sm text-muted-foreground">
                  WABA ID: {metaData.waba_id}
                </p>
              )}
              {metaData.phone_number_id && (
                <p className="text-sm text-muted-foreground">
                  Phone Number ID: {metaData.phone_number_id}
                </p>
              )}
            </div>
            <span className="text-xs bg-[#25D366]/10 text-[#006D2F] px-3 py-1 font-semibold tracking-widest uppercase">
              ACTIVE
            </span>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-amber-400 inline-block" />
                <p className="text-label-md text-foreground tracking-[0.08em]">
                  WHATSAPP BUSINESS — NOT CONNECTED
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Connect your WhatsApp Business Account to unlock all features.
              </p>
            </div>
            <button
              id="dashboard-connect-meta-btn"
              onClick={() => navigate('/meta/login')}
              className="
                shrink-0 h-11 px-6 flex items-center gap-2
                text-white font-semibold text-sm tracking-[0.08em] uppercase
                transition-all rounded-none
              "
              style={{ background: 'linear-gradient(45deg, #006D2F, #25D366)' }}
            >
              CONNECT WHATSAPP BUSINESS
            </button>
          </div>
        )}
      </div>

      {/* Feature cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {featureCards.map((card) => {
          const locked = card.requiresMeta && !isMetaConnected;
          return (
            <div
              key={card.label}
              id={`dashboard-card-${card.label.toLowerCase()}`}
              title={
                locked
                  ? 'Connect your WhatsApp Business Account to unlock this feature'
                  : undefined
              }
              className={`
                bg-white p-8 flex flex-col gap-6 transition-all group
                ${
                  locked
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:shadow-[0px_20px_40px_rgba(27,27,27,0.06)]'
                }
              `}
              onClick={() => {
                if (!locked) navigate(card.to);
                else navigate('/meta/login');
              }}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`
                    w-10 h-10 flex items-center justify-center
                    ${locked ? 'bg-[#E8E8E8] text-[#1B1B1B]/30' : 'bg-[#E8E8E8] text-[#1B1B1B] group-hover:bg-[#25D366] group-hover:text-black transition-colors'}
                  `}
                >
                  {locked ? <Lock size={18} /> : card.icon}
                </div>
                <span className="text-label-md text-foreground/30 tracking-[0.08em]">
                  {locked ? 'LOCKED' : '→'}
                </span>
              </div>

              <div>
                <p className="text-label-md text-foreground tracking-[0.1em] mb-2">
                  {card.label}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>

              <button
                className={`
                  self-start h-10 px-5 text-sm font-semibold tracking-[0.08em] uppercase transition-all rounded-none
                  ${
                    locked
                      ? 'bg-[#E8E8E8] text-[#1B1B1B]/40 cursor-not-allowed'
                      : 'bg-[#E8E8E8] text-[#1B1B1B] hover:bg-[#1B1B1B] hover:text-white'
                  }
                `}
                tabIndex={-1}
              >
                {locked ? 'CONNECT META' : `GO TO ${card.label}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
