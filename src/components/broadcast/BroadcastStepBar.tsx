// ─────────────────────────────────────────────────────────────────────────────
// BroadcastStepBar
// Reusable step-progress header for the Broadcast wizard pages.
// Reference: page6b.png
//
// Steps (in order):
//   1. Templates
//   2. Audience
//   3. Review
//   4. Send
//
// Props:
//   currentStep — 1-indexed active step number
//   onLaunch    — called when "LAUNCH CAMPAIGN" is clicked (only enabled at final step)
// ─────────────────────────────────────────────────────────────────────────────

interface BroadcastStepBarProps {
  currentStep: 1 | 2 | 3 | 4;
  onLaunch?: () => void;
}

const STEPS = [
  { number: 1, label: 'TEMPLATES' },
  { number: 2, label: 'AUDIENCE' },
  { number: 3, label: 'REVIEW' },
  { number: 4, label: 'SEND' },
] as const;

export default function BroadcastStepBar({ currentStep, onLaunch }: BroadcastStepBarProps) {
  return (
    <header className="flex items-center justify-between h-14 px-8 bg-white border-b border-[#E8E8E8] shrink-0">
      {/* Left: wizard title */}
      <div className="flex items-center gap-8">
        <p className="text-[11px] font-black tracking-[0.2em] text-[#1B1B1B] uppercase">
          BROADCAST WIZARD
        </p>

        {/* Step indicators */}
        <nav className="flex items-center gap-6">
          {STEPS.map(({ number, label }) => {
            const isActive   = number === currentStep;
            const isComplete = number < currentStep;
            return (
              <div key={number} className="flex items-center gap-2">
                <p
                  className={`text-[10px] font-black tracking-widest uppercase transition-colors ${
                    isActive
                      ? 'text-[#25D366]'
                      : isComplete
                      ? 'text-[#1B1B1B]/40 line-through'
                      : 'text-[#1B1B1B]/25'
                  }`}
                >
                  STEP {number}: {label}
                </p>
                {/* Green underline for active step */}
                {isActive && (
                  <span className="block h-[2px] w-full absolute bottom-0 left-0 bg-[#25D366]" />
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Right: LAUNCH CAMPAIGN */}
      <button
        id="launch-campaign-btn"
        onClick={onLaunch}
        disabled={currentStep < 4}
        className="h-9 px-6 bg-[#1B1B1B] text-white text-[10px] font-black tracking-widest uppercase hover:bg-[#25D366] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#1B1B1B]"
      >
        LAUNCH CAMPAIGN
      </button>
    </header>
  );
}
