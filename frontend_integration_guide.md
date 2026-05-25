# Frontend Integration Guide (Stages 1 to 5)

This document outlines the API contracts and structural changes made across all stabilization stages. It serves as a guide to recalibrate the `app-frontend` project for authentication, embedded signup, broadcasting, and chat.

---

## 1. Authentication Updates (Stage 1)

### 1.1 Sign Up Flow Auto-Login
When a user signs up successfully via `/auth/signup`, they are now automatically logged in. The response will immediately include the `access_token`, saving an extra login request.

**Response Structure:**
```json
{
  "user": {
    "user_email": "user@example.com"
  },
  "message": "User successfully created.",
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer"
}
```

### 1.2 Case Insensitive Email
All email addresses are sanitized to lowercase on the backend. You do not need to worry about the user typing `User@Example.com` versus `user@example.com`; the backend handles collisions properly and will return a `409 Conflict` if the email is already registered.

---

## 2. Meta Embedded Signup Flow (Stage 2)

We have strictly aligned our backend contract with Meta's JS SDK specifications to handle all callback scenarios (FINISH, CANCEL, ERROR) using a unified structure.

### 2.1 The `/meta/setup` Endpoint
**Method:** `POST /meta/setup`  
**Headers:** `Authorization: Bearer <JWT_TOKEN>`

#### Scenario A: Successful Onboarding (`FINISH`)
```json
{
  "type": "WA_EMBEDDED_SIGNUP",
  "event": "FINISH",
  "version": 3,
  "data": {
    "waba_id": "123456789",
    "phone_number_id": "987654321",
    "business_id": "11223344",
    "code": "AQAB..."
  }
}
```

#### Scenario B: Flow Abandoned (`CANCEL`)
```json
{
  "type": "WA_EMBEDDED_SIGNUP",
  "event": "CANCEL",
  "version": 3,
  "data": {
    "current_step": "PHONE_NUMBER_VERIFICATION"
  }
}
```

#### Scenario C: Error Occurred (`ERROR`)
```json
{
  "type": "WA_EMBEDDED_SIGNUP",
  "event": "CANCEL",
  "version": 3,
  "data": {
    "error_message": "Your verified name violates WhatsApp guidelines.",
    "error_code": "131031",
    "session_id": "abc-123",
    "timestamp": "1698273645"
  }
}
```

---

## 3. Multiple WABA Account Selection (Stage 4)

To support users running multiple WhatsApp Business Accounts (WABAs), the backend now supports dynamic account selection across all broadcast and chat endpoints.

### 3.1 Passing the Active Account Context
The frontend should pass the active WABA ID with each request. You can send it in **either** of the following two ways:

1. **HTTP Header (Recommended):** Add `X-Waba-Id` to your request headers.
   ```http
   X-Waba-Id: 920070352646140
   ```
2. **Query Parameter:** Append `waba_id` to your request URL.
   ```http
   GET /chat/conversations?waba_id=920070352646140
   ```

*Note: If neither is passed, the backend automatically defaults to the user's first available complete client user profile (WABA).*

---

## 4. Chat Endpoints & Webhooks (Stage 5)

Chat messages and inbox threads are stored and managed entirely in PostgreSQL. All database models are timezone-aware.

### 4.1 Get inbox conversations
**Method:** `GET /chat/conversations`  
**Headers:** 
- `Authorization: Bearer <JWT_TOKEN>`
- `X-Waba-Id: <WABA_ID>`

**Response Payload:**
```json
{
  "conversations": [
    {
      "id": "917017348970",           // Customer's WhatsApp ID (wa_id)
      "contact_name": "John Doe",     // Profile name or fallback phone number
      "contact_phone": "+917017348970",
      "last_message": "Hello there!",
      "last_message_time": "2026-05-25T10:00:00.000Z", // ISO format timezone-aware
      "unread_count": 2               // Total unread inbound messages in this thread
    }
  ]
}
```

### 4.2 Get message history
Loads all messages inside a specific conversation thread. **Hitting this endpoint automatically marks the conversation as read (resets unread badge to 0).**

**Method:** `GET /chat/{wa_id}/messages`  
**Headers:** 
- `Authorization: Bearer <JWT_TOKEN>`
- `X-Waba-Id: <WABA_ID>`

**Response Payload:**
```json
{
  "messages": [
    {
      "id": "wamid.HBgLOTE3MDE3MzQ4OTcwFQIAERgSQjE4OTI1Qzg1NzRDN0M4RjFCAA==", // Meta message ID
      "conversation_id": "917017348970",
      "direction": "inbound",        // 'inbound' | 'outbound'
      "type": "text",                // 'text' | 'template' | 'image'
      "text": "Hello there!",
      "template_id": null,
      "template_name": null,
      "contact_name": "John Doe",
      "context_message_id": null,    // If reply, maps to parent message's wamid
      "status": null,
      "error_code": null,
      "error_message": null,
      "timestamp": "2026-05-25T10:00:00.000Z"
    }
  ]
}
```

### 4.3 Sending a message
Sends a text message within the 24-hour service window.

**Method:** `POST /chat/send`  
**Headers:** 
- `Authorization: Bearer <JWT_TOKEN>`
- `X-Waba-Id: <WABA_ID>`

**Request Body:**
```json
{
  "wa_id": "917017348970",
  "body": "This is a reply message",
  "preview_url": false,
  "context_message_id": "wamid.HBgLOTE3MDE3MzQ4OTcwFQIAERgSQjE4OTI1Qzg1NzRDN0M4RjFCAA==" // Optional reply id
}
```

**Response Payload:**
```json
{
  "message_id": "wamid.HBgLOTE3MDE3MzQ4OTcwFQIAERgSQjE4OTI1Qzg1...",
  "status": "accepted",
  "timestamp": "2026-05-25T10:01:00.000Z"
}
```

---

## 5. Contact Opt-Out Trigger (Backend Automated)

The backend automatically processes customer opt-outs inside the webhook processing pipeline:
- **Trigger:** If a customer sends the message **"STOP"** (case-insensitive) to the business phone number.
- **Backend Webhook Action:** The backend parses the incoming webhook, intercepts the `"STOP"` keyword, and automatically updates the matching `Contact` row in PostgreSQL to `opted_in = false`.
- **Frontend Action Required:** None. The frontend does not need to send any REST API requests when the STOP message arrives. It only needs to display the updated `opted_in` state (e.g. disabling the broadcast switch or showing an opt-out badge next to the contact profile).
- **Broadcasting Impact:** Any future broadcast template messages triggered to this contact's phone number or tags will be bypassed/skipped automatically to comply with privacy rules.
- **Re-activation:** The contact can be re-enabled from the dashboard, or if they send another message, the opt-in can be updated manually.
