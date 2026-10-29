# Datastraw AI Support Inbox

A production-quality customer support dashboard and AI-assisted inbox built for **Software Engineer – AI & Product Engineering at Datastraw Technologies**.

This application implements a **Human-in-the-Loop (HITL)** architecture where Gemini AI drafts responses to customer inquiries, but replies are **never** automatically dispatched. Human agents review, edit, and explicitly approve drafts before they are saved to the conversation history and exposed to the customer.

---

## Architecture Overview

```
               ┌────────────────────────────────────────────────────────┐
               │                   Browser Client                       │
               │  React 19 + Vite (JavaScript & JSX)                    │
               └────────────┬───────────────────────────┬───────────────┘
                            │                           │
                   Agent Authentication         Public Customer Simulation
                   (JWT Bearer Token)           (No Auth Required)
                            │                           │
                            ▼                           ▼
               ┌────────────────────────────────────────────────────────┐
               │             Express.js REST API (:5000)                │
               │                                                        │
               │  Protected Routes:             Public Routes:          │
               │  - /api/conversations          - /api/customer/messages│
               │  - /api/drafts/:id             - /api/conversations/   │
               │  - /api/drafts/:id/approve       :id/customer-messages │
               └────────────┬───────────────────────────┬───────────────┘
                            │                           │
                     Prisma ORM                  Background Worker
                            │                           │
                            ▼                           ▼
               ┌─────────────────────────┐  ┌───────────────────────────┐
               │   PostgreSQL Database   │  │   Gemini Generative AI    │
               │ (Customers, Convs, Msgs)│  │ (RAG on Brand Knowledge)  │
               └─────────────────────────┘  └───────────────────────────┘
```

### Core System Invariants & Business Rules
1. **Human-in-the-Loop Safety**: AI only generates *drafts*. It never sends customer replies directly.
2. **Customer Privacy Protection**: The customer-facing view (`/customer`) uses dedicated public endpoints that strictly shield internal AI drafts, generation states, and agent notes.
3. **Approved Reply Immutability**: Once an AI draft is approved by an agent, it is finalized into an official agent reply and cannot be edited.
4. **Duplicate Submission Defense**: Multi-click prevention and loading locks are enforced across approval and send actions.

---

## Features

### 1. Agent Authentication
- **Login & Registration**: Integrated with `/api/auth/login` and `/api/auth/register`.
- **Validation**: Client-side validation for email formatting and password minimum length (8 characters).
- **Session Security**: Authenticated agent state managed via `AuthContext`, automatically attaching `Authorization: Bearer <token>` to protected endpoints.
- **Graceful Session Expiry**: Handles `401 Unauthorized` responses and logs out the agent with actionable feedback.
- **Role Display**: Visual badge indicating role (`AGENT` / `ADMIN`).
- **One-Click Demo Fill**: Convenient prefill button for assessment reviewers.

### 2. Agent Inbox & Conversation Feed
- **Conversation Feed**: Displays customer name, phone number, last activity relative timestamp, brand badge, and status (`OPEN` / `CLOSED`).
- **Live Search**: Instant client-side search across customer names, phone numbers, customer IDs, and message text.
- **Status Filter Tabs**: Filter between All, Open, and Closed conversations with real-time counters.
- **AI Status Indicators**:
  - `Draft Ready` (Sparkles): Indicates Gemini has prepared a draft awaiting agent review.
  - `AI Generating` (Pulsing): Indicates background draft generation is in progress.
- **Responsive Layout**: Two-column layout on desktop; single-column with back navigation on mobile and tablet screens.
- **Network Resilience**: Loading skeletons, error recovery cards, and overlap-prevented refresh actions.

### 3. Conversation Details & Message Timeline
- **Customer Information Header**: Customer details, phone number, identifier, and brand (`Verdant Co`).
- **Chronological Timeline**: Clear visual distinction between incoming customer inquiries (left, slate/white) and approved agent replies (right, indigo).
- **AI Processing Status**: Per-message status badges showing `Queued`, `Generating`, `Draft Ready`, or `Failed`.
- **Plain Text Rendering**: Safe text rendering preventing HTML/script injection vulnerabilities.

### 4. AI Draft Editor & Approval Workflow
- **Editable Draft Textarea**: Allows agents to modify AI-generated phrasing before sending.
- **Save Edits**: Persists changes via `PATCH /api/drafts/:draftId` (disabled when text is unchanged or empty).
- **Approval Modal**: Confirmation modal showing the final customer-facing text to prevent accidental sends.
- **Approval Execution**: Dispatches `PATCH /api/drafts/:draftId/approve`, which atomically converts the draft to an official agent reply, updates conversation activity, and locks further edits.
- **Worker Recovery State**: Sensible "AI draft is currently generating..." state with manual and automatic refresh options when a draft is still processing.

### 5. Customer Simulation View (`/customer`)
- **Public Testing Mode**: Accessible without agent credentials.
- **Configurable Customer Identity**: Enter customer name, phone, customer ID, and brand, or select one-click presets (e.g. *Aisha Sharma*).
- **Live Chat Experience**: Mobile-friendly WhatsApp/SMS style bubble interface.
- **Zero Draft Leaks**: Strictly fetches from the public customer endpoint (`/api/conversations/:id/customer-messages`), ensuring no pending drafts or internal statuses are ever leaked.
- **Auto-Update Polling**: Built-in 4-second auto-refresh toggle so testers can watch approved replies arrive in real time.

---

## Technology Stack

- **Frontend**: React 19, Vite 8, React Router 7, Lucide React icons, Native Fetch API client.
- **Backend**: Node.js, Express 5, Prisma 7, PostgreSQL (`@prisma/adapter-pg`), JSON Web Tokens (`jsonwebtoken`), `@google/genai` (Gemini API).

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **PostgreSQL**: Running locally or via Docker
- **Gemini API Key**: Configured in server `.env` for AI drafts

---

### Installation

#### 1. Backend Setup
```bash
cd server
npm install
```

Configure `server/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/datastraw_support"
JWT_SECRET="your-jwt-secret-key-at-least-32-chars"
JWT_EXPIRES_IN="1d"
GEMINI_API_KEY="your-gemini-api-key"
ADMIN_NAME="Admin Agent"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="secure_admin_password_123"
```

Initialize Database & Prisma Client:
```bash
npx prisma generate
```

Start the backend server:
```bash
npm run dev
# Server will run on http://localhost:5000
```

#### 2. Frontend Setup
```bash
cd client
npm install
```

Configure `client/.env` (safe, non-secret):
```env
VITE_API_BASE_URL=http://localhost:5000
```

Start the frontend development server:
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

---

## Test & Build Commands

| Command | Working Directory | Description | Actual Result |
|---|---|---|---|
| `npm run build` | `client/` | Compiles Vite production bundle | **Passed** (0 errors, 337 kB gzipped) |
| `npm run lint` | `client/` | Runs ESLint 10 + React Hooks 7 | **Passed** (0 errors, 0 warnings) |
| `npm run dev` | `client/` | Launches local Vite dev server | **Passed** (Ready on port 5173) |

---

## Demo Credentials & Identity Setup

### Agent Account (Pre-seeded & Tested)
- **Email**: `testagent@example.com`
- **Password**: `password123`
- *Alternatively, click the **"Fill Demo Credentials"** button on the Login page.*

### Customer Test Identities (Quick-Select on `/customer`)
- **Aisha Sharma**: Phone `+919876543210`, ID `customer_demo_101`
- **Aisha Khan**: Phone `+919800000001`, ID `cust_test_1001`

---

## How to Access the Views

- **Agent Inbox**: Navigate to `http://localhost:5173/inbox` (redirects to `/login` if unauthenticated).
- **Customer Simulation View**: Navigate to `http://localhost:5173/customer` (or click "Customer View" in the top navigation bar).

---

## Assessment Video Walkthrough Guide (3-Minute Script)

1. **Introduction & Customer View (0:00 - 0:45)**:
   - Open `http://localhost:5173/customer`.
   - Explain that this simulates an external customer channel (WhatsApp/SMS).
   - Point out that internal AI drafts are completely shielded.
   - Send a new question: *"What is your return policy if the item is damaged?"*
   - Show the customer view waiting for an agent.

2. **Agent Login & AI Inbox (0:45 - 1:45)**:
   - Switch to `http://localhost:5173/inbox` (or click the top toggle).
   - Demonstrate agent sign-in with validation and demo auto-fill.
   - Show the Inbox sidebar: search filtering, status tabs (`All`, `Open`, `Closed`), and the `Draft Ready` badge.
   - Open the conversation with Aisha Sharma.
   - Point out the customer inquiry and the Gemini-generated draft in the AI Reply Assistant.

3. **Draft Editing, Approval & Delivery (1:45 - 2:30)**:
   - Edit the draft text in the textarea (show word/character count and "Unsaved changes" indicator).
   - Click **Save Draft** to show state persistence.
   - Click **Approve & Send Reply**.
   - Show the confirmation modal emphasizing that approval is an explicit, human-controlled action.
   - Confirm approval: observe the approved reply appearing immediately in the conversation timeline as an immutable agent message.

4. **Customer Verification (2:30 - 3:00)**:
   - Switch back to the Customer View tab (`/customer`).
   - Observe the approved agent reply appearing in the chat timeline.
   - Conclude by highlighting security: customer never saw the draft before approval.

---

## Security & Architecture Considerations

- **Token Persistence**: JWT is stored in `localStorage` for development convenience. In an enterprise banking deployment, HTTP-only, Secure, SameSite cookies with CSRF tokens would be used to mitigate XSS risks.
- **No Secret Leakage**: No API keys, database URLs, or webhook HMAC secrets exist in frontend code or environment files.
- **Fail-Safe AI**: If the Gemini API fails or exceeds rate limits, the AI background worker retries up to 3 times before setting `aiProcessingStatus: FAILED`. The agent UI displays a clear retry card so the human agent is never blocked from sending a manual response.

