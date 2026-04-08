// ─── Auth ──────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface MetaData {
  waba_id: string | null;
  phone_number_id: string | null;
  connected_at?: string;
}

// ─── Templates ─────────────────────────────────────────────────────────────

export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION' | 'TRANSACTIONAL';
export type TemplateStatus = 'APPROVED' | 'PENDING' | 'REJECTED';
export type TemplateComponentType = 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
export type TemplateHeaderFormat = 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';

export interface TemplateComponent {
  type: TemplateComponentType;
  format?: TemplateHeaderFormat;
  text?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  example?: any;
}

export interface Template {
  id: string; // Meta API ID
  name: string;
  language: string;
  category: TemplateCategory;
  status: TemplateStatus;
  components: TemplateComponent[];
  last_synced_at: string; // ISO datetime
}

export interface CreateTemplateRequest {
  name: string;
  language: string;
  category: TemplateCategory;
  components: TemplateComponent[];
}

// ─── Contacts ──────────────────────────────────────────────────────────────

export interface Contact {
  id: string;
  phone_number: string;
  name: string | null;
  tags: string[];
  opted_in: boolean;
  created_at: string;
}

export interface ContactCreate {
  phone_number: string;
  name?: string | null;
  tags?: string[];
  opted_in?: boolean;
}

export interface ContactsResponse {
  contacts: Contact[];
  total: number;
  limit: number;
  offset: number;
}

export interface BulkUploadRequest {
  contacts: Array<{
    phone_number: string;
    name?: string;
    tags?: string[];
  }>;
}

export interface BulkUploadResponse {
  success: boolean;
  imported: number;
  duplicates: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any[];
}

// ─── Chat ───────────────────────────────────────────────────────────────────

export type MessageType = 'text' | 'template';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageDirection = 'inbound' | 'outbound';

export interface Message {
  id: string;
  conversation_id: string;
  from: string;
  to: string;
  type: MessageType;
  text?: string;
  timestamp: string;
  status: MessageStatus;
  direction: MessageDirection;
}

export interface Conversation {
  id: string;
  contact_name: string;
  contact_phone: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export interface SendMessageRequest {
  conversation_id: string;
  recipient_phone: string;
  type: MessageType;
  text?: string;
  template_name?: string;
  language_code?: string;
  variables?: string[];
}

// ─── Broadcast ─────────────────────────────────────────────────────────────

export type TemplateParameterType = 'text' | 'currency' | 'date_time';

export interface TemplateParameterInput {
  index: number;
  type: TemplateParameterType;
  value: any;
}

export interface BroadcastRequest {
  template_id: string;
  parameters: TemplateParameterInput[];
  tags: string[];
}

export interface BroadcastResponse {
  broadcast_id: string;
  status: 'queued';
  total_recipients: number;
  message: string;
}
