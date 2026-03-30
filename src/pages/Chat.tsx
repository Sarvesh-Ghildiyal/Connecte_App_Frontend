import { useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import ConversationList from './chat/ConversationList';
import ChatWindow from './chat/ChatWindow';

// ─────────────────────────────────────────────────────────────────────────────
// Dummy data — seeded once on mount, replaced by API/WebSocket later
// ─────────────────────────────────────────────────────────────────────────────
const DUMMY_CONVERSATIONS = [
  {
    id: 'conv-1',
    contact_name: 'ALEX RIVERA',
    contact_phone: '+1 (555) 012-1184',
    last_message: 'The implementation plan looks soli...',
    last_message_time: '10:42 AM',
    unread_count: 0,
  },
  {
    id: 'conv-2',
    contact_name: 'SARAH CHEN',
    contact_phone: '+44 20 7946 0128',
    last_message: 'Confirmed. The metadata is now...',
    last_message_time: 'YESTERDAY',
    unread_count: 0,
  },
  {
    id: 'conv-3',
    contact_name: 'MARCUS VAUGHN',
    contact_phone: '+91 98765 43210',
    last_message: 'Can we schedule a quick call to...',
    last_message_time: 'YESTERDAY',
    unread_count: 3,
  },
  {
    id: 'conv-4',
    contact_name: 'ELENA RODRIGUEZ',
    contact_phone: '+45 32 45 67 89',
    last_message: 'Sent the documentation over for th...',
    last_message_time: 'MONDAY',
    unread_count: 0,
  },
  {
    id: 'conv-5',
    contact_name: 'DAVID KIM',
    contact_phone: '+1 (415) 555-0182',
    last_message: 'Any updates on the subscription ti...',
    last_message_time: 'OCT 12',
    unread_count: 0,
  },
];

const DUMMY_MESSAGES = {
  'conv-1': [
    {
      id: 'msg-1',
      conversation_id: 'conv-1',
      from: 'alex',
      to: 'me',
      type: 'text' as const,
      text: "Hey team, I've just uploaded the updated schema for the Meta Cloud API. It includes the new messaging templates we discussed.",
      timestamp: '09:15 AM',
      status: 'read' as const,
      direction: 'inbound' as const,
    },
    {
      id: 'msg-2',
      conversation_id: 'conv-1',
      from: 'me',
      to: 'alex',
      type: 'text' as const,
      text: "Great catch on the schema Alex. I'll verify the field mapping now. Do we have the validation logic ready?",
      timestamp: '09:18 AM',
      status: 'read' as const,
      direction: 'outbound' as const,
    },
  ],
  'conv-2': [
    {
      id: 'msg-3',
      conversation_id: 'conv-2',
      from: 'sarah',
      to: 'me',
      type: 'text' as const,
      text: 'Confirmed. The metadata is now synced with the production environment.',
      timestamp: 'YESTERDAY',
      status: 'delivered' as const,
      direction: 'inbound' as const,
    },
  ],
  'conv-3': [
    {
      id: 'msg-4',
      conversation_id: 'conv-3',
      from: 'marcus',
      to: 'me',
      type: 'text' as const,
      text: 'Can we schedule a quick call to go over the broadcast setup?',
      timestamp: 'YESTERDAY',
      status: 'sent' as const,
      direction: 'inbound' as const,
    },
  ],
  'conv-4': [
    {
      id: 'msg-5',
      conversation_id: 'conv-4',
      from: 'elena',
      to: 'me',
      type: 'text' as const,
      text: 'Sent the documentation over for the new contact import workflow.',
      timestamp: 'MONDAY',
      status: 'read' as const,
      direction: 'inbound' as const,
    },
  ],
  'conv-5': [
    {
      id: 'msg-6',
      conversation_id: 'conv-5',
      from: 'david',
      to: 'me',
      type: 'text' as const,
      text: 'Any updates on the subscription timeline?',
      timestamp: 'OCT 12',
      status: 'sent' as const,
      direction: 'inbound' as const,
    },
  ],
};

export default function Chat() {
  const { conversations, setConversations, loadMessagesForConversation, setActiveConversation, activeConversationId } =
    useChatStore();

  // Seed dummy data once on mount (real API will replace this)
  useEffect(() => {
    if (conversations.length === 0) {
      setConversations(DUMMY_CONVERSATIONS);
      Object.entries(DUMMY_MESSAGES).forEach(([convId, msgs]) => {
        loadMessagesForConversation(convId, msgs);
      });
      setActiveConversation('conv-1');
    }
  }, []);

  return (
    // Full height, no overflow — each panel manages its own scroll
    <div className="flex h-full overflow-hidden">
      {/* Left: Conversation list */}
      <ConversationList />

      {/* Right: Chat window */}
      {activeConversationId ? (
        <ChatWindow />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white">
          <p className="text-[11px] font-bold tracking-widest text-[#1B1B1B]/20 uppercase">
            Select a conversation
          </p>
        </div>
      )}
    </div>
  );
}
