# Connecte Frontend - Implementation Guide

## Overview

This document combines architectural planning and implementation instructions for building the Connecte frontend. Use this alongside the PRD and Stitch designs to generate production-ready React code.

---

## Part 1: Architecture & Technical Design

### 1.1 Project Initialization

```bash
# Create Vite React project with TypeScript
npm create vite@latest connecte-frontend -- --template react-ts

cd connecte-frontend

# Install core dependencies
npm install react-router-dom zustand axios

# Install UI dependencies
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install Shadcn/ui (customized for Capitol Lean)
npx shadcn-ui@latest init
```

### 1.2 Tailwind Configuration

Update `tailwind.config.js` to use Capitol Lean design tokens:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surface Hierarchy
        surface: {
          DEFAULT: '#F9F9F9',
          low: '#F3F3F3',
          container: '#FFFFFF',
          high: '#E8E8E8',
          highest: '#E2E2E2',
        },
        // Primary - WhatsApp Green
        primary: {
          DEFAULT: '#006D2F',
          container: '#25D366',
        },
        // Secondary
        secondary: {
          container: '#E2E2E2',
        },
        // Text
        'on-surface': '#1B1B1B',
        'on-background': '#1B1B1B',
        'on-primary': '#FFFFFF',
        'on-primary-container': '#1B1B1B',
        'on-secondary': '#1B1B1B',
        // Ghost border
        outline: {
          variant: 'rgba(187, 203, 185, 0.15)',
        },
      },
      fontSize: {
        // Display
        'display-lg': ['3.5rem', { lineHeight: '1.2', letterSpacing: 'normal' }],
        'display-md': ['2.875rem', { lineHeight: '1.2' }],
        // Headline
        'headline-lg': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
        'headline-md': ['1.75rem', { lineHeight: '1.3' }],
        // Title
        'title-lg': ['1.5rem', { lineHeight: '1.4' }],
        'title-md': ['1rem', { lineHeight: '1.5' }],
        // Body
        'body-lg': ['1rem', { lineHeight: '1.6' }],
        'body-md': ['0.875rem', { lineHeight: '1.6' }],
        // Label
        'label-md': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        'label-sm': ['0.6875rem', { lineHeight: '1.4' }],
      },
      spacing: {
        // Custom spacing scale
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.5rem',    // 24px
        '6': '2rem',      // 32px
        '8': '3rem',      // 48px
        '10': '4rem',     // 64px
      },
      borderRadius: {
        // Capitol Lean: 0px everywhere
        DEFAULT: '0px',
        'none': '0px',
      },
      boxShadow: {
        // Ambient glow only
        'glow': '0px 20px 40px rgba(27, 27, 27, 0.04)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

---

## Part 2: Component Architecture

### 2.1 Component Hierarchy

```
App (Root)
├── Router
│   ├── PublicRoutes
│   │   ├── Login
│   │   └── Signup
│   ├── MetaOnboardingRoutes (Protected)
│   │   ├── MetaLogin
│   │   └── MetaCallback
│   └── ProtectedRoutes (Auth + Meta)
│       ├── DashboardLayout (Sidebar + Content)
│       │   ├── Dashboard
│       │   ├── Templates
│       │   ├── Contacts
│       │   ├── Broadcast
│       │   └── Chat
```

### 2.2 Component Design Patterns

#### Base Components (`/components/ui`)
```
Button.tsx         - Primary, Secondary, variants
Input.tsx          - Text input with focus states
Card.tsx           - Container component
Chip.tsx           - Tag/label component
Modal.tsx          - Overlay dialog
Table.tsx          - Data table component
Spinner.tsx        - Loading indicator
Toast.tsx          - Notification component
```

#### Layout Components (`/components/layout`)
```
Sidebar.tsx        - Navigation sidebar
Navbar.tsx         - Top navigation (if needed)
PageHeader.tsx     - Page title + actions
EmptyState.tsx     - No data placeholder
ErrorState.tsx     - Error display
LoadingState.tsx   - Loading display
```

#### Feature Components (`/components/*`)
```
/chat
  ChatList.tsx          - Conversation list
  ChatWindow.tsx        - Message display
  MessageBubble.tsx     - Individual message
  MessageInput.tsx      - Composition input

/templates
  TemplateCard.tsx      - Template preview
  TemplateForm.tsx      - Creation modal
  TemplatePreview.tsx   - Live preview

/contacts
  ContactTable.tsx      - Contact list
  ContactUpload.tsx     - CSV upload
  ContactForm.tsx       - Manual entry

/broadcast
  TemplateSelector.tsx  - Step 1
  ContactSelector.tsx   - Step 2
  MessagePreview.tsx    - Step 3
```

---

## Part 3: State Management (Zustand)

### 3.1 Auth Store (`/store/authStore.ts`)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
}

interface MetaData {
  waba_id: string | null;
  phone_number_id: string | null;
  connected_at?: string;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isMetaConnected: boolean;
  metaData: MetaData;
  
  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  setMetaConnection: (data: MetaData) => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isMetaConnected: false,
      metaData: {
        waba_id: null,
        phone_number_id: null,
      },
      
      // Actions
      login: (token, user) => {
        sessionStorage.setItem('connecte_auth_token', token);
        set({
          token,
          user,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        sessionStorage.removeItem('connecte_auth_token');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isMetaConnected: false,
          metaData: { waba_id: null, phone_number_id: null },
        });
      },
      
      setMetaConnection: (data) => {
        set({
          isMetaConnected: true,
          metaData: data,
        });
      },
      
      checkAuth: () => {
        const token = sessionStorage.getItem('connecte_auth_token');
        if (token) {
          set({ token, isAuthenticated: true });
          // Call API to verify token and fetch user data
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Don't persist token (use sessionStorage)
        user: state.user,
        isMetaConnected: state.isMetaConnected,
        metaData: state.metaData,
      }),
    }
  )
);
```

### 3.2 App Store (`/store/appStore.ts`)

```typescript
import { create } from 'zustand';

interface Template {
  id: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

interface Contact {
  id: string;
  phone_number: string;
  name: string;
  tags: string[];
}

interface BroadcastProgress {
  sent: number;
  total: number;
  failed: number;
}

interface AppState {
  // State
  selectedTemplate: Template | null;
  selectedContacts: Contact[];
  broadcastProgress: BroadcastProgress | null;
  
  // Actions
  setSelectedTemplate: (template: Template | null) => void;
  toggleContactSelection: (contact: Contact) => void;
  selectAllContacts: (contacts: Contact[]) => void;
  clearContactSelection: () => void;
  updateBroadcastProgress: (progress: BroadcastProgress) => void;
  resetBroadcast: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  selectedTemplate: null,
  selectedContacts: [],
  broadcastProgress: null,
  
  // Actions
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  
  toggleContactSelection: (contact) => {
    const { selectedContacts } = get();
    const exists = selectedContacts.find(c => c.id === contact.id);
    
    if (exists) {
      set({
        selectedContacts: selectedContacts.filter(c => c.id !== contact.id),
      });
    } else {
      set({
        selectedContacts: [...selectedContacts, contact],
      });
    }
  },
  
  selectAllContacts: (contacts) => set({ selectedContacts: contacts }),
  
  clearContactSelection: () => set({ selectedContacts: [] }),
  
  updateBroadcastProgress: (progress) => set({ broadcastProgress: progress }),
  
  resetBroadcast: () => set({
    selectedTemplate: null,
    selectedContacts: [],
    broadcastProgress: null,
  }),
}));
```

### 3.3 Chat Store (`/store/chatStore.ts`)

```typescript
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
  updateMessageStatus: (messageId: string, status: string) => void;
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
    
    Object.keys(updatedMessages).forEach(conversationId => {
      updatedMessages[conversationId] = updatedMessages[conversationId].map(msg =>
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
```

---

## Part 4: API Layer (Axios)

### 4.1 Axios Instance (`/services/api.ts`)

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('connecte_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state
      sessionStorage.removeItem('connecte_auth_token');
      
      // Redirect to login
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
```

### 4.2 Auth Service (`/services/auth.ts`)

```typescript
import { api } from './api';

interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
}

interface UserResponse {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export const authService = {
  signup: async (data: SignupRequest) => {
    const response = await api.post<{ message: string; user: UserResponse }>(
      '/auth/sign_up',
      data
    );
    return response.data;
  },
  
  login: async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
  
  // Note: User data fetch would be a separate endpoint if needed
  // getCurrentUser: async () => {
  //   const response = await api.get<UserResponse>('/auth/me');
  //   return response.data;
  // },
};
```

### 4.3 Meta Service (`/services/meta.ts`)

```typescript
import { api } from './api';

interface MetaCallbackRequest {
  code: string;
  waba_id: string;
  phone_number_id: string;
  business_id: string;
}

interface MetaCallbackResponse {
  success: boolean;
  message: string;
  waba_id: string;
  phone_number_id: string;
}

interface MetaStatusResponse {
  is_connected: boolean;
  waba_id: string | null;
  phone_number_id: string | null;
  connected_at: string | null;
}

export const metaService = {
  sendCallback: async (data: MetaCallbackRequest) => {
    const response = await api.post<MetaCallbackResponse>(
      '/meta/callback',
      data
    );
    return response.data;
  },
  
  getStatus: async () => {
    const response = await api.get<MetaStatusResponse>('/meta/status');
    return response.data;
  },
};
```

### 4.4 Template Service (`/services/templates.ts`)

```typescript
import { api } from './api';

interface Template {
  id: string;
  name: string;
  language: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  components: TemplateComponent[];
  created_at: string;
}

interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  example?: any;
}

interface CreateTemplateRequest {
  name: string;
  language: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  components: TemplateComponent[];
}

export const templateService = {
  getAll: async () => {
    const response = await api.get<{ templates: Template[] }>('/templates');
    return response.data.templates;
  },
  
  getById: async (id: string) => {
    const response = await api.get<Template>(`/templates/${id}`);
    return response.data;
  },
  
  create: async (data: CreateTemplateRequest) => {
    const response = await api.post<Template>('/templates', data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/templates/${id}`);
    return response.data;
  },
};
```

### 4.5 Contact Service (`/services/contacts.ts`)

```typescript
import { api } from './api';

interface Contact {
  id: string;
  phone_number: string;
  name: string;
  tags: string[];
  created_at: string;
}

interface ContactsResponse {
  contacts: Contact[];
  total: number;
  limit: number;
  offset: number;
}

interface BulkUploadRequest {
  contacts: Array<{
    phone_number: string;
    name?: string;
    tags?: string[];
  }>;
}

interface BulkUploadResponse {
  success: boolean;
  imported: number;
  duplicates: number;
  errors: any[];
}

export const contactService = {
  getAll: async (params?: { tag?: string; limit?: number; offset?: number }) => {
    const response = await api.get<ContactsResponse>('/contacts', { params });
    return response.data;
  },
  
  bulkUpload: async (data: BulkUploadRequest) => {
    const response = await api.post<BulkUploadResponse>('/contacts/bulk', data);
    return response.data;
  },
  
  create: async (contact: Omit<Contact, 'id' | 'created_at'>) => {
    const response = await api.post<Contact>('/contacts', contact);
    return response.data;
  },
  
  update: async (id: string, data: Partial<Contact>) => {
    const response = await api.put<Contact>(`/contacts/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/contacts/${id}`);
    return response.data;
  },
};
```

### 4.6 Broadcast Service (`/services/broadcast.ts`)

```typescript
import { api } from './api';

interface BroadcastRequest {
  template_id: string;
  contact_ids: string[];
  variables?: Record<string, string>;
}

interface BroadcastResponse {
  broadcast_id: string;
  status: 'queued';
  total_recipients: number;
  message: string;
}

export const broadcastService = {
  send: async (data: BroadcastRequest) => {
    const response = await api.post<BroadcastResponse>('/broadcast', data);
    return response.data;
  },
};
```

### 4.7 Chat Service (`/services/chat.ts`)

```typescript
import { api } from './api';

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

interface SendMessageRequest {
  conversation_id: string;
  recipient_phone: string;
  type: 'text' | 'template';
  text?: string;
  template_name?: string;
  language_code?: string;
  variables?: string[];
}

export const chatService = {
  getConversations: async () => {
    const response = await api.get<{ conversations: Conversation[] }>(
      '/chat/conversations'
    );
    return response.data.conversations;
  },
  
  getMessages: async (conversationId: string, params?: { limit?: number; offset?: number }) => {
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
```

---

## Part 5: Custom Hooks

### 5.1 useAuth Hook (`/hooks/useAuth.ts`)

```typescript
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { metaService } from '@/services/meta';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isMetaConnected,
    metaData,
    login,
    logout,
    setMetaConnection,
    checkAuth,
  } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
    
    // Check Meta connection status on mount
    if (isAuthenticated) {
      metaService.getStatus().then((status) => {
        if (status.is_connected) {
          setMetaConnection({
            waba_id: status.waba_id,
            phone_number_id: status.phone_number_id,
            connected_at: status.connected_at || undefined,
          });
        }
      }).catch(console.error);
    }
  }, [isAuthenticated]);
  
  return {
    user,
    token,
    isAuthenticated,
    isMetaConnected,
    metaData,
    login,
    logout,
    setMetaConnection,
  };
};
```

### 5.2 useWebSocket Hook (`/hooks/useWebSocket.ts`)

```typescript
import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/chatStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export const useWebSocket = (token: string | null) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;
  
  const {
    addMessage,
    updateMessageStatus,
    setWsConnected,
  } = useChatStore();
  
  const connect = () => {
    if (!token) return;
    
    const ws = new WebSocket(`${WS_URL}/chat/ws?token=${token}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setWsConnected(true);
      setReconnectAttempts(0);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_message') {
          addMessage(data.data.conversation_id, data.data);
        } else if (data.type === 'message_status') {
          updateMessageStatus(data.data.message_id, data.data.status);
        } else if (data.type === 'broadcast_update') {
          // Handle broadcast progress updates
          // Could dispatch to a separate store or callback
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWsConnected(false);
      
      // Attempt reconnection with exponential backoff
      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connect();
        }, delay);
      }
    };
    
    wsRef.current = ws;
  };
  
  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };
  
  useEffect(() => {
    if (token) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [token]);
  
  return {
    ws: wsRef.current,
    disconnect,
  };
};
```

---

## Part 6: Routing & Route Protection

### 6.1 Router Configuration (`/app/router.tsx`)

```typescript
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MetaProtectedRoute } from '@/components/MetaProtectedRoute';

// Pages
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import MetaLogin from '@/pages/meta/MetaLogin';
import MetaCallback from '@/pages/meta/MetaCallback';
import Dashboard from '@/pages/Dashboard';
import Templates from '@/pages/Templates';
import Contacts from '@/pages/Contacts';
import Broadcast from '@/pages/Broadcast';
import Chat from '@/pages/Chat';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'signup',
        element: <Signup />,
      },
    ],
  },
  {
    path: '/meta',
    element: <ProtectedRoute />,
    children: [
      {
        path: 'login',
        element: <MetaLogin />,
      },
      {
        path: 'callback',
        element: <MetaCallback />,
      },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'templates',
        element: <MetaProtectedRoute><Templates /></MetaProtectedRoute>,
      },
      {
        path: 'contacts',
        element: <MetaProtectedRoute><Contacts /></MetaProtectedRoute>,
      },
      {
        path: 'broadcast',
        element: <MetaProtectedRoute><Broadcast /></MetaProtectedRoute>,
      },
      {
        path: 'chat',
        element: <MetaProtectedRoute><Chat /></MetaProtectedRoute>,
      },
    ],
  },
]);
```

### 6.2 Protected Route Component

```typescript
// /components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};
```

### 6.3 Meta Protected Route Component

```typescript
// /components/MetaProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const MetaProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isMetaConnected } = useAuth();
  
  if (!isMetaConnected) {
    // Show locked state or redirect
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};
```

---

## Part 7: Implementation Instructions for Code Generation

### 7.1 Development Order

Generate components in this order to maintain dependencies:

1. **Base UI Components** (`/components/ui`)
   - Button, Input, Card, Chip, Modal, Table, Spinner, Toast

2. **Layout Components** (`/components/layout`)
   - Sidebar, PageHeader, EmptyState, ErrorState, LoadingState

3. **Auth Pages** (`/pages/auth`)
   - Login, Signup

4. **Meta OAuth Pages** (`/pages/meta`)
   - MetaLogin (with Facebook SDK integration), MetaCallback

5. **Dashboard Page** (`/pages/Dashboard.tsx`)
   - Show both connected and locked states

6. **Templates Page** (`/pages/Templates.tsx`)
   - List view, create modal, preview panel

7. **Contacts Page** (`/pages/Contacts.tsx`)
   - Table view, CSV upload modal, manual add

8. **Broadcast Page** (`/pages/Broadcast.tsx`)
   - Multi-step wizard (template → contacts → preview → send)

9. **Chat Page** (`/pages/Chat.tsx`)
   - Three-column layout with WebSocket integration

### 7.2 Per-Page Generation Prompt Template

When generating each page, use this structure:

```
I'm building the Connecte WhatsApp Business platform frontend.

Context:
- PRD: [Attach CONNECTE_FRONTEND_PRD.md]
- Design: [Attach Stitch design screenshots for this page]
- Architecture: [Reference sections from this Implementation Guide]

Generate React + TypeScript code for: **[PAGE_NAME]**

Requirements:
1. Match the Stitch design exactly (layout, colors, spacing, typography)
2. Use Zustand stores as defined in the architecture
3. Use API services from /services
4. Apply Capitol Lean design system (0px radius, color tokens, typography scales)
5. Include all UI states: loading, error, empty, success
6. Use Tailwind CSS with custom configuration
7. Follow component architecture patterns
8. Implement form validation where needed
9. Handle API errors with toast notifications
10. Use TypeScript with proper type definitions

File to generate: /pages/[PageName].tsx

Additional components needed (generate these too):
- [List any specific feature components for this page]

Start with the main page component, then generate supporting components.
```

### 7.3 Component Generation Checklist

For each component, ensure:

- ✅ TypeScript types defined
- ✅ Proper imports (React, Zustand, services, UI components)
- ✅ State management using hooks
- ✅ API integration with error handling
- ✅ Loading state while fetching data
- ✅ Error state with retry option
- ✅ Empty state when no data
- ✅ Success state with data display
- ✅ Form validation (if applicable)
- ✅ Capitol Lean styling (0px radius, correct colors)
- ✅ Responsive layout (mobile considerations)
- ✅ Accessibility (focus states, ARIA labels)

---

## Part 8: Testing Strategy

### 8.1 Manual Testing Checklist

After generating each page:

1. **Visual Testing**
   - Compare with Stitch design
   - Check all spacing matches design system
   - Verify 0px border-radius everywhere
   - Confirm color tokens are correct

2. **Functional Testing**
   - Test all user interactions
   - Verify API calls with network tab
   - Check form validation
   - Test error scenarios (network failure, 401, etc.)

3. **State Testing**
   - Verify Zustand store updates
   - Check sessionStorage for token
   - Test route protection (try accessing without auth)

4. **Edge Cases**
   - Empty states render correctly
   - Long text doesn't break layout
   - Large datasets paginate properly
   - WebSocket reconnection works

### 8.2 Integration Testing

Test complete flows:

1. **Auth Flow**
   - Signup → Login → Token storage → Dashboard

2. **Meta OAuth Flow**
   - Login → Meta Login → Facebook popup → Callback → Dashboard (connected state)

3. **Template Flow**
   - Templates page → Create template → Submit → See pending status

4. **Contact Flow**
   - Contacts page → Upload CSV → See contacts in table

5. **Broadcast Flow**
   - Broadcast → Select template → Select contacts → Preview → Send → WebSocket status updates

6. **Chat Flow**
   - Chat page → Select conversation → Send message → Receive reply (via WebSocket)

---

## Part 9: Deployment Preparation

### 9.1 Environment Variables

Create `.env` file:

```env
VITE_API_BASE_URL=https://app.connecte.in/api
VITE_WS_URL=wss://app.connecte.in
VITE_META_APP_ID=your_meta_app_id
VITE_META_CONFIG_ID=your_meta_config_id
VITE_META_API_VERSION=v21.0
```

### 9.2 Build Configuration

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
})
```

### 9.3 Build Command

```bash
npm run build
```

---

## Appendix: Quick Reference

### Color Classes (Tailwind)
```css
bg-surface           /* #F9F9F9 */
bg-surface-low       /* #F3F3F3 */
bg-surface-container /* #FFFFFF */
bg-primary           /* #006D2F */
bg-primary-container /* #25D366 */
text-on-surface      /* #1B1B1B */
text-on-primary      /* #FFFFFF */
```

### Typography Classes
```css
text-display-lg      /* 3.5rem */
text-headline-lg     /* 2rem */
text-body-lg         /* 1rem */
text-label-md        /* 0.75rem, uppercase */
```

### Spacing Classes
```css
p-4    /* 16px padding */
p-6    /* 32px padding */
gap-6  /* 32px gap between items */
```

---

**End of Implementation Guide**

Use this document alongside the PRD and Stitch designs to generate production-ready React code, one page at a time.
