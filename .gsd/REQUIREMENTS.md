# Requirements

This file is the explicit capability and coverage contract for the project.

Use it to track what is actively in scope, what has been validated by completed work, what is intentionally deferred, and what is explicitly out of scope.

Guidelines:
- Keep requirements capability-oriented, not a giant feature wishlist.
- Requirements should be atomic, testable, and stated in plain language.
- Every **Active** requirement should be mapped to a slice, deferred, blocked with reason, or moved out of scope.
- Each requirement should have one accountable primary owner and may have supporting slices.
- Research may suggest requirements, but research does not silently make them binding.
- Validation means the requirement was actually proven by completed work and verification, not just discussed.

## Active

### R001 — Collections CRUD
- Class: core-capability
- Status: active
- Description: User can create, view, edit, and delete collections of objects
- Why it matters: Collections are the primary organization unit — without this, objects have no home
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: none
- Validation: validated
- Notes: M001-S01 complete; CRUD UI works with mock data

### R002 — Objects management
- Class: core-capability
- Status: active
- Description: User can add, view, edit, and delete objects within a collection, with condition tracking and notes
- Why it matters: Objects are the core item being tracked (loaned, scanned, counted)
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: none
- Validation: validated
- Notes: M001-S02 complete; UI exists, mock data, real tRPC router pre-existing

### R003 — User authentication
- Class: core-capability
- Status: active
- Description: User can sign in, session persists, data is isolated per user
- Why it matters: Without auth, all users see the same mock data — no ownership, no isolation, no loans
- Source: user
- Primary owning slice: M002/S01
- Supporting slices: M002/S02 (replace mock data with real queries)
- Validation: unmapped
- Notes: Prisma schema has BetterAuth-ready models; createContext returns userId: null currently

### R004 — User-owned data isolation
- Class: core-capability
- Status: active
- Description: All queries and mutations scoped to the authenticated user; User A cannot see User B's collections/objects/loans
- Why it matters: Privacy and security — core requirement for a personal inventory app
- Source: user
- Primary owning slice: M002/S01
- Supporting slices: none
- Validation: unmapped
- Notes: Depends on R003 (auth); current mock data has no user scoping

### R005 — Loan creation and tracking
- Class: primary-user-loop
- Status: active
- Description: User can lend an object to a contact, set a due date, track status (active/returned/overdue)
- Why it matters: The key differentiator — not just inventory, but "who has my stuff"
- Source: user
- Primary owning slice: M005/S01
- Supporting slices: M005/S02 (contact creation from loan flow)
- Validation: unmapped
- Notes: tRPC router (loans.ts) and Zod schemas pre-built; not wired to real frontend yet

### R006 — Contact management
- Class: core-capability
- Status: active
- Description: User can create, view, edit, and delete contacts (borrowers)
- Why it matters: Contacts are the borrower side of loans — need to exist before R005 can work
- Source: user
- Primary owning slice: M005/S01
- Supporting slices: none
- Validation: unmapped
- Notes: contacts router exists; no frontend UI yet

### R007 — QR stock management
- Class: core-capability
- Status: active
- Description: User can generate batches of QR codes, assign them to objects, delete unused ones
- Why it matters: Physical tagging of objects for external scanning
- Source: user
- Primary owning slice: M004/S01
- Supporting slices: M004/S02 (assign from object edit page)
- Validation: unmapped
- Notes: tRPC router (qr.ts) exists; no frontend UI yet; UUID v7 for orderable codes

### R008 — Public object QR scan
- Class: primary-user-loop
- Status: active
- Description: Any person (unauthenticated) can scan an object's QR code and view the object name, owner, and loan status — and send a message to the owner
- Why it matters: Core public-facing feature — enables borrowing requests from non-users
- Source: user
- Primary owning slice: M004/S01
- Supporting slices: M004/S02 (message sending)
- Validation: unmapped
- Notes: `publicObjectScanSchema` exists but no endpoint; mobile scan screen exists but not wired

### R009 — Loan reminders
- Class: failure-visibility
- Status: active
- Description: Owner can send a reminder email to a borrower when a loan is overdue or due soon
- Why it matters: Closes the loop on "I want my stuff back"
- Source: user
- Primary owning slice: M005/S03
- Supporting slices: none
- Validation: unmapped
- Notes: loans.remind() exists in router but only logs — email not implemented (TODO visible)

### R010 — Mobile app backend integration
- Class: integration
- Status: active
- Description: Mobile app (Expo) makes real tRPC calls to backend; user can browse collections, objects, loans, and scan QR codes from the mobile app
- Why it matters: Mobile is a primary access point alongside web
- Source: user
- Primary owning slice: M003/S01
- Supporting slices: M003/S02 (mobile scan flow)
- Validation: unmapped
- Notes: Mobile screens exist (home, collections, loans, scan) but no tRPC calls yet

### R011 — Internationalization
- Class: quality-attribute
- Status: active
- Description: App displays in user's preferred language (fr, nl, en); locale stored in user profile
- Why it matters: Multi-language support for Belgian/Dutch users
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Locale files exist (fr.json, nl.json, en.json) but not wired; locale default is "fr" in schema

### R012 — Responsive design
- Class: quality-attribute
- Status: active
- Description: Web app usable on mobile viewport (375px+)
- Why it matters: Users may access from phone; VHS theme should not break on small screens
- Source: inferred
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Not tested; no mobile-specific breakpoints visible in current CSS

## Validated

### R013 — VHS 80s aesthetic
- Class: differentiator
- Status: validated
- Description: UI uses dark theme, neon glow effects, font-display + font-mono typography, gradients, card borders
- Why it matters: Brand identity — "brol" project has a clear visual personality
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: none
- Validation: validated
- Notes: Applied to web components; theme colors defined in globals.css; mobile matches dark theme

## Deferred

### R014 — Multi-device sync
- Class: continuity
- Status: deferred
- Description: Changes made on web reflect immediately on mobile (and vice versa) without full page reload
- Why it matters: Core expectation for a mobile-accessible app
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Depends on R010 (mobile backend) first; tRPC with React Query should handle this but needs real testing

### R015 — Offline support (mobile)
- Class: quality-attribute
- Status: deferred
- Description: Mobile app works offline with local cache, syncs when connection restored
- Why it matters: Users scan QR codes in basements, attics, garages
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Low priority until R010 (online integration) is proven

## Out of Scope

### R016 — Admin panel
- Class: anti-feature
- Status: out-of-scope
- Description: Backend admin for user management, global stats, moderation
- Why it matters: This is a personal inventory app, not a multi-tenant SaaS
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: Single-user model; no admin panel needed

### R017 — Social features
- Class: anti-feature
- Status: out-of-scope
- Description: Following other users, public profiles, borrow ratings, reviews
- Why it matters: Would turn this into a platform — scope creep
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: Only public-facing scan is for sending a message to the owner, not social discovery

### R018 — Barcode scanning from ISBN
- Class: constraint
- Status: out-of-scope
- Description: Auto-populate object details by scanning an ISBN barcode with camera
- Why it matters: Nice to have but not core to the lending/QR story
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: ISBN field exists on Object but manual entry only

## Traceability

| ID | Class | Status | Primary owner | Supporting | Proof |
|---|---|---|---|---|---|
| R001 | core-capability | validated | M001/S01 | none | validated |
| R002 | core-capability | validated | M001/S02 | none | validated |
| R003 | core-capability | active | M002/S01 | M002/S02 | unmapped |
| R004 | core-capability | active | M002/S01 | none | unmapped |
| R005 | primary-user-loop | active | M005/S01 | M005/S02 | unmapped |
| R006 | core-capability | active | M005/S01 | none | unmapped |
| R007 | core-capability | active | M004/S01 | M004/S02 | unmapped |
| R008 | primary-user-loop | active | M004/S01 | M004/S02 | unmapped |
| R009 | failure-visibility | active | M005/S03 | none | unmapped |
| R010 | integration | active | M003/S01 | M003/S02 | unmapped |
| R011 | quality-attribute | active | none | none | unmapped |
| R012 | quality-attribute | active | none | none | unmapped |
| R013 | differentiator | validated | M001/S01 | none | validated |
| R014 | continuity | deferred | none | none | unmapped |
| R015 | quality-attribute | deferred | none | none | unmapped |
| R016 | anti-feature | out-of-scope | none | none | n/a |
| R017 | anti-feature | out-of-scope | none | none | n/a |
| R018 | constraint | out-of-scope | none | none | n/a |

## Coverage Summary

- Active requirements: 12
- Mapped to slices: 0 (none of M002-M005 planned yet)
- Validated: 3 (R001, R002, R013 from M001)
- Unmapped active requirements: 9 (R003-R012)
