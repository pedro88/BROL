"use client";

import Link from "next/link";
import { Header, Navigation } from "@/components/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const PAID_TIERS = [
  {
    tier: "TIER_2" as const,
    name: "Tier 2",
    price: "3€",
    color: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    featureKeys: [
      "settings.tier.tier2.feature1",
      "settings.tier.tier2.feature2",
      "settings.tier.tier2.feature3",
    ],
  },
  {
    tier: "TIER_3" as const,
    name: "Tier 3",
    price: "20€",
    color: "text-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    featureKeys: [
      "settings.tier.tier3.feature1",
      "settings.tier.tier3.feature2",
      "settings.tier.tier3.feature3",
    ],
  },
];

export default function BillingPage() {
  const t = useTranslations();
  const utils = trpc.useUtils();
  const { data: status, isLoading } = trpc.billing.status.useQuery();

  const checkout = trpc.billing.createCheckout.useMutation({
    onSuccess: ({ checkoutUrl }) => {
      window.location.href = checkoutUrl;
    },
    onError: (e) => {
      toast.error(e.message || t("billing.checkoutError"));
    },
  });

  const cancel = trpc.billing.cancelSubscription.useMutation({
    onSuccess: async () => {
      toast.success(t("billing.canceled"));
      await utils.billing.status.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <main className="px-4 py-6 max-w-lg mx-auto flex items-center justify-center py-12">
          <div className="spinner-vhs w-8 h-8" />
        </main>
        <Navigation />
      </div>
    );
  }

  const currentTier = status?.tier ?? "FREE";
  const expiresAt = status?.tierExpiresAt ? new Date(status.tierExpiresAt) : null;

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/settings" className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-3xl vhs-text-glow text-primary">
            {t("billing.title")}
          </h1>
        </div>

        {/* Paiement non configuré sur ce serveur */}
        {status && !status.configured && (
          <div className="card-vhs p-4 flex items-start gap-3 border-amber-500/40 bg-amber-500/5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              {t("billing.notConfigured")}
            </p>
          </div>
        )}

        {/* Plan courant */}
        <div className="card-vhs p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl vhs-text-glow text-primary">
              {t("billing.currentPlan")}
            </h2>
          </div>
          <p className="font-display text-lg text-primary">{currentTier}</p>
          {status?.subscriptionActive && expiresAt && (
            <p className="font-mono text-xs text-muted-foreground">
              {t("billing.activeUntil", {
                date: expiresAt.toLocaleDateString("fr-BE"),
              })}
            </p>
          )}
          {status?.subscriptionActive && (
            <Button
              size="sm"
              variant="outline"
              disabled={cancel.isPending}
              onClick={() => {
                if (window.confirm(t("billing.cancelConfirm"))) cancel.mutate();
              }}
            >
              {cancel.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {t("billing.cancelSubscription")}
            </Button>
          )}
        </div>

        {/* Plans payants */}
        {currentTier !== "TIER_3" && (
          <div className="space-y-3">
            <h2 className="font-display text-lg vhs-text-glow text-primary">
              {t("billing.choosePlan")}
            </h2>
            {PAID_TIERS.filter((p) => p.tier !== currentTier).map((p) => (
              <div key={p.tier} className={`p-4 border rounded-lg ${p.border} ${p.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-display ${p.color}`}>{p.name}</span>
                  <span className={`font-mono text-sm ${p.color}`}>
                    {p.price}
                    {t("settings.perMonth")}
                  </span>
                </div>
                <ul className="space-y-1 mb-3">
                  {p.featureKeys.map((k) => (
                    <li
                      key={k}
                      className="text-sm text-muted-foreground flex items-center gap-2"
                    >
                      <span className={p.color}>✓</span> {t(k)}
                    </li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  className="w-full"
                  disabled={!status?.configured || checkout.isPending}
                  onClick={() => checkout.mutate({ tier: p.tier })}
                >
                  {checkout.isPending && checkout.variables?.tier === p.tier ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-1" />
                  )}
                  {t("billing.subscribe")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
}
