# S02: Objects Management

**Goal:** Implement object management within collections: add, list, view, edit, delete
**Demo:** After this: After this: User can add objects to collections and view them

## Tasks
- [x] **T01: Add object page with collection selector** — Create /objects/add page with form for adding objects to a collection (with collection selector if needed)
  - Estimate: 2h
  - Files: apps/web/src/app/objects/add/page.tsx, apps/web/src/components/objects/object-form.tsx
  - Verify: Navigate to /objects/add and fill form successfully
- [x] **T02: Object form with all fields and validation** — Build reusable object form with all fields: name, author, edition, isbn, barcode, condition, notes
  - Estimate: 1h
  - Files: apps/web/src/components/objects/object-form.tsx
  - Verify: Form validates all fields correctly
- [x] **T03: Object card with loan status display** — Display objects within collection detail page with grid/list view toggle
  - Estimate: 1h
  - Files: apps/web/src/components/objects/object-card.tsx
  - Verify: Objects render with name, condition badge, loan status
- [x] **T04: Object detail page with loan history** — Create /objects/[id] page showing full object details with loan history
  - Estimate: 1h
  - Files: apps/web/src/app/objects/[id]/page.tsx
  - Verify: Navigate to object and see full details + loan history
- [x] **T05: Edit/delete object functionality** — Add edit and delete functionality with confirmation dialogs
  - Estimate: 1h
  - Files: apps/web/src/components/objects/edit-object-dialog.tsx, apps/web/src/components/objects/delete-object-dialog.tsx
  - Verify: Edit updates object, delete removes it
- [x] **T06: Objects E2E tests** — Write Playwright test: add object, list objects, view object, edit object
  - Estimate: 1h
  - Files: apps/web/e2e/objects.spec.ts
  - Verify: pnpm test:e2e passes for objects.spec.ts
