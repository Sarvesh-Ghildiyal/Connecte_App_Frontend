import { api } from './api';
import type { Message, Conversation, SendMessageRequest } from '@/types';

export const chatService = {
  getConversations: async () => {
    const response = await api.get<{ conversations: Conversation[] }>('/chat/conversations');
    return response.data.conversations;
  },

  getMessages: async (
    conversationId: string,
    params?: { limit?: number; offset?: number }
  ) => {
    const response = await api.get<{ messages: Message[] }>(
      `/chat/conversations/${conversationId}/messages`,
      { params }
    );
    return response.data.messages;
  },

  sendMessage: async (data: SendMessageRequest) => {
    const response = await api.post<{ message_id: string; status: string }>(
      '/chat/send',
      data
    );
    return response.data;
  },
};
