/**
 * Tests for the loan `computedStatus` helper.
 *
 * Covers the rule "ACTIVE + returnDueDate in the past → OVERDUE" plus
 * the matrix of other status / returnDueDate combinations.
 *
 * @package @brol/api
 */

import { describe, it, expect } from "vitest";
import {
  computeLoanStatus,
  withComputedStatus,
  withComputedStatuses,
} from "../loan-status";

const NOW = new Date();
const YESTERDAY = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);
const TOMORROW = new Date(NOW.getTime() + 24 * 60 * 60 * 1000);

describe("computeLoanStatus", () => {
  it("flags ACTIVE loans past their due date as OVERDUE", () => {
    expect(
      computeLoanStatus({ status: "ACTIVE", returnDueDate: YESTERDAY }, NOW),
    ).toBe("OVERDUE");
  });

  it("leaves ACTIVE loans with a future due date as ACTIVE", () => {
    expect(
      computeLoanStatus({ status: "ACTIVE", returnDueDate: TOMORROW }, NOW),
    ).toBe("ACTIVE");
  });

  it("leaves ACTIVE loans with a null due date as ACTIVE", () => {
    expect(computeLoanStatus({ status: "ACTIVE", returnDueDate: null }, NOW)).toBe("ACTIVE");
  });

  it("accepts ISO string returnDueDate", () => {
    expect(
      computeLoanStatus(
        { status: "ACTIVE", returnDueDate: YESTERDAY.toISOString() },
        NOW,
      ),
    ).toBe("OVERDUE");
  });

  it("does not change RETURNED loans", () => {
    expect(
      computeLoanStatus(
        { status: "RETURNED", returnDueDate: YESTERDAY },
        NOW,
      ),
    ).toBe("RETURNED");
  });

  it("does not change CANCELLED loans", () => {
    expect(
      computeLoanStatus(
        { status: "CANCELLED", returnDueDate: YESTERDAY },
        NOW,
      ),
    ).toBe("CANCELLED");
  });
});

describe("withComputedStatus", () => {
  it("adds a computedStatus field without mutating the input", () => {
    const input = { id: "loan-1", status: "ACTIVE" as const, returnDueDate: YESTERDAY };
    const out = withComputedStatus(input);
    expect(out.computedStatus).toBe("OVERDUE");
    expect(out).not.toBe(input); // new object
    expect(input.computedStatus).toBeUndefined(); // input not mutated
  });
});

describe("withComputedStatuses", () => {
  it("maps an array", () => {
    const out = withComputedStatuses([
      { id: "a", status: "ACTIVE" as const, returnDueDate: YESTERDAY },
      { id: "b", status: "ACTIVE" as const, returnDueDate: TOMORROW },
    ]);
    expect(out[0]!.computedStatus).toBe("OVERDUE");
    expect(out[1]!.computedStatus).toBe("ACTIVE");
  });

  it("returns an empty array for an empty input", () => {
    expect(withComputedStatuses([])).toEqual([]);
  });
});
