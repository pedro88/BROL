"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header, Navigation } from "@/components/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Zap, User, ExternalLink, Copy, Check, QrCode, Loader2 } from "lucide-react";
import { UserAvatar } from "@/components/profile/user-avatar";
import { QrCodeImage } from "@/components/qr/qr-code-image";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ThemeSection } from "@/components/theme-section";

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
    featureKeys: [
      "settings.tier.free.feature1",
      "settings.tier.free.feature2",
      "settings.tier.free.feature3",
    ],
    color: "text-muted-foreground",
  },
  TIER_2: {
    name: "Tier 2",
    price: "3€",
    featureKeys: [
      "settings.tier.tier2.feature1",
      "settings.tier.tier2.feature2",
      "settings.tier.tier2.feature3",
    ],
    color: "text-blue-400",
  },
  TIER_3: {
    name: "Tier 3",
    price: "20€",
    featureKeys: [
      "settings.tier.tier3.feature1",
      "settings.tier.tier3.feature2",
      "settings.tier.tier3.feature3",
    ],
    color: "text-amber-400",
  },
};

export default function SettingsPage() {
  const t = useTranslations();
  const utils = trpc.useUtils();
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
      toast.success(t("settings.copiedSuccess"));
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(t("settings.copyError"));
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
          {t("settings.title")}
        </h1>

        {/* Apparence : choix du thème graphique (persiste + suit l'utilisateur) */}
        <ThemeSection initialTheme={meData?.theme} />

        {/* Mon Profil section */}
        <div className="card-vhs p-6 space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl vhs-text-glow text-primary">
              {t("settings.myProfileTitle")}
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
                {user?.name || t("settings.noName")}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {user?.email || ""}
              </p>
            </div>
            <Link href={user?.id ? `/profile/${handle ?? user.id}` : "#"}>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-1" />
                {t("settings.viewButton")}
              </Button>
            </Link>
          </div>

          {/* Handle + QR (handle immuable — pas de bouton modifier) */}
          {handle && (
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {t("settings.handleLabel")}
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
                  aria-label={t("settings.copyHandleLabel")}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQr((v) => !v)}
                  aria-label={t("settings.showQrLabel")}
                >
                  <QrCode className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("settings.handleHint")}
              </p>

              {showQr && profileUrl && (
                <div className="flex flex-col items-center gap-2 pt-2">
                  <QrCodeImage code={profileUrl} size={200} />
                  <p className="font-mono text-xs text-muted-foreground text-center">
                    {t("settings.scanQrHint")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Informations personnelles */}
        <PersonalInfoSection userId={user?.id ?? null} />

        {/* Tier section */}
        <div className="card-vhs p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Crown className={`w-5 h-5 ${TIER_INFO[currentTier as keyof typeof TIER_INFO]?.color ?? "text-muted-foreground"}`} />
            <h2 className="font-display text-xl vhs-text-glow text-primary">
              {t("settings.myPlanTitle")}
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className={`font-display text-lg ${TIER_INFO[currentTier as keyof typeof TIER_INFO]?.color ?? "text-primary"}`}>
                {TIER_INFO[currentTier as keyof typeof TIER_INFO]?.name ?? currentTier}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {TIER_INFO[currentTier as keyof typeof TIER_INFO]?.price ?? ""}
                {currentTier !== "FREE" ? t("settings.perMonth") : ""}
              </p>
            </div>
            {currentTier === "FREE" && (
              <Button size="sm" asChild>
                <a href="#" className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  {t("settings.upgradeButton")}
                </a>
              </Button>
            )}
          </div>

          {limits && (
            <div className="space-y-4 pt-2">
              <ProgressBar
                label={t("settings.progressBarCollections")}
                current={limits.collections.current}
                max={limits.collections.max}
              />
              <ProgressBar
                label={t("settings.progressBarObjects")}
                current={limits.objects.current}
                max={limits.objects.max}
              />
              <ProgressBar
                label={t("settings.progressBarActiveLoans")}
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
              {t("settings.upgradeTitleAvailable")}
            </h2>
            <div className="space-y-3">
              {currentTier === "FREE" && (
                <div className="p-3 sm:p-4 border border-blue-500/30 rounded-lg bg-blue-500/5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <span className="font-display text-blue-400">TIER 2</span>
                    <span className="font-mono text-sm text-blue-400">3€{t("settings.perMonth")}</span>
                  </div>
                  <ul className="space-y-1 mb-3">
                    {TIER_INFO.TIER_2.featureKeys.map((k) => (
                      <li key={k} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-blue-400">✓</span> {t(k)}
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" className="w-full" variant="outline">
                    <Zap className="w-4 h-4 mr-1" />
                    {t("settings.chooseTier2Button")}
                  </Button>
                </div>
              )}
              {currentTier !== "TIER_2" && (
                <div className="p-3 sm:p-4 border border-amber-500/30 rounded-lg bg-amber-500/5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <span className="font-display text-amber-400">TIER 3</span>
                    <span className="font-mono text-sm text-amber-400">20€{t("settings.perMonth")}</span>
                  </div>
                  <ul className="space-y-1 mb-3">
                    {TIER_INFO.TIER_3.featureKeys.map((k) => (
                      <li key={k} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-amber-400">✓</span> {t(k)}
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" className="w-full" variant="outline">
                    <Zap className="w-4 h-4 mr-1" />
                    {t("settings.chooseTier3Button")}
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

/**
 * Section "Informations personnelles" : champs perso optionnels (birthYear,
 * gender, phone) + toggles de visibilité publique par champ. Tout est privé
 * par défaut sauf la ville (déjà utilisée pour matching).
 */
function PersonalInfoSection({ userId }: { userId: string | null }) {
  const t = useTranslations();
  const { data, isLoading } = trpc.profile.get.useQuery(
    { userId: userId ?? "" },
    { enabled: !!userId },
  );
  const utils = trpc.useUtils();
  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      if (userId) utils.profile.get.invalidate({ userId });
      toast.success(t("settings.profileUpdatedSuccess"));
    },
    onError: (err) => {
      toast.error(err.message || t("settings.profileUpdateError"));
    },
  });

  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [visibility, setVisibility] = useState({
    publicEmail: false,
    publicPhone: false,
    publicBirthYear: false,
    publicGender: false,
    publicCity: true,
  });
  const [hydrated, setHydrated] = useState(false);

  // Hydrate state une fois que la query revient.
  useEffect(() => {
    if (!data || hydrated) return;
    setBirthYear(data.birthYear?.toString() ?? "");
    setGender(data.gender ?? "");
    setPhone(data.phone ?? "");
    if (data.visibility) {
      setVisibility(data.visibility);
    }
    setHydrated(true);
  }, [data, hydrated]);

  if (isLoading || !userId) {
    return (
      <div className="card-vhs p-6 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  function handleSave() {
    const parsedYear = birthYear.trim() ? Number(birthYear) : null;
    if (parsedYear !== null) {
      if (
        !Number.isInteger(parsedYear) ||
        parsedYear < 1900 ||
        parsedYear > currentYear
      ) {
        toast.error(t("settings.invalidYear", { year: currentYear }));
        return;
      }
    }
    updateProfile.mutate({
      birthYear: parsedYear,
      gender: gender.trim() || null,
      phone: phone.trim() || null,
      ...visibility,
    });
  }

  function toggle(key: keyof typeof visibility) {
    setVisibility((v) => ({ ...v, [key]: !v[key] }));
  }

  return (
    <div className="card-vhs p-6 space-y-4">
      <div className="flex items-center gap-2">
        <User className="w-5 h-5 text-primary" />
        <h2 className="font-display text-xl vhs-text-glow text-primary">
          {t("settings.personalInfoTitle")}
        </h2>
      </div>
      <p className="text-xs text-muted-foreground">
        {t("settings.personalInfoHint")}
      </p>

      <div className="space-y-4">
        <FieldRow label={t("settings.emailLabel")} hint={data?.email ?? ""}>
          <Toggle
            checked={visibility.publicEmail}
            onChange={() => toggle("publicEmail")}
          />
        </FieldRow>

        <FieldRow label={t("settings.cityLabel")} hint={data?.city ?? t("settings.cityNotSet")}>
          <Toggle
            checked={visibility.publicCity}
            onChange={() => toggle("publicCity")}
          />
        </FieldRow>

        <FieldRow label={t("settings.birthYearLabel")}>
          <Input
            type="number"
            inputMode="numeric"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            placeholder={t("settings.birthYearPlaceholder")}
            min={1900}
            max={currentYear}
            className="w-32"
          />
          <Toggle
            checked={visibility.publicBirthYear}
            onChange={() => toggle("publicBirthYear")}
          />
        </FieldRow>

        <FieldRow label={t("settings.genderLabel")}>
          <Input
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            placeholder={t("settings.genderPlaceholder")}
            maxLength={32}
            className="w-40"
          />
          <Toggle
            checked={visibility.publicGender}
            onChange={() => toggle("publicGender")}
          />
        </FieldRow>

        <FieldRow label={t("settings.phoneLabel")}>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("settings.phonePlaceholder")}
            maxLength={40}
            className="w-48"
          />
          <Toggle
            checked={visibility.publicPhone}
            onChange={() => toggle("publicPhone")}
          />
        </FieldRow>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateProfile.isPending}>
          {updateProfile.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            t("common.save")
          )}
        </Button>
      </div>
    </div>
  );
}

function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="min-w-[140px]">
        <p className="text-sm font-medium">{label}</p>
        {hint && (
          <p className="text-xs text-muted-foreground font-mono truncate">
            {hint}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  const t = useTranslations();
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <span className="text-[10px] font-mono uppercase text-muted-foreground">
        {t("settings.publicToggle")}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative w-9 h-5 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background transition-transform ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </button>
    </label>
  );
}
