import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import ConversationList from './chat/ConversationList';
import ChatWindow from './chat/ChatWindow';

export default function Chat() {
  const {
    fetchConversations,
    fetchMessages,
    activeConversationId,
    setActiveConversation,
    isLoadingConversations,
    conversations,
  } = useChatStore();

  // Load inbox on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  }, [activeConversationId]);

  // Auto-select first conversation once loaded
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversation(conversations[0].id);
    }
  }, [conversations]);

  const handleRefresh = () => {
    fetchConversations();
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  };

  return (
    <div className="flex h-full overflow-hidden relative">
      {/* Left: Conversation list */}
      <ConversationList />

      {/* Right: Chat window or empty state */}
      {activeConversationId ? (
        <ChatWindow />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white">
          {isLoadingConversations ? (
            <p className="text-[11px] font-bold tracking-widest text-[#1B1B1B]/20 uppercase animate-pulse">
              Loading conversations...
            </p>
          ) : (
            <p className="text-[11px] font-bold tracking-widest text-[#1B1B1B]/20 uppercase">
              Select a conversation
            </p>
          )}
        </div>
      )}

      {/* Manual refresh button — top-right corner */}
      <button
        onClick={handleRefresh}
        title="Refresh"
        className={`absolute top-5 right-6 w-8 h-8 flex items-center justify-center text-[#1B1B1B]/30 hover:text-[#1B1B1B] transition-colors ${isLoadingConversations ? 'animate-spin' : ''}`}
      >
        <RefreshCw size={14} />
      </button>
    </div>
  );
}
