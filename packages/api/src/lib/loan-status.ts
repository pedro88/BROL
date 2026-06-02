/**
 * Helpers for the loan's `computedStatus` field.
 *
 * Loans have a stored `status` (ACTIVE / RETURNED / CANCELLED / OVERDUE)
 * but the `OVERDUE` status is never written to the DB — it's derived at
 * read time from `status === "ACTIVE" && returnDueDate < now`. The
 * previous code re-implemented this in 5 places (loans.lentOut,
 * loans.borrowed, loans.history, contacts.get, contacts.loansForContact),
 * each with its own small drift (different variable name, different
 * null handling, etc).
 *
 * @package @brol/api
 */

export type LoanStoredStatus = "ACTIVE" | "RETURNED" | "CANCELLED" | "OVERDUE";
export type LoanComputedStatus = "ACTIVE" | "RETURNED" | "CANCELLED" | "OVERDUE";

export interface LoanLike {
  status: LoanStoredStatus;
  returnDueDate: Date | string | null;
}

/**
 * Pure function: compute the display status of a loan.
 *
 *   ACTIVE  + returnDueDate in the past  → OVERDUE
 *   ACTIVE  + returnDueDate in the future → ACTIVE
 *   ACTIVE  + returnDueDate null           → ACTIVE
 *   anything else                          → unchanged
 */
export function computeLoanStatus(
  loan: LoanLike,
  now: Date = new Date(),
): LoanComputedStatus {
  if (
    loan.status === "ACTIVE" &&
    loan.returnDueDate != null &&
    new Date(loan.returnDueDate) < now
  ) {
    return "OVERDUE";
  }
  return loan.status;
}

/**
 * Add a `computedStatus` field to a single loan. Returns a shallow copy
 * — the input is not mutated.
 */
export function withComputedStatus<T extends LoanLike>(loan: T): T & { computedStatus: LoanComputedStatus } {
  return { ...loan, computedStatus: computeLoanStatus(loan) };
}

/**
 * Map an array of loans through `withComputedStatus`. Use after any
 * `prisma.loan.findMany` that returns ACTIVE loans the UI might want
 * to flag as OVERDUE.
 */
export function withComputedStatuses<T extends LoanLike>(loans: T[]): Array<T & { computedStatus: LoanComputedStatus }> {
  return loans.map(withComputedStatus);
}
