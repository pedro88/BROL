# S01: Collections CRUD

**Goal:** Implement full collection management UI: list, create, view, delete
**Demo:** After this: After this: User can create and browse collections from dashboard

## Tasks
- [x] **T01: Collections list page with grid, create dialog, and navigation** — Create /collections page with grid of collections, each showing name, description, object count, and cover image
  - Estimate: 2h
  - Files: apps/web/src/app/collections/page.tsx, apps/web/src/components/collections/collection-card.tsx
  - Verify: Navigate to /collections and see the collections grid
- [x] **T02: Create collection dialog with form validation** — Build modal/page form with name (required) and description (optional) fields, styled with VHS 80s theme
  - Estimate: 1h
  - Files: apps/web/src/components/collections/create-collection-dialog.tsx
  - Verify: Click 'Add Collection' and form renders with validation
- [x] **T03: Collection detail and edit pages with objects list** — Create /collections/[id] page showing collection details and list of objects inside
  - Estimate: 2h
  - Files: apps/web/src/app/collections/[id]/page.tsx, apps/web/src/components/collections/collection-detail.tsx
  - Verify: Navigate to /collections/[id] and see collection with objects
- [x] **T04: Delete collection with confirmation** — Add delete confirmation dialog and wire up tRPC delete mutation
  - Estimate: 30m
  - Files: apps/web/src/components/collections/delete-collection-dialog.tsx
  - Verify: Delete button triggers confirmation, collection removed after confirm
- [x] **T05: Collections and objects E2E tests** — Write Playwright test: create collection, view collection list, navigate to detail
  - Estimate: 1h
  - Files: apps/web/e2e/collections.spec.ts
  - Verify: pnpm test:e2e passes for collections.spec.ts
