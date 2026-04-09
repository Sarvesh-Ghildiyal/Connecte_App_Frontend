import { useEffect, useRef, useState } from 'react';
import { Phone, Video, MoreVertical, Paperclip, ArrowRight, Check, X, Loader2, RefreshCw } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import type { MessageStatus } from '@/types';

// ── Timestamp formatter ───────────────────────────────────────────────────────
function formatTime(isoString: string): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
}

// ── Read receipt tick ─────────────────────────────────────────────────────────
function ReadTick({ status }: { status: MessageStatus | null }) {
  if (!status || status === null) return null;

  if (status === 'failed') {
    return <X size={11} className="text-red-400" />;
  }
  if (status === 'accepted' || status === 'sent') {
    return <Check size={11} className="text-white/60" />;
  }
  // delivered or read — double tick
  return (
    <span className="inline-flex items-center">
      <Check size={11} className={status === 'read' ? 'text-[#4ADE80]' : 'text-white/60'} />
      <Check size={11} className={`-ml-1.5 ${status === 'read' ? 'text-[#4ADE80]' : 'text-white/60'}`} />
    </span>
  );
}

// ── Date separator ────────────────────────────────────────────────────────────
function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-4">
      <p className="text-[9px] font-black tracking-[0.25em] text-[#1B1B1B]/30 uppercase">
        {label}
      </p>
    </div>
  );
}

// ── Group messages into date buckets for separators ───────────────────────────
function getDateLabel(isoString: string): string {
  if (!isoString) return 'TODAY';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffDays = Math.floor((now.setHours(0,0,0,0) - date.setHours(0,0,0,0)) / 86400000);
    if (diffDays === 0) return 'TODAY';
    if (diffDays === 1) return 'YESTERDAY';
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'long' }).toUpperCase();
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  } catch {
    return 'TODAY';
  }
}

export default function ChatWindow() {
  const {
    conversations,
    activeConversationId,
    messages,
    sendMessage,
    fetchMessages,
    isLoadingMessages,
  } = useChatStore();

  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const activeMessages = activeConversationId ? (messages[activeConversationId] ?? []) : [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length]);

  // Clear error toast after 4s
  useEffect(() => {
    if (sendError) {
      const t = setTimeout(() => setSendError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [sendError]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || !activeConversationId || isSending) return;

    setInputValue(''); // Clear immediately for UX
    setIsSending(true);
    setSendError(null);

    try {
      await sendMessage(activeConversationId, text, false, null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send message';
      setSendError(msg);
      setInputValue(text); // Restore on failure
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeConv) return null;

  // Build date-grouped message list
  const renderedMessages: Array<{ type: 'separator'; label: string } | { type: 'message'; msg: typeof activeMessages[0] }> = [];
  let lastDateLabel = '';
  for (const msg of activeMessages) {
    const label = getDateLabel(msg.timestamp);
    if (label !== lastDateLabel) {
      renderedMessages.push({ type: 'separator', label });
      lastDateLabel = label;
    }
    renderedMessages.push({ type: 'message', msg });
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">

      {/* ── Chat Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-8 h-[73px] border-b border-[#E8E8E8] shrink-0">
        <div>
          <h2 className="text-[13px] font-black text-[#1B1B1B] tracking-wider uppercase">
            {activeConv.contact_name || activeConv.contact_phone}
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 bg-[#25D366] inline-block" />
            <p className="text-[9px] font-black tracking-[0.2em] text-[#1B1B1B]/40 uppercase">
              {activeConv.contact_phone}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Refresh messages */}
          <button
            onClick={() => activeConversationId && fetchMessages(activeConversationId)}
            className={`w-10 h-10 flex items-center justify-center border border-[#E8E8E8] text-[#1B1B1B]/40 hover:text-[#1B1B1B] hover:border-[#1B1B1B] transition-colors ${isLoadingMessages ? 'animate-spin' : ''}`}
            title="Refresh messages"
          >
            <RefreshCw size={14} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center border border-[#E8E8E8] text-[#1B1B1B]/40 hover:text-[#1B1B1B] hover:border-[#1B1B1B] transition-colors">
            <Phone size={16} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center border border-[#E8E8E8] text-[#1B1B1B]/40 hover:text-[#1B1B1B] hover:border-[#1B1B1B] transition-colors">
            <Video size={16} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center border border-[#E8E8E8] text-[#1B1B1B]/40 hover:text-[#1B1B1B] hover:border-[#1B1B1B] transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* ── Message Thread ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-4">

        {/* Loading state */}
        {isLoadingMessages && activeMessages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={20} className="text-[#1B1B1B]/20 animate-spin" />
          </div>
        )}

        {/* Messages with date separators */}
        {renderedMessages.map((item, idx) => {
          if (item.type === 'separator') {
            return <DateSeparator key={`sep-${idx}`} label={item.label} />;
          }

          const msg = item.msg;
          const isOutbound = msg.direction === 'outbound';
          const isFailed = msg.status === 'failed';

          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[65%] gap-1 ${
                isOutbound ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              {/* Contact name for inbound */}
              {!isOutbound && msg.contact_name && (
                <p className="text-[9px] font-black tracking-wider text-[#1B1B1B]/30 uppercase px-1">
                  {msg.contact_name}
                </p>
              )}

              <div
                className={`px-4 py-3 ${
                  isFailed
                    ? 'bg-red-50 border border-red-200'
                    : isOutbound
                    ? 'bg-[#25D366] text-white'
                    : 'bg-[#F3F3F3] text-[#1B1B1B]'
                }`}
              >
                {/* Template badge */}
                {msg.type === 'template' && (
                  <p className={`text-[9px] font-black tracking-widest uppercase mb-1 ${isFailed ? 'text-red-400' : isOutbound ? 'text-white/60' : 'text-[#1B1B1B]/30'}`}>
                    TEMPLATE
                  </p>
                )}
                <p className={`text-sm leading-relaxed ${
                  isFailed ? 'text-red-600' : isOutbound ? 'text-white' : 'text-[#1B1B1B]'
                }`}>
                  {msg.text || (msg.template_name ? `Template: ${msg.template_name}` : '[message]')}
                </p>
                {/* Failed error detail */}
                {isFailed && msg.error_message && (
                  <p className="text-[9px] text-red-400 mt-1 font-semibold">
                    {msg.error_message}
                  </p>
                )}
              </div>

              {/* Timestamp + read receipt */}
              <div className="flex items-center gap-1 px-1">
                <p className="text-[9px] font-semibold text-[#1B1B1B]/30">
                  {formatTime(msg.timestamp)}
                </p>
                {isOutbound && (
                  <span className="inline-flex text-[#1B1B1B]/30">
                    <ReadTick status={msg.status} />
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {!isLoadingMessages && activeMessages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[11px] font-bold tracking-widest text-[#1B1B1B]/20 uppercase">
              No messages yet
            </p>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* ── Send Error Toast ────────────────────────────────────────────────── */}
      {sendError && (
        <div className="mx-8 mb-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-[11px] font-semibold tracking-wide">
          {sendError}
        </div>
      )}

      {/* ── Composer Bar ───────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center border-t border-[#E8E8E8] bg-white">
        {/* Attachment (future) */}
        <button className="w-14 h-14 flex items-center justify-center text-[#1B1B1B]/30 hover:text-[#1B1B1B] transition-colors shrink-0">
          <Paperclip size={18} />
        </button>

        {/* Text input */}
        <input
          type="text"
          placeholder="TYPE YOUR MESSAGE..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          className="flex-1 h-14 text-sm text-[#1B1B1B] placeholder:text-[#1B1B1B]/25 placeholder:tracking-wider placeholder:text-[11px] outline-none bg-transparent disabled:opacity-50"
        />

        {/* Send button */}
        <button
          id="send-message-btn"
          onClick={handleSend}
          disabled={!inputValue.trim() || isSending}
          className="h-14 px-7 bg-[#1B1B1B] text-white flex items-center gap-2 text-[11px] font-black tracking-widest uppercase shrink-0 hover:bg-[#25D366] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#1B1B1B]"
        >
          {isSending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <>SEND <ArrowRight size={14} /></>
          )}
        </button>
      </div>
    </div>
  );
}
