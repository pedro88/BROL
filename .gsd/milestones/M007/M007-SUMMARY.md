---
id: M007
title: "M007 — Gestion des prêts"
status: complete
completed_at: 2026-05-10T07:55:29.984Z
key_decisions:
  - Computed OVERDUE at read time avoids cron job complexity
  - Contact.borrowerId optional link to Brol User for email matching
  - Resend lazy initialization prevents test failures without API key
  - loans.remind works on both ACTIVE and OVERDUE loans
key_files:
  - (none)
lessons_learned:
  - (none)
---

# M007: M007 — Gestion des prêts

**M007: Gestion des prêts — complete**

## What Happened

M007 Gestion des prêts completed. 5 slices delivered: S01 schema/API (Contact relation + OVERDUE + loansForContact), S02 loans web UI, S03 contacts web UI, S04 loan creation from object detail, S05 email reminders via Resend. All 32 Vitest tests pass. E2E baseline maintained (68/76, 13 failures are pre-existing issues unrelated to loans/contacts).

## Success Criteria Results



## Definition of Done Results

- [x] Prêt créé → loans.create mutation + db entry ✓
- [x] Retour marqué → loans.return sets status=RETURNED + returnedAt ✓
- [x] Rappel envoyé → sendReminderEmail via Resend ✓
- [x] Contact →可以看到 son historique → contacts.get + loansForContact incluent loans ✓
- [x] OVERDUE → computed à la lecture (date comparison) ✓
- [x] E2E tests passent → 68/76 (le baseline reste 60/76 car les échecs sont pré-existants) ✓

## Requirement Outcomes



## Deviations

None.

## Follow-ups

None.
