/**
 * Tests du client Mollie (lib/mollie.ts). fetch est mocké — on vérifie la
 * config, les URLs dérivées, la forme des requêtes et la propagation d'erreur.
 * @package @brol/api
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as mollie from "../mollie";

const ORIGINAL = {
  key: process.env.MOLLIE_API_KEY,
  webhook: process.env.MOLLIE_WEBHOOK_URL,
  apiUrl: process.env.API_URL,
  apiPublic: process.env.API_PUBLIC_URL,
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
};

function restore(name: keyof typeof ORIGINAL, env: string) {
  if (ORIGINAL[name] === undefined) delete process.env[env];
  else process.env[env] = ORIGINAL[name] as string;
}

afterEach(() => {
  restore("key", "MOLLIE_API_KEY");
  restore("webhook", "MOLLIE_WEBHOOK_URL");
  restore("apiUrl", "API_URL");
  restore("apiPublic", "API_PUBLIC_URL");
  restore("appUrl", "NEXT_PUBLIC_APP_URL");
});

describe("isMollieConfigured", () => {
  it("returns false when MOLLIE_API_KEY is unset", () => {
    delete process.env.MOLLIE_API_KEY;
    expect(mollie.isMollieConfigured()).toBe(false);
  });

  it("returns true when MOLLIE_API_KEY is set", () => {
    process.env.MOLLIE_API_KEY = "test_abc";
    expect(mollie.isMollieConfigured()).toBe(true);
  });
});

describe("getWebhookUrl / getRedirectUrl", () => {
  it("derives the webhook from API_URL when no explicit override", () => {
    delete process.env.MOLLIE_WEBHOOK_URL;
    delete process.env.API_PUBLIC_URL;
    process.env.API_URL = "https://api.example.com";
    expect(mollie.getWebhookUrl()).toBe(
      "https://api.example.com/api/webhooks/mollie",
    );
  });

  it("prefers MOLLIE_WEBHOOK_URL when set", () => {
    process.env.MOLLIE_WEBHOOK_URL = "https://tunnel.dev/api/webhooks/mollie";
    process.env.API_URL = "https://api.example.com";
    expect(mollie.getWebhookUrl()).toBe("https://tunnel.dev/api/webhooks/mollie");
  });

  it("strips a trailing slash on the base URL", () => {
    delete process.env.MOLLIE_WEBHOOK_URL;
    delete process.env.API_PUBLIC_URL;
    process.env.API_URL = "https://api.example.com/";
    expect(mollie.getWebhookUrl()).toBe(
      "https://api.example.com/api/webhooks/mollie",
    );
  });

  it("builds the redirect from NEXT_PUBLIC_APP_URL", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";
    expect(mollie.getRedirectUrl()).toBe("https://app.example.com/billing/return");
  });
});

describe("Mollie API calls", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    process.env.MOLLIE_API_KEY = "test_abc";
    process.env.API_URL = "https://api.example.com";
    process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";
    delete process.env.MOLLIE_WEBHOOK_URL;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function reply(obj: unknown, ok = true, status = 200) {
    return { ok, status, text: async () => JSON.stringify(obj) };
  }

  it("createCustomer POSTs name+email with Bearer auth", async () => {
    fetchMock.mockResolvedValueOnce(reply({ id: "cus_1" }));
    const c = await mollie.createCustomer({ name: "Alice", email: "a@b.c" });
    expect(c.id).toBe("cus_1");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.mollie.com/v2/customers");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer test_abc");
    expect(JSON.parse(init.body)).toEqual({ name: "Alice", email: "a@b.c" });
  });

  it("createFirstPayment sends sequenceType:first, amount, webhook + redirect", async () => {
    fetchMock.mockResolvedValueOnce(
      reply({
        id: "tr_1",
        status: "open",
        amount: { currency: "EUR", value: "3.00" },
        _links: { checkout: { href: "https://pay.mollie.com/tr_1" } },
      }),
    );
    const p = await mollie.createFirstPayment({
      customerId: "cus_1",
      amount: "3.00",
      description: "Brol TIER_2",
      metadata: { userId: "u1", tier: "TIER_2" },
    });
    expect(p._links?.checkout?.href).toBe("https://pay.mollie.com/tr_1");

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.sequenceType).toBe("first");
    expect(body.customerId).toBe("cus_1");
    expect(body.amount).toEqual({ currency: "EUR", value: "3.00" });
    expect(body.webhookUrl).toBe("https://api.example.com/api/webhooks/mollie");
    expect(body.redirectUrl).toBe("https://app.example.com/billing/return");
    expect(body.metadata).toEqual({ userId: "u1", tier: "TIER_2" });
  });

  it("createSubscription targets the customer + interval", async () => {
    fetchMock.mockResolvedValueOnce(reply({ id: "sub_1", status: "active" }));
    const s = await mollie.createSubscription({
      customerId: "cus_1",
      amount: "3.00",
      interval: "1 month",
      description: "Brol TIER_2",
      metadata: { userId: "u1", tier: "TIER_2" },
    });
    expect(s.id).toBe("sub_1");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.mollie.com/v2/customers/cus_1/subscriptions");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body).interval).toBe("1 month");
  });

  it("cancelSubscription DELETEs the subscription", async () => {
    fetchMock.mockResolvedValueOnce(reply({ id: "sub_1", status: "canceled" }));
    await mollie.cancelSubscription({ customerId: "cus_1", subscriptionId: "sub_1" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.mollie.com/v2/customers/cus_1/subscriptions/sub_1");
    expect(init.method).toBe("DELETE");
  });

  it("throws with Mollie's detail message on error responses", async () => {
    fetchMock.mockResolvedValueOnce(reply({ detail: "Invalid amount" }, false, 422));
    await expect(mollie.getPayment("tr_x")).rejects.toThrow(/422|Invalid amount/);
  });

  it("throws when MOLLIE_API_KEY is missing", async () => {
    delete process.env.MOLLIE_API_KEY;
    await expect(mollie.getPayment("tr_x")).rejects.toThrow(/MOLLIE_API_KEY/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
