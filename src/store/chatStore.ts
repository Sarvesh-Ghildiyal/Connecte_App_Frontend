import { create } from 'zustand';

interface Message {
  id: string;
  conversation_id: string;
  from: string;
  to: string;
  type: 'text' | 'template';
  text?: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  direction: 'inbound' | 'outbound';
}

interface Conversation {
  id: string;
  contact_name: string;
  contact_phone: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface ChatState {
  // State
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  wsConnected: boolean;

  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessageStatus: (messageId: string, status: Message['status']) => void;
  setWsConnected: (connected: boolean) => void;
  loadMessagesForConversation: (conversationId: string, messages: Message[]) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  conversations: [],
  activeConversationId: null,
  messages: {},
  wsConnected: false,

  // Actions
  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  addMessage: (conversationId, message) => {
    const { messages } = get();
    const conversationMessages = messages[conversationId] || [];

    set({
      messages: {
        ...messages,
        [conversationId]: [...conversationMessages, message],
      },
    });
  },

  updateMessageStatus: (messageId, status) => {
    const { messages } = get();
    const updatedMessages = { ...messages };

    Object.keys(updatedMessages).forEach((conversationId) => {
      updatedMessages[conversationId] = updatedMessages[conversationId].map((msg) =>
        msg.id === messageId ? { ...msg, status } : msg
      );
    });

    set({ messages: updatedMessages });
  },

  setWsConnected: (connected) => set({ wsConnected: connected }),

  loadMessagesForConversation: (conversationId, messages) => {
    const { messages: currentMessages } = get();
    set({
      messages: {
        ...currentMessages,
        [conversationId]: messages,
      },
    });
  },
}));
