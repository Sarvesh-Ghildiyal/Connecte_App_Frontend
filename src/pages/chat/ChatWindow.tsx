import { useEffect, useRef, useState } from 'react';
import { Phone, Video, MoreVertical, Paperclip, ArrowRight, Check } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';

// ── Read receipt tick ─────────────────────────────────────────────────────────
function ReadTick({ status }: { status: 'sent' | 'delivered' | 'read' }) {
  if (status === 'sent') {
    return <Check size={11} className="text-white/60" />;
  }
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

export default function ChatWindow() {
  const { conversations, activeConversationId, messages, addMessage } = useChatStore();
  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const activeMessages = activeConversationId ? (messages[activeConversationId] ?? []) : [];

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || !activeConversationId) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      conversation_id: activeConversationId,
      from: 'me',
      to: activeConv?.contact_phone ?? '',
      type: 'text' as const,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent' as const,
      direction: 'outbound' as const,
    };

    addMessage(activeConversationId, newMessage);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeConv) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">

      {/* ── Chat Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-8 h-[73px] border-b border-[#E8E8E8] shrink-0">
        <div>
          <h2 className="text-[13px] font-black text-[#1B1B1B] tracking-wider uppercase">
            {activeConv.contact_name}
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 bg-[#25D366] inline-block" />
            <p className="text-[9px] font-black tracking-[0.2em] text-[#1B1B1B]/40 uppercase">
              ACTIVE NOW
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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

        {/* Date label for first messages */}
        {activeMessages.length > 0 && (
          <DateSeparator label="OCTOBER 14, 2023" />
        )}

        {activeMessages.map((msg) => {
          const isOutbound = msg.direction === 'outbound';
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[65%] gap-1 ${
                isOutbound ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div
                className={`px-4 py-3 ${
                  isOutbound
                    ? 'bg-[#25D366] text-white'
                    : 'bg-[#F3F3F3] text-[#1B1B1B]'
                }`}
              >
                <p className={`text-sm leading-relaxed ${isOutbound ? 'text-white' : 'text-[#1B1B1B]'}`}>
                  {msg.text}
                </p>
              </div>
              {/* Timestamp + read receipt */}
              <div className="flex items-center gap-1 px-1">
                <p className={`text-[9px] font-semibold ${isOutbound ? 'text-[#1B1B1B]/30' : 'text-[#1B1B1B]/30'}`}>
                  {msg.timestamp}
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
        {activeMessages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[11px] font-bold tracking-widest text-[#1B1B1B]/20 uppercase">
              No messages yet
            </p>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* ── Composer Bar ───────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center border-t border-[#E8E8E8] bg-white">
        {/* Attachment */}
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
          className="flex-1 h-14 text-sm text-[#1B1B1B] placeholder:text-[#1B1B1B]/25 placeholder:tracking-wider placeholder:text-[11px] outline-none bg-transparent"
        />

        {/* Send button */}
        <button
          id="send-message-btn"
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className="h-14 px-7 bg-[#1B1B1B] text-white flex items-center gap-2 text-[11px] font-black tracking-widest uppercase shrink-0 hover:bg-[#25D366] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#1B1B1B]"
        >
          SEND <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
