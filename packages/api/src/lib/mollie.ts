/**
 * Client Mollie minimal (fetch, sans dépendance).
 *
 * On parle directement à l'API REST Mollie en Bearer auth — pas de SDK, à
 * l'image du client BoardGameGeek. `isMollieConfigured()` retourne false si
 * `MOLLIE_API_KEY` manque, pour que l'appelant branche sur « paiement
 * désactivé » sans try/catcher une erreur de config (cf. pattern resend.ts).
 *
 * Flux abonnement (tiers payants) :
 *  1. `createCustomer` une fois par user (id persisté sur Profile).
 *  2. `createFirstPayment` (sequenceType "first") → redirect checkout. Le
 *     paiement réussi établit un *mandate* (SEPA/carte) réutilisable.
 *  3. Au webhook « first payment paid », `createSubscription` sur le customer
 *     → Mollie prélève automatiquement chaque mois et ping le webhook.
 *  4. `cancelSubscription` arrête les prélèvements (le tier reste actif
 *     jusqu'à `tierExpiresAt`).
 *
 * @package @brol/api
 */

import { logger } from "./logger";

const log = logger.child("mollie");

const MOLLIE_API = "https://api.mollie.com/v2";

/** True si une clé API Mollie est configurée (test_ ou live_). */
export function isMollieConfigured(): boolean {
  return !!process.env.MOLLIE_API_KEY;
}

/**
 * URL publique appelée par Mollie après chaque changement d'état d'un
 * paiement. Mollie REFUSE localhost : en dev sans tunnel, le webhook ne sera
 * jamais livré (le retour utilisateur reste fonctionnel via polling de
 * `billing.status`). Override par `MOLLIE_WEBHOOK_URL`, sinon dérivé de
 * `API_PUBLIC_URL` / `API_URL`.
 */
export function getWebhookUrl(): string {
  const explicit = process.env.MOLLIE_WEBHOOK_URL;
  if (explicit) return explicit;
  const base =
    process.env.API_PUBLIC_URL ?? process.env.API_URL ?? "http://localhost:3001";
  return `${base.replace(/\/$/, "")}/api/webhooks/mollie`;
}

/** URL de retour après checkout (page web `/billing/return`). */
export function getRedirectUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/billing/return`;
}

/**
 * Appel bas niveau à l'API Mollie. Throw si non configuré ou si Mollie
 * renvoie une erreur (le `detail` Mollie est propagé pour le diagnostic).
 */
async function mollieFetch<T>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) {
    throw new Error("MOLLIE_API_KEY non configuré");
  }
  const res = await fetch(`${MOLLIE_API}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });

  const text = await res.text();
  const json = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const detail =
      (json as { detail?: string } | null)?.detail ?? `HTTP ${res.status}`;
    log.error("Mollie API error", { path, status: res.status, detail });
    throw new Error(`Mollie ${res.status}: ${detail}`);
  }
  return json as T;
}

// --- Types (sous-ensemble des champs Mollie qu'on consomme) -----------------

export interface MollieCustomer {
  id: string; // cus_xxx
}

export interface MolliePayment {
  id: string; // tr_xxx
  status:
    | "open"
    | "pending"
    | "authorized"
    | "paid"
    | "canceled"
    | "expired"
    | "failed";
  amount: { currency: string; value: string };
  sequenceType?: "oneoff" | "first" | "recurring";
  customerId?: string;
  subscriptionId?: string;
  paidAt?: string;
  metadata?: Record<string, string> | null;
  _links?: { checkout?: { href: string } };
}

export interface MollieSubscription {
  id: string; // sub_xxx
  status: "pending" | "active" | "canceled" | "suspended" | "completed";
}

// --- Opérations -------------------------------------------------------------

/** Crée un customer Mollie (id à persister sur Profile.mollieCustomerId). */
export function createCustomer(args: {
  name: string;
  email: string;
}): Promise<MollieCustomer> {
  return mollieFetch<MollieCustomer>("/customers", {
    method: "POST",
    body: { name: args.name, email: args.email },
  });
}

/**
 * 1er paiement d'un abonnement (`sequenceType: "first"`) — établit le mandate.
 * Retourne le paiement + le lien de checkout (`_links.checkout.href`).
 */
export function createFirstPayment(args: {
  customerId: string;
  amount: string; // "3.00"
  description: string;
  metadata: Record<string, string>;
}): Promise<MolliePayment> {
  return mollieFetch<MolliePayment>("/payments", {
    method: "POST",
    body: {
      amount: { currency: "EUR", value: args.amount },
      customerId: args.customerId,
      sequenceType: "first",
      description: args.description,
      redirectUrl: getRedirectUrl(),
      webhookUrl: getWebhookUrl(),
      metadata: args.metadata,
    },
  });
}

/** Récupère un paiement par id (le webhook ne donne que l'id → on refetch). */
export function getPayment(paymentId: string): Promise<MolliePayment> {
  return mollieFetch<MolliePayment>(`/payments/${paymentId}`);
}

/**
 * Crée l'abonnement récurrent sur un customer ayant un mandate valide.
 * Mollie prélève `amount` tous les `interval` (ex "1 month") et ping le
 * webhook à chaque échéance.
 */
export function createSubscription(args: {
  customerId: string;
  amount: string;
  interval: string; // "1 month"
  description: string;
  metadata: Record<string, string>;
}): Promise<MollieSubscription> {
  return mollieFetch<MollieSubscription>(
    `/customers/${args.customerId}/subscriptions`,
    {
      method: "POST",
      body: {
        amount: { currency: "EUR", value: args.amount },
        interval: args.interval,
        description: args.description,
        webhookUrl: getWebhookUrl(),
        metadata: args.metadata,
      },
    },
  );
}

/** Annule un abonnement (arrête les prélèvements futurs). */
export function cancelSubscription(args: {
  customerId: string;
  subscriptionId: string;
}): Promise<MollieSubscription> {
  return mollieFetch<MollieSubscription>(
    `/customers/${args.customerId}/subscriptions/${args.subscriptionId}`,
    { method: "DELETE" },
  );
}
