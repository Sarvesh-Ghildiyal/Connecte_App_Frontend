import { Search, Loader2 } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';

// ── Relative time formatter ───────────────────────────────────────────────────
function formatRelativeTime(isoString: string): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const now = new Date();

    // Today → show time
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();
    if (isYesterday) return 'YESTERDAY';

    // Within a week → day name (MON, TUE, …)
    const diffDays = Math.floor(
      (now.setHours(0, 0, 0, 0) - new Date(isoString).setHours(0, 0, 0, 0)) / 86400000
    );
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' }).toUpperCase();
    }

    // Older → e.g. "APR 5"
    return date
      .toLocaleDateString([], { month: 'short', day: 'numeric' })
      .toUpperCase();
  } catch {
    return '';
  }
}

// ── Status indicator ──────────────────────────────────────────────────────────
function StatusIndicator({ unreadCount }: { unreadCount: number }) {
  if (unreadCount > 0) {
    return (
      <div className="w-5 h-5 bg-[#1B1B1B] flex items-center justify-center shrink-0">
        <span className="text-[9px] font-black text-white">{unreadCount}</span>
      </div>
    );
  }
  // Double-tick (delivered/read)
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className="shrink-0">
      <path d="M1 5l3 3 5-6" stroke="#25D366" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 5l3 3 5-6" stroke="#25D366" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Online dot indicator ──────────────────────────────────────────────────────
function OnlineDot() {
  return <span className="w-2.5 h-2.5 bg-[#25D366] shrink-0 inline-block" />;
}

export default function ConversationList() {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    isLoadingConversations,
  } = useChatStore();

  return (
    <div
      className="w-[320px] shrink-0 flex flex-col border-r border-[#E8E8E8] bg-white overflow-hidden"
      style={{ height: '100%' }}
    >
      {/* Header */}
      <div className="px-6 pt-8 pb-5 shrink-0">
        <h1 className="text-[2rem] font-black text-[#1B1B1B] leading-none tracking-tight uppercase mb-6">
          INBOX
        </h1>
        {/* Search */}
        <div className="flex items-center gap-2 bg-[#F3F3F3] px-4 h-10">
          <Search size={13} className="text-[#1B1B1B]/30 shrink-0" />
          <input
            type="text"
            placeholder="SEARCH MESSAGES..."
            className="bg-transparent text-[11px] font-semibold tracking-wider text-[#1B1B1B] placeholder:text-[#1B1B1B]/30 outline-none w-full uppercase"
          />
        </div>
      </div>

      {/* Conversation rows */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading skeleton */}
        {isLoadingConversations && conversations.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={18} className="text-[#1B1B1B]/20 animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isLoadingConversations && conversations.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-[10px] font-bold tracking-widest text-[#1B1B1B]/20 uppercase">
              No conversations yet
            </p>
          </div>
        )}

        {conversations.map((conv) => {
          const isActive = conv.id === activeConversationId;
          // Fall back to phone if contact_name is null/empty
          const displayName = conv.contact_name || conv.contact_phone || conv.id;

          return (
            <button
              key={conv.id}
              onClick={() => setActiveConversation(conv.id)}
              className={`w-full text-left px-6 py-5 border-b border-[#F3F3F3] transition-colors relative flex flex-col gap-1.5 ${
                isActive ? 'bg-white' : 'hover:bg-[#F9F9F9]'
              }`}
            >
              {/* Active left-border accent */}
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#25D366]" />
              )}

              {/* Row top: name + time */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {isActive && <OnlineDot />}
                  <p className="text-[11px] font-black tracking-wider text-[#1B1B1B] truncate uppercase">
                    {displayName}
                  </p>
                </div>
                <p className="text-[10px] font-semibold text-[#1B1B1B]/30 shrink-0 uppercase">
                  {formatRelativeTime(conv.last_message_time)}
                </p>
              </div>

              {/* Row bottom: preview + status */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-[#1B1B1B]/40 truncate">
                  {conv.last_message}
                </p>
                <StatusIndicator unreadCount={conv.unread_count} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
