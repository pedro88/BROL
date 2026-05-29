"use client";

import Link from "next/link";
import { useState } from "react";
import { Header, Navigation } from "@/components/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Crown, Zap, User, ExternalLink, Copy, Check, QrCode } from "lucide-react";
import { UserAvatar } from "@/components/profile/user-avatar";
import { QrCodeImage } from "@/components/qr/qr-code-image";
import { toast } from "sonner";

function ProgressBar({
  current,
  max,
  label,
}: {
  current: number;
  max: number | null;
  label: string;
}) {
  const isUnlimited = max === null;
  const percent = isUnlimited ? 100 : Math.min((current / max) * 100, 100);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {isUnlimited ? "∞" : `${current}/${max}`}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

const TIER_INFO = {
  FREE: {
    name: "Free",
    price: "0€",
    features: ["5 collections", "50 objets", "10 prêts simultanés"],
    color: "text-muted-foreground",
  },
  TIER_2: {
    name: "Tier 2",
    price: "3€/mois",
    features: ["10 collections", "500 objets", "50 prêts simultanés"],
    color: "text-blue-400",
  },
  TIER_3: {
    name: "Tier 3",
    price: "20€/mois",
    features: ["Collections illimitées", "Objets illimités", "Prêts illimités"],
    color: "text-amber-400",
  },
};

export default function SettingsPage() {
  const { data, isLoading: tierLoading } = trpc.tier.getLimits.useQuery();
  const { data: sessionData, isLoading: sessionLoading } = trpc.auth.me.useQuery();
  const { data: meData } = trpc.users.me.useQuery();
  const user = sessionData?.user;
  const handle = meData?.handle ?? null;
  const isLoading = tierLoading || sessionLoading;
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);

  const profileUrl =
    handle && typeof window !== "undefined"
      ? `${window.location.origin}/profile/${handle}`
      : null;

  async function handleCopyHandle() {
    if (!handle) return;
    try {
      await navigator.clipboard.writeText(`#${handle}`);
      setCopied(true);
      toast.success("Handle copié");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Impossible de copier");
    }
  }

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

  const currentTier = data?.tier ?? "FREE";
  const limits = data?.limits;

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        <h1 className="font-display text-3xl vhs-text-glow text-primary">
          PARAMÈTRES
        </h1>

        {/* Mon Profil section */}
        <div className="card-vhs p-6 space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl vhs-text-glow text-primary">
              MON PROFIL
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <UserAvatar
              name={user?.name}
              image={user?.image}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-lg truncate">
                {user?.name || "Sans nom"}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {user?.email || ""}
              </p>
            </div>
            <Link href={user?.id ? `/profile/${handle ?? user.id}` : "#"}>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-1" />
                Voir
              </Button>
            </Link>
          </div>

          {/* Handle + QR */}
          {handle && (
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Mon identifiant
                  </p>
                  <p className="font-mono text-lg text-primary truncate">
                    #{handle}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyHandle}
                  aria-label="Copier l'identifiant"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQr((v) => !v)}
                  aria-label="Afficher le QR code"
                >
                  <QrCode className="w-4 h-4" />
                </Button>
              </div>

              {showQr && profileUrl && (
                <div className="flex flex-col items-center gap-2 pt-2">
                  <QrCodeImage code={profileUrl} size={200} />
                  <p className="font-mono text-xs text-muted-foreground text-center">
                    Scannez pour m'ajouter comme ami
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tier section */}
        <div className="card-vhs p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Crown className={`w-5 h-5 ${TIER_INFO[currentTier as keyof typeof TIER_INFO]?.color ?? "text-muted-foreground"}`} />
            <h2 className="font-display text-xl vhs-text-glow text-primary">
              MON PLAN
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className={`font-display text-lg ${TIER_INFO[currentTier as keyof typeof TIER_INFO]?.color ?? "text-primary"}`}>
                {TIER_INFO[currentTier as keyof typeof TIER_INFO]?.name ?? currentTier}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {TIER_INFO[currentTier as keyof typeof TIER_INFO]?.price ?? ""}
              </p>
            </div>
            {currentTier === "FREE" && (
              <Button size="sm" asChild>
                <a href="#" className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  Upgrade
                </a>
              </Button>
            )}
          </div>

          {limits && (
            <div className="space-y-4 pt-2">
              <ProgressBar
                label="Collections"
                current={limits.collections.current}
                max={limits.collections.max}
              />
              <ProgressBar
                label="Objets"
                current={limits.objects.current}
                max={limits.objects.max}
              />
              <ProgressBar
                label="Prêts actifs"
                current={limits.activeLoans.current}
                max={limits.activeLoans.max}
              />
            </div>
          )}
        </div>

        {/* Available upgrades */}
        {currentTier !== "TIER_3" && (
          <div className="card-vhs p-4 sm:p-6 space-y-3">
            <h2 className="font-display text-lg vhs-text-glow text-primary">
              UPGRADE DISPONIBLE
            </h2>
            <div className="space-y-3">
              {currentTier === "FREE" && (
                <div className="p-3 sm:p-4 border border-blue-500/30 rounded-lg bg-blue-500/5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <span className="font-display text-blue-400">TIER 2</span>
                    <span className="font-mono text-sm text-blue-400">3€/mois</span>
                  </div>
                  <ul className="space-y-1 mb-3">
                    {TIER_INFO.TIER_2.features.map((f) => (
                      <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-blue-400">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" className="w-full" variant="outline">
                    <Zap className="w-4 h-4 mr-1" />
                    Choisir Tier 2
                  </Button>
                </div>
              )}
              {currentTier !== "TIER_2" && (
                <div className="p-3 sm:p-4 border border-amber-500/30 rounded-lg bg-amber-500/5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <span className="font-display text-amber-400">TIER 3</span>
                    <span className="font-mono text-sm text-amber-400">20€/mois</span>
                  </div>
                  <ul className="space-y-1 mb-3">
                    {TIER_INFO.TIER_3.features.map((f) => (
                      <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-amber-400">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" className="w-full" variant="outline">
                    <Zap className="w-4 h-4 mr-1" />
                    Choisir Tier 3
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
}
