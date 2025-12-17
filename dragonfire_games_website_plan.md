# Dragonfire Games Website – Project Plan

## Purpose
Build and gift a simple, modern website for **Dragonfire Games** (local game store in Lynchburg) to make events, schedules, and store activity easy to find and accessible for the community. This is intentionally *not* an e‑commerce site. The focus is events, visibility, and light operational support.

Primary goals:
- Centralized, always-up-to-date **events calendar**
- Extremely low-friction **admin experience** for store staff
- Clear, mobile-friendly public site for players
- A structured replacement for Facebook Messenger card requests

---

## Tech Stack

### Frontend
- **Next.js** (Pages Router)
  - Server-side rendering for SEO and freshness
  - API routes for backend logic
- **Tailwind CSS**
  - Utility-first styling
  - Fast iteration, responsive by default

### Backend / Data
- **Supabase**
  - Postgres database
  - Storage (optional, for event images)
  - Used only for data (not auth)

### Authentication
- **Clerk**
  - Email + password login
  - Single admin user (or small allowlist)
  - Protect `/admin/*` routes via middleware

### Deployment
- **Vercel**
  - Free tier sufficient
  - Native Next.js support

---

## Core Features (MVP)

### Public Pages

#### Home
- Store name + short description
- Location, hours, contact info
- Link to Events
- Optional featured / next upcoming event

#### About
- Store background / mission
- Address + embedded map
- Hours of operation
- Social links (Facebook, etc.)

#### Events
- List or calendar view of upcoming events
- Supports:
  - Weekly recurring events
  - One-time events
  - Tournaments
- Event metadata:
  - Title
  - Date & time
  - Event type (weekly / one-time / tournament)
  - Game / TCG tags (Magic, Pokémon, Yu‑Gi‑Oh!, Digimon, etc.)
  - Entry cost (optional)
  - Description / notes
  - Optional external registration link

#### Event Detail Page
- Full event info
- “Register” button if external link exists
- Clear callout if no registration required

---

## Card Pull Request System

### Public Card Request Page
- Textarea for users to paste decklist-style exports
- Format aligned with common deckbuilder exports:
  - `1 Lightning Bolt`
  - `2 Counterspell (M11) 146`
  - `3x Thoughtseize`
- Optional customer fields:
  - Name
  - Email
  - Phone (optional)
  - Notes

### Parsing Strategy (MVP)
- Best-effort line parsing:
  - Quantity
  - Card name
  - Optional set code
  - Optional collector number
- Store both:
  - Parsed fields
  - Raw line text
- Flag unparseable lines for admin review
- Optional Scryfall lookup to normalize card names (non-blocking)

### On Submit
1. Save request + items to database
2. Send email notification to store inbox
3. Show confirmation to user

---

## Admin Panel

### Auth
- Clerk-protected `/admin/*` routes
- Email + password login

### Admin – Events
- Create / edit / delete events
- Fields:
  - Title
  - Date & time
  - Event type
  - Game tags
  - Entry fee
  - Description
  - External registration link

### Admin – Card Requests
- List all requests with status
- View request detail:
  - Original pasted list
  - Parsed items
- Per-item controls:
  - Availability: unknown / available / unavailable / partial
  - Staff notes
- Request-level actions:
  - Update status (new, in review, waiting on customer, fulfilled, closed)
  - Send response email to customer
- Store all outbound messages for history

---

## Database Schema (High-Level)

### events
- id
- title
- description
- start_datetime
- end_datetime (optional)
- event_type
- game_tags[]
- entry_fee
- registration_link
- image_url
- created_at

### card_requests
- id
- customer_name
- customer_email
- customer_phone
- notes
- status
- created_at

### card_request_items
- id
- request_id
- raw_line
- quantity
- name
- set_code
- collector_number
- parsed_ok
- availability
- staff_note

### card_request_messages
- id
- request_id
- direction (outbound)
- message_body
- created_at

---

## API Routes

- `GET /api/events`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`

- `POST /api/card-requests`
- `GET /api/admin/card-requests`
- `PUT /api/admin/card-requests/:id`
- `POST /api/admin/card-requests/:id/message`

(All write routes server-only using Supabase service role key.)

---

## Build Order

1. Project scaffold (Next.js + Tailwind)
2. Supabase project + schema
3. Clerk auth + admin protection
4. Public pages (Home, About)
5. Events list + event detail pages
6. Admin event CRUD
7. Card request form + parser
8. Admin card request dashboard
9. Email notifications
10. Styling polish + SEO
11. Deployment + handoff

---

## Explicitly Out of Scope (for MVP)
- Online payments / Stripe checkout
- Inventory management
- User accounts for players
- Loyalty programs
- Event check-in systems

---

## Future Wishlist (V2+)
- Stripe payment links for card reservations
- Online event registration + payment
- Calendar subscription (ICS / Google Calendar)
- Automated recurring event generation
- Event reminders (email)
- Photo gallery / blog
- Integration with MTG Companion or other official tools

---

## Philosophy
Keep it boring, reliable, and obvious.

This site should reduce friction for players, not introduce new workflows for the store. Admin actions should take seconds, not minutes. Everything else is optional.

