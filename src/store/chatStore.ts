import { create } from 'zustand';
import type { Message, Conversation } from '@/types';
import { chatService } from '@/services/chat';

interface ChatState {
  // State
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  wsConnected: boolean;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  error: string | null;

  // Sync actions
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  setWsConnected: (connected: boolean) => void;
  loadMessagesForConversation: (conversationId: string, messages: Message[]) => void;

  // Async actions
  fetchConversations: () => Promise<void>;
  fetchMessages: (waId: string) => Promise<void>;
  sendMessage: (
    waId: string,
    body: string,
    previewUrl?: boolean,
    contextMessageId?: string | null
  ) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  conversations: [],
  activeConversationId: null,
  messages: {},
  wsConnected: false,
  isLoadingConversations: false,
  isLoadingMessages: false,
  error: null,

  // ─── Sync Actions ────────────────────────────────────────────────────────────

  setActiveConversation: (id) => set({ activeConversationId: id }),

  addMessage: (conversationId, message) => {
    const { messages } = get();
    const existing = messages[conversationId] || [];
    set({
      messages: {
        ...messages,
        [conversationId]: [...existing, message],
      },
    });
  },

  setWsConnected: (connected) => set({ wsConnected: connected }),

  loadMessagesForConversation: (conversationId, messages) => {
    const { messages: current } = get();
    set({ messages: { ...current, [conversationId]: messages } });
  },

  // ─── Async Actions ───────────────────────────────────────────────────────────

  fetchConversations: async () => {
    set({ isLoadingConversations: true, error: null });
    try {
      const conversations = await chatService.getConversations();
      set({ conversations, isLoadingConversations: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load conversations';
      set({ error: msg, isLoadingConversations: false });
    }
  },

  fetchMessages: async (waId: string) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const messages = await chatService.getMessages(waId, { limit: 50 });
      const { messages: current } = get();
      set({
        messages: { ...current, [waId]: messages },
        isLoadingMessages: false,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load messages';
      set({ error: msg, isLoadingMessages: false });
    }
  },

  sendMessage: async (waId, body, previewUrl = false, contextMessageId = null) => {
    try {
      const result = await chatService.sendMessage({
        wa_id: waId,
        body,
        preview_url: previewUrl,
        context_message_id: contextMessageId,
      });

      // Optimistically add message with real wamid from Meta
      const { messages } = get();
      const existing = messages[waId] || [];
      const newMessage: Message = {
        id: result.message_id,
        conversation_id: waId,
        direction: 'outbound',
        type: 'text',
        text: body,
        template_id: null,
        template_name: null,
        contact_name: null,
        context_message_id: contextMessageId,
        status: 'accepted',
        error_code: null,
        error_message: null,
        timestamp: result.timestamp,
      };

      set({ messages: { ...messages, [waId]: [...existing, newMessage] } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send message';
      set({ error: msg });
      // Re-throw so ChatWindow can restore the input
      throw err;
    }
  },
}));
