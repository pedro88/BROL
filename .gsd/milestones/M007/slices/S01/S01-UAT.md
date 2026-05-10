# S01: Schema + API loans/contacts — UAT

**Milestone:** M007
**Written:** 2026-05-10T06:31:40.847Z

## UAT Checklist — S01: Schema + API loans/contacts

### Prisma Schema
- [ ] `contact.borrowerId` field exists and nullable
- [ ] `contact.email` index exists
- [ ] `contact.borrowerId` index exists
- [ ] `User.borrowerOfContact` relation exists

### contacts.get
- [ ] Returns contact fields (name, email, phone, note)
- [ ] Includes `loans` array
- [ ] Each loan has `computedStatus` field
- [ ] `computedStatus` is "OVERDUE" when `returnDueDate < now()` and status is ACTIVE
- [ ] `computedStatus` is "ACTIVE" when `returnDueDate >= now()` and status is ACTIVE
- [ ] `computedStatus` equals `status` for RETURNED/CANCELLED

### contacts.loansForContact
- [ ] Returns `{ contact, loans }` structure
- [ ] Loans ordered by createdAt desc
- [ ] Includes object details (id, name, coverImage)
- [ ] Includes owner details (id, name, image)
- [ ] Throws "Contact non trouvé" for other user's contact

### loans.lentOut
- [ ] Returns active loans owned by user
- [ ] Each item has `computedStatus`
- [ ] OVERDUE loans appear first (orderBy status asc)
- [ ] Within same status, sorted by returnDueDate asc

### loans.borrowed
- [ ] Returns active loans borrowed by user
- [ ] Each item has `computedStatus`
- [ ] Sorted by returnDueDate asc

### loans.history
- [ ] Returns all loans (all statuses) for user
- [ ] Each item has `computedStatus`
- [ ] Sorted by createdAt desc

### Tests
- [ ] 32/32 Vitest tests pass
- [ ] contacts.get with overdue loan → computedStatus = "OVERDUE"
- [ ] loans.lentOut with overdue loan → computedStatus = "OVERDUE"
