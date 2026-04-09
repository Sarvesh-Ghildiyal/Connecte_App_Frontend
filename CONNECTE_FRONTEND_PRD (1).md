# Connecte Frontend - Product Requirements Document (PRD)

## Document Version
- **Version:** 1.0
- **Last Updated:** March 29, 2026
- **Status:** MVP Specification

---

## 1. Executive Overview

### 1.1 Product Vision
Connecte is a WhatsApp Business SaaS platform targeting Indian SMBs who have outgrown the free WhatsApp Business app. The platform enables businesses to manage message templates, contacts, and broadcast messaging at scale through the Meta Cloud API.

### 1.2 Target Users
- Indian SMB owners and marketing teams
- Businesses requiring bulk WhatsApp messaging capabilities
- Companies needing template-based messaging outside the 24-hour service window

### 1.3 Core Value Proposition
- 11% markup on Meta's API charges (1.11x multiplier)
- Simplified WhatsApp Business API access without BSP complexity
- Real-time chat interface with broadcast capabilities

---

## 2. Technical Stack

### 2.1 Frontend Technologies
```
Framework:        React 18+ with Vite
Routing:          React Router v6
State Management: Zustand
HTTP Client:      Axios
Real-time:        Native WebSocket API
Styling:          TailwindCSS
UI Components:    Shadcn/ui (customized)
Language:         TypeScript
```

### 2.2 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 2.3 Environment Variables
```env
VITE_API_BASE_URL=https://app.connecte.in/api
VITE_WS_URL=wss://app.connecte.in
VITE_META_APP_ID=your_meta_app_id
VITE_META_CONFIG_ID=your_meta_config_id
VITE_META_API_VERSION=v21.0
```

---

## 3. Design System Integration

### 3.1 Capitol Lean Principles
The UI follows "The Precision Ledger" design philosophy:
- **0px border-radius** on ALL elements (buttons, inputs, cards, modals, avatars)
- **No 1px borders** for sectioning - use background color shifts only
- **High contrast:** Pure black (#1B1B1B) text on off-white (#F9F9F9) backgrounds
- **Surgical green usage:** #25D366 (WhatsApp Green) as accent only, not theme color
- **Editorial typography:** Massive display scales with tight body text
- **Radical whitespace:** 1.4rem minimum spacing between major sections

### 3.2 Color Tokens
```css
/* Surface Hierarchy */
--surface: #F9F9F9;                    /* Level 0 - Base */
--surface-container-low: #F3F3F3;      /* Level 1 - Sections */
--surface-container-lowest: #FFFFFF;   /* Level 2 - Cards/Active */
--surface-container-high: #E8E8E8;     /* Subtle backgrounds */
--surface-container-highest: #E2E2E2;  /* Input backgrounds */

/* Primary Palette */
--primary: #006D2F;                    /* WhatsApp Dark Green */
--primary-container: #25D366;          /* WhatsApp Green */
--on-primary: #FFFFFF;                 /* Text on primary */
--on-primary-container: #1B1B1B;       /* Text on green */

/* Secondary Palette */
--secondary-container: #E2E2E2;        /* Secondary buttons */
--on-secondary-fixed: #1B1B1B;         /* Text on secondary */

/* Text & Borders */
--on-surface: #1B1B1B;                 /* Pure black text */
--on-background: #1B1B1B;              /* Body text */
--outline-variant: #BBCBB9;            /* Ghost borders (15% opacity) */
```

### 3.3 Typography Scale
```css
/* Display - Dashboard summaries, hero headers */
--display-lg: 3.5rem;    /* 56px - Massive impact numbers */
--display-md: 2.875rem;  /* 46px */

/* Headline - Section titles */
--headline-lg: 2rem;     /* 32px - Letter-spacing: -0.02em */
--headline-md: 1.75rem;  /* 28px */

/* Title - Card headers, modal titles */
--title-lg: 1.5rem;      /* 24px */
--title-md: 1rem;        /* 16px - Used for input text */

/* Body - Message content, descriptions */
--body-lg: 1rem;         /* 16px - Primary content */
--body-md: 0.875rem;     /* 14px */

/* Label - Metadata, tags, timestamps */
--label-md: 0.75rem;     /* 12px - ALL CAPS, +0.05em tracking */
--label-sm: 0.6875rem;   /* 11px */
```

### 3.4 Spacing Scale
```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.5rem;    /* 24px */
--spacing-6: 2rem;      /* 32px - Thread separation */
--spacing-8: 3rem;      /* 48px */
--spacing-10: 4rem;     /* 64px */
```

### 3.5 Component Specifications

#### Buttons
```css
/* Primary Button */
background: linear-gradient(45deg, #006D2F, #25D366);
color: #FFFFFF;
border-radius: 0px;
padding: 0.75rem 1.5rem;
font-size: var(--body-lg);
font-weight: 600;

/* Hover State */
background: #25D366;
color: #1B1B1B;
```

#### Input Fields
```css
background: #E2E2E2;
border: none;
border-bottom: 2px solid transparent;
border-radius: 0px;
padding: 0.75rem 1rem;
font-size: var(--title-md);

/* Focus State */
border-bottom-color: #006D2F;
outline: none;
```

#### Cards
```css
background: #FFFFFF;
border-radius: 0px;
padding: 2rem;
box-shadow: none; /* Use color shift for depth */
```

#### Chips/Tags
```css
background: #E2E2E2;
color: #1B1B1B;
border-radius: 0px;
padding: 0.25rem 0.75rem;
font-size: var(--label-sm);
text-transform: uppercase;
letter-spacing: 0.05em;
```

---

## 4. Application Architecture

### 4.1 Route Structure
```
PUBLIC ROUTES
├── /auth/login          - User login page
└── /auth/signup         - User registration page

META ONBOARDING ROUTES (Protected)
├── /meta/login          - Meta OAuth initiation page
└── /meta/callback       - Meta OAuth callback handler

PROTECTED ROUTES (Requires Auth + Meta Connection)
├── /dashboard           - Overview with feature cards
├── /templates           - Template management
├── /contacts            - Contact/phone number management
├── /broadcast           - Message broadcasting interface
└── /chat                - Real-time WhatsApp chat interface
```

### 4.2 Route Protection Logic
```typescript
// Authentication Status Check
if (!token) → redirect to /auth/login

// Meta Connection Check (for protected features)
if (token && !isMetaConnected) {
  - Show locked state UI
  - Display "Connect Meta" button
  - Redirect to /meta/login on action
}

// 401 Response Handling
if (response.status === 401) {
  - Clear sessionStorage
  - Set isAuthenticated = false
  - Redirect to /auth/login
}
```

### 4.3 Folder Structure
```
/src
  /app
    router.tsx              - Route configuration
    App.tsx                 - Root component
  
  /pages
    /auth
      Login.tsx             - Login page component
      Signup.tsx            - Signup page component
    /meta
      MetaLogin.tsx         - Meta OAuth initiation
      MetaCallback.tsx      - Meta OAuth callback handler
    Dashboard.tsx           - Dashboard overview
    Templates.tsx           - Template management
    Contacts.tsx            - Contact management
    Broadcast.tsx           - Broadcast messaging
    Chat.tsx                - Real-time chat interface
  
  /components
    /ui
      Button.tsx            - Base button component
      Input.tsx             - Base input component
      Modal.tsx             - Modal/dialog component
      Table.tsx             - Table component
      Card.tsx              - Card component
      Chip.tsx              - Tag/chip component
      Spinner.tsx           - Loading spinner
      Toast.tsx             - Toast notification
    /layout
      Sidebar.tsx           - Navigation sidebar
      Navbar.tsx            - Top navigation bar
      PageHeader.tsx        - Page header component
    /chat
      ChatList.tsx          - Conversation list
      ChatWindow.tsx        - Message display area
      MessageBubble.tsx     - Individual message
      MessageInput.tsx      - Message composition
    /templates
      TemplateCard.tsx      - Template preview card
      TemplateForm.tsx      - Template creation form
      TemplatePreview.tsx   - Live template preview
    /contacts
      ContactTable.tsx      - Contact list table
      ContactUpload.tsx     - CSV upload component
      ContactForm.tsx       - Manual contact addition
    /broadcast
      TemplateSelector.tsx  - Template selection step
      ContactSelector.tsx   - Contact selection step
      MessagePreview.tsx    - Broadcast preview step
  
  /hooks
    useAuth.ts              - Authentication logic
    useTemplates.ts         - Template CRUD operations
    useContacts.ts          - Contact CRUD operations
    useBroadcast.ts         - Broadcast message sending
    useChat.ts              - Chat message handling
    useWebSocket.ts         - WebSocket connection management
    useMetaOAuth.ts         - Meta OAuth flow handling
  
  /store
    authStore.ts            - Auth state (Zustand)
    appStore.ts             - Global app state (Zustand)
    chatStore.ts            - Chat messages state (Zustand)
  
  /services
    api.ts                  - Axios instance + interceptors
    auth.ts                 - Auth API calls
    templates.ts            - Template API calls
    contacts.ts             - Contact API calls
    broadcast.ts            - Broadcast API calls
    chat.ts                 - Chat API calls
    meta.ts                 - Meta OAuth API calls
  
  /utils
    csvParser.ts            - CSV parsing utilities
    validators.ts           - Form validation functions
    formatters.ts           - Phone number, date formatters
    constants.ts            - App constants
  
  /types
    index.ts                - TypeScript type definitions
    api.ts                  - API request/response types
    meta.ts                 - Meta API types
```

---

## 5. Authentication & Authorization

### 5.1 User Authentication Flow

#### Sign Up
**Endpoint:** `POST /auth/sign_up`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User Created Successfully",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2026-03-29T10:30:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "detail": "Email already registered"
}
```

#### Login
**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Response (401):**
```json
{
  "detail": "Invalid credentials"
}
```

### 5.2 Token Management

#### Storage Strategy
- **Location:** sessionStorage (cleared on browser close)
- **Key:** `connecte_auth_token`
- **Format:** JWT string

#### Token Structure (Decoded)
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "exp": 1743242400,
  "iat": 1743199200
}
```

#### Token Expiration
- **Duration:** 12 hours
- **Handling:** Frontend checks `exp` claim, redirects to login if expired
- **Backend:** Returns 401 for expired/invalid tokens

#### Axios Interceptor
```typescript
// Request Interceptor
axios.interceptors.request.use(config => {
  const token = sessionStorage.getItem('connecte_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('connecte_auth_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 6. Meta OAuth Integration

### 6.1 Meta Embedded Signup Flow

#### Overview
Connecte uses the **Tech Provider** model (not BSP/Solution Partner). Clients connect their WhatsApp Business Accounts (WABA) via Meta's Embedded Signup, and Connecte stores per-client System User tokens for API calls.

#### Flow Diagram
```
User clicks "Connect WhatsApp"
        ↓
Frontend loads Facebook SDK
        ↓
FB.login() launches Embedded Signup popup
        ↓
User completes Meta OAuth in popup
        ↓
Meta returns response to window.postMessage
        ↓
Frontend captures response data
        ↓
Frontend sends data to backend /meta/callback
        ↓
Backend exchanges code for access_token
        ↓
Backend stores WABA credentials in DB
        ↓
Backend returns success response
        ↓
Frontend updates state: isMetaConnected = true
```

### 6.2 Frontend Implementation

#### Facebook SDK Integration
**Location:** `/meta/login` page

```html
<!-- SDK Loading -->
<script async defer crossorigin="anonymous" 
  src="https://connect.facebook.net/en_US/sdk.js">
</script>

<script>
  // SDK Initialization
  window.fbAsyncInit = function() {
    FB.init({
      appId: '<APP_ID>',           // From VITE_META_APP_ID
      autoLogAppEvents: true,
      xfbml: true,
      version: '<GRAPH_API_VERSION>' // From VITE_META_API_VERSION (v21.0)
    });
  };

  // Session Logging Message Event Listener
  window.addEventListener('message', (event) => {
    if (!event.origin.endsWith('facebook.com')) return;
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'WA_EMBEDDED_SIGNUP') {
        console.log('Meta Embedded Signup Response:', data);
        // Handle response (see below)
      }
    } catch {
      console.log('Non-JSON message:', event.data);
    }
  });

  // Response Callback
  const fbLoginCallback = (response) => {
    if (response.authResponse) {
      const code = response.authResponse.code;
      console.log('Authorization code:', code);
      // Send to backend (see API section)
    } else {
      console.error('Meta OAuth failed:', response);
    }
  }

  // Launch Method
  const launchWhatsAppSignup = () => {
    FB.login(fbLoginCallback, {
      config_id: '<CONFIGURATION_ID>',  // From VITE_META_CONFIG_ID
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        setup: {},
      }
    });
  }
</script>
```

#### Meta Response Format
```javascript
// Success Response (WA_EMBEDDED_SIGNUP event)
{
  data: {
    phone_number_id: 'customer-phone-number-id',
    waba_id: 'customer-waba-id',
    business_id: 'customer-business-portfolio-id',
    
    // Optional fields (only if customer selected them)
    ad_account_ids: ['ad-account-id-1', 'ad-account-id-2'],
    page_ids: ['page-id-1', 'page-id-2'],
    dataset_ids: ['dataset-id-1'],
    catalog_ids: ['catalog-id-1'],
    instagram_account_ids: ['ig-account-id-1'],
    waba_ids: ['waba-id-1', 'waba-id-2']  // Multi-WABA flows only
  },
  type: 'WA_EMBEDDED_SIGNUP',
  event: 'FINISH_TYPE',  // 'finish', 'cancel', 'error'
}

// Authorization Code Response (fbLoginCallback)
{
  authResponse: {
    code: 'exchangeable-authorization-code',
    // ... other fields
  }
}
```

### 6.3 Backend Integration

#### Send Meta Data to Backend
**Endpoint:** `POST /meta/callback`

**Request:**
```json
{
  "code": "exchangeable-authorization-code",
  "waba_id": "customer-waba-id",
  "phone_number_id": "customer-phone-number-id",
  "business_id": "customer-business-portfolio-id"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "WhatsApp Business Account connected successfully",
  "waba_id": "customer-waba-id",
  "phone_number_id": "customer-phone-number-id"
}
```

**Error Response (400):**
```json
{
  "detail": "Failed to exchange authorization code"
}
```

**Backend Responsibilities:**
1. Exchange `code` for Business Access Token via Meta API
2. Store access token, WABA ID, phone number ID in database
3. Register phone number for Cloud API use
4. Subscribe to webhooks on customer's WABA
5. Return success confirmation to frontend

#### Check Meta Connection Status
**Endpoint:** `GET /meta/status`

**Response (200):**
```json
{
  "is_connected": true,
  "waba_id": "customer-waba-id",
  "phone_number_id": "customer-phone-number-id",
  "connected_at": "2026-03-29T10:30:00Z"
}
```

### 6.4 Meta OAuth Valid Redirect URIs
Configure in Meta App Settings:
```
https://app.connecte.in/meta/callback
https://localhost:8000/meta/callback  (for development)
```

---

## 7. Feature Specifications

### 7.1 Dashboard Page

#### Purpose
- Overview of account status
- Quick access to all features
- Meta connection status indicator
- Basic metrics (future phase)

#### UI Layout
```
┌─────────────────────────────────────────────────┐
│  CONNECTE DASHBOARD                             │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Meta Connection Status Card]                  │
│  ✓ Connected to WhatsApp Business               │
│  WABA ID: xxx-xxx-xxx                           │
│  Phone: +91 98765 43210                         │
│                                                 │
│  ┌─────────────┐  ┌─────────────┐              │
│  │ 📋 TEMPLATES │  │ 📞 CONTACTS │              │
│  │             │  │             │              │
│  │ Manage your │  │ Upload and  │              │
│  │ message     │  │ manage your │              │
│  │ templates   │  │ phone list  │              │
│  │             │  │             │              │
│  │ [Go to      │  │ [Go to      │              │
│  │  Templates] │  │  Contacts]  │              │
│  └─────────────┘  └─────────────┘              │
│                                                 │
│  ┌─────────────┐  ┌─────────────┐              │
│  │ 📢 BROADCAST│  │ 💬 CHAT     │              │
│  │             │  │             │              │
│  │ Send bulk   │  │ Real-time   │              │
│  │ messages to │  │ WhatsApp    │              │
│  │ contacts    │  │ messaging   │              │
│  │             │  │             │              │
│  │ [Go to      │  │ [Go to      │              │
│  │  Broadcast] │  │  Chat]      │              │
│  └─────────────┘  └─────────────┘              │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Locked State (No Meta Connection)
```
┌─────────────────────────────────────────────────┐
│  CONNECTE DASHBOARD                             │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Meta Connection Status Card]                  │
│  ⚠️ Not Connected to WhatsApp Business          │
│  [Connect WhatsApp Business] ← Button           │
│                                                 │
│  ┌─────────────┐  ┌─────────────┐              │
│  │ 🔒 TEMPLATES│  │ 🔒 CONTACTS │  (Grayed out) │
│  │  (Locked)   │  │  (Locked)   │              │
│  │             │  │             │              │
│  │ Manage your │  │ Upload and  │              │
│  │ message     │  │ manage your │              │
│  │ templates   │  │ phone list  │              │
│  │             │  │             │              │
│  │ [Connect    │  │ [Connect    │              │
│  │  Meta]      │  │  Meta]      │              │
│  └─────────────┘  └─────────────┘              │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Hover Tooltip on Locked Cards:**
"Connect your WhatsApp Business Account to unlock this feature"

---

### 7.2 Templates Page

#### Purpose
- View approved/pending Meta message templates
- Create new templates via UI
- Select templates for broadcasting

#### Meta API Reference
- **Create Template:** https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates/create
- **Fetch Templates:** https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates#retrieve-templates
- **Delete Template:** https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates#delete-templates

#### Backend Endpoints

##### Get All Templates
**Endpoint:** `GET /templates`

**Response (200):**
```json
{
  "templates": [
    {
      "id": "template-id-1",
      "name": "order_confirmation",
      "language": "en_US",
      "category": "UTILITY",
      "status": "APPROVED",
      "components": [
        {
          "type": "HEADER",
          "format": "TEXT",
          "text": "Order Confirmed"
        },
        {
          "type": "BODY",
          "text": "Hi {{1}}, your order #{{2}} has been confirmed. Thank you!"
        },
        {
          "type": "FOOTER",
          "text": "Reply STOP to unsubscribe"
        }
      ],
      "created_at": "2026-03-15T10:30:00Z"
    },
    {
      "id": "template-id-2",
      "name": "promotional_offer",
      "language": "en_US",
      "category": "MARKETING",
      "status": "PENDING",
      "components": [...],
      "created_at": "2026-03-20T14:00:00Z"
    }
  ]
}
```

##### Create New Template
**Endpoint:** `POST /templates`

**Request:**
```json
{
  "name": "welcome_message",
  "language": "en_US",
  "category": "UTILITY",
  "components": [
    {
      "type": "HEADER",
      "format": "TEXT",
      "text": "Welcome to Connecte!"
    },
    {
      "type": "BODY",
      "text": "Hello {{1}}, thank you for signing up. We're excited to have you!"
    },
    {
      "type": "FOOTER",
      "text": "Powered by Connecte"
    }
  ]
}
```

**Response (201):**
```json
{
  "id": "new-template-id",
  "name": "welcome_message",
  "status": "PENDING",
  "message": "Template submitted for Meta approval"
}
```

**Error Response (400):**
```json
{
  "detail": "Template name already exists"
}
```

##### Delete Template
**Endpoint:** `DELETE /templates/{template_id}`

**Response (200):**
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

#### Template Categories
Meta supports 3 categories:
1. **MARKETING** - Promotional content, offers, announcements
2. **UTILITY** - Account updates, order confirmations, reminders
3. **AUTHENTICATION** - OTP codes, verification messages

#### Template Component Types
```typescript
// Header (Optional)
{
  type: "HEADER",
  format: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT",
  text?: string,           // For TEXT format
  example?: {              // For media formats
    header_handle: ["https://example.com/image.jpg"]
  }
}

// Body (Required)
{
  type: "BODY",
  text: string,            // Supports variables: {{1}}, {{2}}, etc.
  example?: {              // Required if variables present
    body_text: [["John", "12345"]]
  }
}

// Footer (Optional)
{
  type: "FOOTER",
  text: string             // Max 60 characters, no variables
}

// Buttons (Optional)
{
  type: "BUTTONS",
  buttons: [
    {
      type: "QUICK_REPLY",
      text: "Yes"
    },
    {
      type: "URL",
      text: "Visit Website",
      url: "https://example.com"
    },
    {
      type: "PHONE_NUMBER",
      text: "Call Us",
      phone_number: "+919876543210"
    }
  ]
}
```

#### UI Layout
```
┌─────────────────────────────────────────────────┐
│  TEMPLATES                      [Create New +]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Marketing] [Utility] [Authentication]  ← Tabs │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Template Name         Category  Status  │   │
│  ├─────────────────────────────────────────┤   │
│  │ order_confirmation    UTILITY   ✓       │   │
│  │ promotional_offer     MARKETING ⏳      │   │
│  │ otp_verification      AUTH      ✓       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Template Preview Panel]                       │
│  ┌─────────────────────────────────────────┐   │
│  │  ORDER CONFIRMED                        │   │
│  │                                         │   │
│  │  Hi John, your order #12345 has been   │   │
│  │  confirmed. Thank you!                  │   │
│  │                                         │   │
│  │  Reply STOP to unsubscribe              │   │
│  │                                         │   │
│  │  [Send Message] [Edit] [Delete]         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Template Creation Modal
Opens when "Create New +" is clicked:
```
┌─────────────────────────────────────────────────┐
│  CREATE NEW TEMPLATE                      [×]   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Template Name *                                │
│  [___________________________________]          │
│                                                 │
│  Language *                                     │
│  [English (US) ▼]                               │
│                                                 │
│  Category *                                     │
│  ( ) Marketing  (•) Utility  ( ) Authentication │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ HEADER (Optional)                       │   │
│  │ [Text ▼]                                │   │
│  │ [___________________________________]   │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ BODY *                                  │   │
│  │ [_________________________________]     │   │
│  │ [_________________________________]     │   │
│  │                                         │   │
│  │ Use {{1}}, {{2}} for variables          │   │
│  │ [+ Add Variable]                        │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ FOOTER (Optional)                       │   │
│  │ [___________________________________]   │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Preview ▼]                                    │
│                                                 │
│  [Cancel]              [Submit for Approval]    │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### 7.3 Contacts Page

#### Purpose
- Upload phone numbers via CSV
- Manually add contacts
- Tag/group contacts
- View contact list

#### Backend Endpoints

##### Get All Contacts
**Endpoint:** `GET /contacts`

**Query Parameters:**
- `tag` (optional) - Filter by tag
- `limit` (optional) - Pagination limit (default: 50)
- `offset` (optional) - Pagination offset

**Response (200):**
```json
{
  "contacts": [
    {
      "id": "contact-uuid-1",
      "phone_number": "919876543210",
      "name": "John Doe",
      "tags": ["customer", "vip"],
      "created_at": "2026-03-20T10:00:00Z"
    },
    {
      "id": "contact-uuid-2",
      "phone_number": "918765432109",
      "name": "Jane Smith",
      "tags": ["lead"],
      "created_at": "2026-03-21T14:30:00Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

##### Upload Contacts (CSV)
**Endpoint:** `POST /contacts/bulk`

**Request:**
```json
{
  "contacts": [
    {
      "phone_number": "919876543210",
      "name": "John Doe",
      "tags": ["customer", "vip"]
    },
    {
      "phone_number": "918765432109",
      "name": "Jane Smith",
      "tags": ["lead"]
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "imported": 2,
  "duplicates": 0,
  "errors": []
}
```

**Error Response (400):**
```json
{
  "detail": "Invalid phone number format",
  "errors": [
    {
      "row": 3,
      "phone_number": "123456",
      "error": "Invalid format"
    }
  ]
}
```

##### Add Single Contact
**Endpoint:** `POST /contacts`

**Request:**
```json
{
  "phone_number": "919876543210",
  "name": "John Doe",
  "tags": ["customer"]
}
```

**Response (201):**
```json
{
  "id": "contact-uuid",
  "phone_number": "919876543210",
  "name": "John Doe",
  "tags": ["customer"]
}
```

##### Update Contact
**Endpoint:** `PUT /contacts/{contact_id}`

**Request:**
```json
{
  "name": "John Doe Updated",
  "tags": ["customer", "vip", "premium"]
}
```

##### Delete Contact
**Endpoint:** `DELETE /contacts/{contact_id}`

**Response (200):**
```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

#### CSV Format
```csv
phone_number,name,tags
919876543210,John Doe,customer;vip
918765432109,Jane Smith,lead
917654321098,Bob Johnson,customer;repeat
```

**Rules:**
- `phone_number` - Required, must include country code (91 for India)
- `name` - Optional
- `tags` - Optional, semicolon-separated

#### Frontend CSV Parsing
```typescript
// Frontend parses CSV to JSON before sending to backend
const parseCSV = (csvText: string) => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      phone_number: values[0],
      name: values[1] || '',
      tags: values[2] ? values[2].split(';') : []
    };
  });
};
```

#### UI Layout
```
┌─────────────────────────────────────────────────┐
│  CONTACTS                 [Upload CSV] [Add +]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Search contacts...]       [All Tags ▼]        │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Name          Phone          Tags       │   │
│  ├─────────────────────────────────────────┤   │
│  │ John Doe      +91 98765...  [customer]  │   │
│  │                             [vip]        │   │
│  │ Jane Smith    +91 87654...  [lead]      │   │
│  │ Bob Johnson   +91 76543...  [customer]  │   │
│  │                             [repeat]     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Showing 1-50 of 150          [← 1 2 3 4 →]    │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### CSV Upload Modal
```
┌─────────────────────────────────────────────────┐
│  UPLOAD CONTACTS                          [×]   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │                                         │   │
│  │         📁 Drag & drop CSV here         │   │
│  │              or click to browse         │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  CSV Format:                                    │
│  phone_number,name,tags                         │
│  919876543210,John Doe,customer;vip             │
│                                                 │
│  [Download Sample CSV]                          │
│                                                 │
│  [Cancel]                        [Upload]       │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### 7.4 Broadcast Page

#### Purpose
- Select template
- Select contacts
- Preview message with variable substitution
- Send broadcast

#### Backend Endpoint

##### Send Broadcast
**Endpoint:** `POST /broadcast`

**Request:**
```json
{
  "template_id": "template-uuid",
  "contact_ids": ["contact-uuid-1", "contact-uuid-2"],
  "variables": {
    "1": "John",        // {{1}} in template
    "2": "12345"        // {{2}} in template
  }
}
```

**Response (202 Accepted):**
```json
{
  "broadcast_id": "broadcast-uuid",
  "status": "queued",
  "total_recipients": 2,
  "message": "Broadcast queued for processing"
}
```

**Error Response (400):**
```json
{
  "detail": "Template not approved"
}
```

#### Broadcast Status (via WebSocket)
Backend sends real-time updates as messages are sent:
```json
{
  "type": "broadcast_update",
  "broadcast_id": "broadcast-uuid",
  "sent": 150,
  "total": 200,
  "failed": 5
}
```

#### UI Flow - Multi-Step Process

##### Step 1: Select Template
```
┌─────────────────────────────────────────────────┐
│  BROADCAST MESSAGE                       [×]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  STEP 1 OF 3: SELECT TEMPLATE                   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ (•) order_confirmation      [UTILITY]   │   │
│  │     Hi {{1}}, your order #{{2}}...      │   │
│  ├─────────────────────────────────────────┤   │
│  │ ( ) promotional_offer       [MARKETING] │   │
│  │     Special offer just for you...       │   │
│  ├─────────────────────────────────────────┤   │
│  │ ( ) otp_verification        [AUTH]      │   │
│  │     Your OTP is {{1}}. Valid...         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Cancel]                            [Next →]   │
│                                                 │
└─────────────────────────────────────────────────┘
```

##### Step 2: Select Contacts
```
┌─────────────────────────────────────────────────┐
│  BROADCAST MESSAGE                       [×]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  STEP 2 OF 3: SELECT CONTACTS                   │
│                                                 │
│  [Search...]         [All Tags ▼]  [Select All] │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ [✓] John Doe       +91 98765...         │   │
│  │ [✓] Jane Smith     +91 87654...         │   │
│  │ [ ] Bob Johnson    +91 76543...         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Selected: 2 contacts                           │
│                                                 │
│  [← Back]                            [Next →]   │
│                                                 │
└─────────────────────────────────────────────────┘
```

##### Step 3: Preview & Send
```
┌─────────────────────────────────────────────────┐
│  BROADCAST MESSAGE                       [×]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  STEP 3 OF 3: PREVIEW & SEND                    │
│                                                 │
│  Template: order_confirmation                   │
│  Recipients: 2 contacts                         │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ PREVIEW                                 │   │
│  │                                         │   │
│  │ ORDER CONFIRMED                         │   │
│  │                                         │   │
│  │ Hi John, your order #12345 has been    │   │
│  │ confirmed. Thank you!                   │   │
│  │                                         │   │
│  │ Reply STOP to unsubscribe               │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Variable Values:                               │
│  {{1}}: [John____]                              │
│  {{2}}: [12345___]                              │
│                                                 │
│  [← Back]                      [Send Broadcast] │
│                                                 │
└─────────────────────────────────────────────────┘
```

##### Step 4: Sending Progress (WebSocket Updates)
```
┌─────────────────────────────────────────────────┐
│  BROADCAST MESSAGE                       [×]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  SENDING...                                     │
│                                                 │
│  ████████████████░░░░░░░░░░ 75%                 │
│                                                 │
│  Sent: 150 / 200                                │
│  Failed: 5                                      │
│                                                 │
│  [View Details]                     [Close]     │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### 7.5 Chat Page

#### Purpose
- Real-time WhatsApp messaging interface
- View conversation history
- Send/receive messages
- WhatsApp Web-like experience

#### Meta API Reference
- **Send Message:** https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages
- **Webhooks:** https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components

#### Backend Endpoints

##### Get Conversations
**Endpoint:** `GET /chat/conversations`

**Response (200):**
```json
{
  "conversations": [
    {
      "id": "conversation-uuid-1",
      "contact_name": "John Doe",
      "contact_phone": "919876543210",
      "last_message": "Thank you for your order!",
      "last_message_time": "2026-03-29T15:30:00Z",
      "unread_count": 2
    },
    {
      "id": "conversation-uuid-2",
      "contact_name": "Jane Smith",
      "contact_phone": "918765432109",
      "last_message": "When will my order arrive?",
      "last_message_time": "2026-03-29T14:20:00Z",
      "unread_count": 0
    }
  ]
}
```

##### Get Conversation Messages
**Endpoint:** `GET /chat/conversations/{conversation_id}/messages`

**Query Parameters:**
- `limit` (optional) - Default: 50
- `offset` (optional) - For pagination

**Response (200):**
```json
{
  "messages": [
    {
      "id": "message-uuid-1",
      "conversation_id": "conversation-uuid-1",
      "from": "919876543210",
      "to": "business-phone-number",
      "type": "text",
      "text": "Hi, I'd like to place an order",
      "timestamp": "2026-03-29T15:25:00Z",
      "status": "delivered",
      "direction": "inbound"
    },
    {
      "id": "message-uuid-2",
      "conversation_id": "conversation-uuid-1",
      "from": "business-phone-number",
      "to": "919876543210",
      "type": "text",
      "text": "Sure! What would you like to order?",
      "timestamp": "2026-03-29T15:26:00Z",
      "status": "read",
      "direction": "outbound"
    }
  ],
  "total": 25,
  "limit": 50,
  "offset": 0
}
```

##### Send Message
**Endpoint:** `POST /chat/send`

**Request:**
```json
{
  "conversation_id": "conversation-uuid",
  "recipient_phone": "919876543210",
  "type": "text",
  "text": "Thank you for your order!"
}
```

**Request (Template Message):**
```json
{
  "conversation_id": "conversation-uuid",
  "recipient_phone": "919876543210",
  "type": "template",
  "template_name": "order_confirmation",
  "language_code": "en_US",
  "variables": ["John", "12345"]
}
```

**Response (202 Accepted):**
```json
{
  "message_id": "message-uuid",
  "status": "queued",
  "timestamp": "2026-03-29T15:30:00Z"
}
```

#### WebSocket Connection

##### Connection
**URL:** `wss://app.connecte.in/chat/ws?token=<jwt_token>`

**Authentication:**
```javascript
const token = sessionStorage.getItem('connecte_auth_token');
const ws = new WebSocket(`wss://app.connecte.in/chat/ws?token=${token}`);
```

##### Message Format - Incoming Messages
```json
{
  "type": "new_message",
  "data": {
    "id": "message-uuid",
    "conversation_id": "conversation-uuid",
    "from": "919876543210",
    "to": "business-phone-number",
    "type": "text",
    "text": "Hello!",
    "timestamp": "2026-03-29T15:30:00Z",
    "direction": "inbound"
  }
}
```

##### Message Format - Status Updates
```json
{
  "type": "message_status",
  "data": {
    "message_id": "message-uuid",
    "status": "delivered",  // sent | delivered | read
    "timestamp": "2026-03-29T15:30:05Z"
  }
}
```

##### Reconnection Strategy
```javascript
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

ws.onclose = () => {
  if (reconnectAttempts < maxReconnectAttempts) {
    setTimeout(() => {
      reconnectAttempts++;
      // Reconnect logic
    }, Math.min(1000 * Math.pow(2, reconnectAttempts), 30000));
  }
};
```

#### UI Layout - WhatsApp Web Style
```
┌─────────────────────────────────────────────────┐
│ [Sidebar] │ [Chat List]     │ [Chat Window]    │
├───────────┼──────────────────┼──────────────────┤
│           │                  │                  │
│  📋       │  John Doe        │  John Doe        │
│ Templates │  Thank you...    │  +91 98765...    │
│           │  15:30     (2)   │ ──────────────── │
│  📞       │                  │                  │
│ Contacts  │  Jane Smith      │  Hi, I'd like to │
│           │  When will...    │  place an order  │
│  📢       │  14:20           │           15:25  │
│ Broadcast │                  │                  │
│           │  Bob Johnson     │  Sure! What      │
│  💬       │  Got it!         │  would you like? │
│ Chat      │  10:15           │  15:26           │
│           │                  │                  │
│           │                  │  Thank you for   │
│           │                  │  your order!     │
│           │                  │           15:30  │
│           │                  │                  │
│           │                  │ ──────────────── │
│           │                  │ [Type message...│
│           │                  │            [Send]│
│           │                  │                  │
└───────────┴──────────────────┴──────────────────┘
```

**Sidebar:** Navigation icons (vertical)
**Chat List:** Conversations with last message preview
**Chat Window:** Full message thread + input

#### Message Status Indicators
- **Sent:** Single checkmark (✓)
- **Delivered:** Double checkmark (✓✓)
- **Read:** Blue double checkmark (✓✓ in blue)

---

## 8. Global State Management (Zustand)

### 8.1 Auth Store
```typescript
interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isMetaConnected: boolean;
  metaData: {
    waba_id: string | null;
    phone_number_id: string | null;
  };
  
  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  setMetaConnection: (data: MetaData) => void;
  checkMetaStatus: () => Promise<void>;
}
```

### 8.2 App Store
```typescript
interface AppState {
  // State
  selectedTemplate: Template | null;
  selectedContacts: Contact[];
  broadcastProgress: {
    sent: number;
    total: number;
    failed: number;
  } | null;
  
  // Actions
  setSelectedTemplate: (template: Template) => void;
  toggleContactSelection: (contact: Contact) => void;
  clearSelections: () => void;
  updateBroadcastProgress: (progress: BroadcastProgress) => void;
}
```

### 8.3 Chat Store
```typescript
interface ChatState {
  // State
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;  // conversation_id -> messages
  wsConnected: boolean;
  
  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessageStatus: (messageId: string, status: string) => void;
  setWsConnected: (connected: boolean) => void;
}
```

---

## 9. Error Handling & Validation

### 9.1 API Error Format
All backend errors follow this structure:
```json
{
  "detail": "Human-readable error message"
}
```

### 9.2 Form Validation

#### Email Validation
```typescript
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
```

#### Phone Number Validation (Indian Format)
```typescript
const isValidIndianPhone = (phone: string): boolean => {
  // Must start with 91 and have 10 digits after
  return /^91[6-9]\d{9}$/.test(phone);
};
```

#### Password Validation
```typescript
const isValidPassword = (password: string): boolean => {
  // Min 8 chars, at least one letter and one number
  return password.length >= 8 && 
         /[a-zA-Z]/.test(password) && 
         /\d/.test(password);
};
```

### 9.3 Loading States
Every async operation should have:
- Loading indicator
- Success state
- Error state
- Empty state (no data)

```typescript
type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};
```

### 9.4 Toast Notifications
Use toast notifications for:
- ✅ Success messages ("Template created successfully")
- ❌ Error messages ("Failed to upload contacts")
- ⚠️ Warning messages ("Template pending approval")
- ℹ️ Info messages ("Broadcast queued")

---

## 10. UI States & Edge Cases

### 10.1 Empty States

#### No Templates
```
┌─────────────────────────────────────────────────┐
│                                                 │
│              📋                                 │
│                                                 │
│       No templates yet                          │
│                                                 │
│   Create your first message template            │
│   to start broadcasting                         │
│                                                 │
│       [Create Template]                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### No Contacts
```
┌─────────────────────────────────────────────────┐
│                                                 │
│              📞                                 │
│                                                 │
│       No contacts yet                           │
│                                                 │
│   Upload a CSV or add contacts manually         │
│   to start messaging                            │
│                                                 │
│   [Upload CSV]  [Add Contact]                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### No Conversations
```
┌─────────────────────────────────────────────────┐
│                                                 │
│              💬                                 │
│                                                 │
│       No conversations yet                      │
│                                                 │
│   Send your first message to start              │
│   a conversation                                │
│                                                 │
│       [Go to Broadcast]                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 10.2 Loading States
```
┌─────────────────────────────────────────────────┐
│                                                 │
│              ⏳                                 │
│                                                 │
│       Loading templates...                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 10.3 Error States
```
┌─────────────────────────────────────────────────┐
│                                                 │
│              ❌                                 │
│                                                 │
│       Failed to load templates                  │
│                                                 │
│   Check your connection and try again           │
│                                                 │
│       [Retry]                                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 11. Performance Requirements

### 11.1 Page Load Times
- Initial load: < 3 seconds
- Route transitions: < 500ms
- API responses: < 2 seconds

### 11.2 WebSocket
- Reconnection on disconnect
- Heartbeat every 30 seconds
- Max reconnection attempts: 5

### 11.3 Optimizations
- Lazy load routes via React Router
- Debounce search inputs (300ms)
- Paginate large lists (50 items per page)
- Cache API responses (5 minutes)

---

## 12. Security Considerations

### 12.1 XSS Prevention
- Sanitize all user inputs
- Use React's built-in XSS protection
- Never use `dangerouslySetInnerHTML` without sanitization

### 12.2 CSRF Protection
- SameSite cookies (if using cookies)
- CORS whitelist backend origins

### 12.3 Token Security
- Store in sessionStorage (not localStorage for MVP)
- Clear on logout
- Clear on 401 responses
- Never log tokens to console

---

## 13. Browser Storage

### 13.1 sessionStorage
```typescript
// Auth token
sessionStorage.setItem('connecte_auth_token', token);
sessionStorage.getItem('connecte_auth_token');
sessionStorage.removeItem('connecte_auth_token');
```

### 13.2 localStorage
Not used in MVP. Reserved for future features:
- User preferences
- Theme settings
- Draft messages

---

## 14. Development Workflow

### 14.1 Component Development Order
1. Auth pages (Login, Signup)
2. Meta OAuth pages
3. Dashboard (with locked states)
4. Templates page (view + create modal)
5. Contacts page (list + upload)
6. Broadcast page (multi-step flow)
7. Chat page (WebSocket integration)

### 14.2 Testing Checkpoints
After each page:
- Test with real backend API
- Test all loading/error/empty states
- Test form validation
- Test route protection

---

## 15. Future Enhancements (Out of Scope for MVP)

- Advanced analytics dashboard
- Message scheduling
- A/B testing for templates
- Custom webhook integrations
- Multi-user/team support
- Template performance metrics
- Contact segmentation
- Message automation flows
- Media message support (images, videos)
- Quick replies and buttons

---

## 16. Meta Cloud API References

### Message Templates API
- **Overview:** https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/overview
- **Create Template:** https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates/create
- **Retrieve Templates:** https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates#retrieve-templates
- **Delete Template:** https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates#delete-templates

### Cloud API Messaging
- **Send Messages:** https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages
- **Message Types:** https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
- **Webhooks:** https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components

### Business Management API
- **Phone Numbers:** https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers
- **WABAs:** https://developers.facebook.com/docs/whatsapp/embedded-signup/overview

---

## 17. Glossary

- **WABA:** WhatsApp Business Account
- **Meta Cloud API:** Meta's API for sending WhatsApp messages
- **System User Token:** Access token for API calls (stored per client)
- **Embedded Signup:** Meta's OAuth flow for connecting WABAs
- **Tech Provider:** Connecte's business model (not BSP/Solution Partner)
- **Template:** Pre-approved message format required for messaging outside 24hr window
- **Service Window:** 24-hour period after user's last message (no template required)

---

## Appendix A: API Base URLs

### Production
```
API: https://app.connecte.in/api
WebSocket: wss://app.connecte.in
```

### Development
```
API: http://localhost:8000
WebSocket: ws://localhost:8000
```

---

## Appendix B: HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET/PUT/DELETE |
| 201 | Created | Successful POST (resource created) |
| 202 | Accepted | Async operation queued |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Invalid/expired token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Backend failure |

---

## Document Sign-off

**Created by:** Claude (Anthropic AI)  
**Approved by:** Sarvesh Ghildiyal (Connecte Founder)  
**Date:** March 29, 2026  
**Version:** 1.0 - MVP Specification

---

**End of PRD**
