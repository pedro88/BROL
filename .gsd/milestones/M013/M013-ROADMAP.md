# M013: Enhanced Object Creation - Type-specific fields, photos, QR, and pricing

**Vision:** Improved object creation with type-specific fields, photo upload during creation, QR scanner on mobile, adaptive edit modal, and new fields for caution and rental pricing.

## Slices

- [ ] **S01: Object creation type-specific fields + photo upload + no redirect** `risk:high` `depends:[]`
  > After this: Object creation shows photo upload field, no redirect to edit, type-specific fields visible

- [ ] **S02: QR scanner integration in object creation (mobile)** `risk:medium` `depends:[S01]`
  > After this: Mobile user can scan QR code during object creation

- [ ] **S03: Type-adapted object edit modal** `risk:medium` `depends:[S01]`
  > After this: Object edit modal adapts to object type

- [ ] **S04: Caution and rental pricing fields** `risk:medium` `depends:[S01]`
  > After this: Objects can have caution and rental pricing

## Boundary Map

Not provided.
