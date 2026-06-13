"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header, Navigation } from "@/components/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Page de retour après checkout Mollie. Mollie ne transmet pas le statut dans
 * l'URL de redirect : on poll `billing.status` jusqu'à ce que l'abonnement
 * devienne actif (le webhook crédite le tier en quelques secondes). Au-delà
 * d'un délai, on invite l'utilisateur à patienter (webhook éventuellement en
 * retard, ou non livrable en dev sans tunnel public).
 */
export default function BillingReturnPage() {
  const t = useTranslations();
  const [waitedLong, setWaitedLong] = useState(false);

  const { data: status } = trpc.billing.status.useQuery(undefined, {
    refetchInterval: (q) =>
      q.state.data?.subscriptionActive ? false : 2000,
  });

  useEffect(() => {
    const timer = setTimeout(() => setWaitedLong(true), 15000);
    return () => clearTimeout(timer);
  }, []);

  const active = status?.subscriptionActive ?? false;

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        <div className="card-vhs p-8 flex flex-col items-center text-center gap-4">
          {active ? (
            <>
              <CheckCircle2 className="w-12 h-12 text-green-400" />
              <h1 className="font-display text-2xl vhs-text-glow text-primary">
                {t("billing.return.success")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("billing.return.successDetail", {
                  tier: status?.tier ?? "",
                })}
              </p>
              <Button asChild>
                <Link href="/settings">{t("billing.return.backToSettings")}</Link>
              </Button>
            </>
          ) : (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <h1 className="font-display text-2xl vhs-text-glow text-primary">
                {t("billing.return.processing")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {waitedLong
                  ? t("billing.return.stillProcessing")
                  : t("billing.return.processingDetail")}
              </p>
              <Button variant="outline" asChild>
                <Link href="/billing">{t("billing.return.backToBilling")}</Link>
              </Button>
            </>
          )}
        </div>
      </main>
      <Navigation />
    </div>
  );
}
