# S05: Email reminders with Resend — UAT

**Milestone:** M007
**Written:** 2026-05-10T07:53:17.696Z

## UAT S05: Email reminders

- [ ] RESEND_API_KEY configured in .env
- [ ] RESEND_FROM_EMAIL verified in Resend dashboard
- [ ] Clicking remind button triggers loans.remind mutation
- [ ] Email sent to borrower (if RESEND_API_KEY set)
- [ ] Graceful message shown if RESEND_API_KEY not configured
- [ ] Email contains object name, owner name, dates
- [ ] reminderSentAt updated in database
- [ ] Toast shows success message
