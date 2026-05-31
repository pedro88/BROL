"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header, Navigation } from "@/components/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Zap, User, ExternalLink, Copy, Check, QrCode, Pencil, Loader2, X } from "lucide-react";
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
  const utils = trpc.useUtils();
  const { data, isLoading: tierLoading } = trpc.tier.getLimits.useQuery();
  const { data: sessionData, isLoading: sessionLoading } = trpc.auth.me.useQuery();
  const { data: meData } = trpc.users.me.useQuery();
  const user = sessionData?.user;
  const handle = meData?.handle ?? null;
  const isLoading = tierLoading || sessionLoading;
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handle edit state
  const [isEditingHandle, setIsEditingHandle] = useState(false);
  const [handleInput, setHandleInput] = useState("");
  const [debouncedHandle, setDebouncedHandle] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedHandle(handleInput), 400);
    return () => clearTimeout(t);
  }, [handleInput]);

  const normalizedInput = debouncedHandle.trim().replace(/^#/, "").toLowerCase();
  const hasMeaningfulInput = normalizedInput.length >= 3;
  const isSameAsCurrent = normalizedInput === handle;

  const availabilityQuery = trpc.users.checkHandleAvailability.useQuery(
    { handle: normalizedInput },
    {
      enabled: isEditingHandle && hasMeaningfulInput && !isSameAsCurrent,
      staleTime: 0,
    },
  );

  const updateMutation = trpc.users.updateHandle.useMutation({
    onSuccess: () => {
      toast.success("Pseudo mis à jour");
      utils.users.me.invalidate();
      setIsEditingHandle(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  function startEdit() {
    setHandleInput(handle ?? "");
    setDebouncedHandle(handle ?? "");
    setIsEditingHandle(true);
  }

  function cancelEdit() {
    setIsEditingHandle(false);
    setHandleInput("");
    setDebouncedHandle("");
  }

  function submitHandle() {
    const value = handleInput.trim().replace(/^#/, "").toLowerCase();
    if (!value || value === handle) {
      cancelEdit();
      return;
    }
    updateMutation.mutate({ handle: value });
  }

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

  const queryData = availabilityQuery.data;
  const checkStatus: "idle" | "checking" | "available" | "taken" | "reserved" | "invalid" = !isEditingHandle
    ? "idle"
    : !hasMeaningfulInput
      ? "invalid"
      : isSameAsCurrent
        ? "idle"
        : availabilityQuery.isFetching
          ? "checking"
          : queryData?.available
            ? "available"
            : queryData && !queryData.available && "reason" in queryData
              ? queryData.reason
              : "invalid";

  const canSubmit =
    isEditingHandle &&
    hasMeaningfulInput &&
    !isSameAsCurrent &&
    checkStatus === "available" &&
    !updateMutation.isPending;

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
              {isEditingHandle ? (
                <div className="space-y-2">
                  <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                    Modifier mon pseudo
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg text-muted-foreground">#</span>
                    <Input
                      autoFocus
                      value={handleInput}
                      onChange={(e) => setHandleInput(e.target.value.replace(/^#/, ""))}
                      placeholder="ex. piet1234"
                      maxLength={20}
                      className="font-mono"
                      aria-label="Pseudo"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={cancelEdit}
                      aria-label="Annuler"
                      disabled={updateMutation.isPending}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={submitHandle}
                      disabled={!canSubmit}
                      aria-label="Enregistrer le pseudo"
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <HandleCheckHint status={checkStatus} />
                </div>
              ) : (
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
                    onClick={startEdit}
                    aria-label="Modifier le pseudo"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
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
              )}

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

        {/* Informations personnelles */}
        <PersonalInfoSection userId={user?.id ?? null} />

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

function HandleCheckHint({
  status,
}: {
  status: "idle" | "checking" | "available" | "taken" | "reserved" | "invalid";
}) {
  if (status === "idle") return null;
  const map: Record<typeof status, { label: string; color: string }> = {
    checking: { label: "Vérification…", color: "text-muted-foreground" },
    available: { label: "✓ Pseudo disponible", color: "text-emerald-500" },
    taken: { label: "✗ Pseudo déjà utilisé", color: "text-destructive" },
    reserved: { label: "✗ Pseudo réservé", color: "text-destructive" },
    invalid: {
      label: "✗ 3 à 20 caractères, lettres minuscules et chiffres uniquement",
      color: "text-destructive",
    },
  };
  const { label, color } = map[status];
  return <p className={`font-mono text-xs ${color}`}>{label}</p>;
}

/**
 * Section "Informations personnelles" : champs perso optionnels (birthYear,
 * gender, phone) + toggles de visibilité publique par champ. Tout est privé
 * par défaut sauf la ville (déjà utilisée pour matching).
 */
function PersonalInfoSection({ userId }: { userId: string | null }) {
  const { data, isLoading } = trpc.profile.get.useQuery(
    { userId: userId ?? "" },
    { enabled: !!userId },
  );
  const utils = trpc.useUtils();
  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      if (userId) utils.profile.get.invalidate({ userId });
      toast.success("Profil mis à jour");
    },
    onError: (err) => {
      toast.error(err.message || "Erreur lors de la mise à jour");
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
        toast.error(`Année invalide (1900 - ${currentYear}).`);
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
          INFORMATIONS PERSONNELLES
        </h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Tout est optionnel et privé par défaut. Cochez "Public" pour rendre un
        champ visible sur votre profil.
      </p>

      <div className="space-y-4">
        <FieldRow label="Email" hint={data?.email ?? ""}>
          <Toggle
            checked={visibility.publicEmail}
            onChange={() => toggle("publicEmail")}
          />
        </FieldRow>

        <FieldRow label="Ville" hint={data?.city ?? "Non renseignée"}>
          <Toggle
            checked={visibility.publicCity}
            onChange={() => toggle("publicCity")}
          />
        </FieldRow>

        <FieldRow label="Année de naissance">
          <Input
            type="number"
            inputMode="numeric"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            placeholder="ex: 1985"
            min={1900}
            max={currentYear}
            className="w-32"
          />
          <Toggle
            checked={visibility.publicBirthYear}
            onChange={() => toggle("publicBirthYear")}
          />
        </FieldRow>

        <FieldRow label="Genre">
          <Input
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            placeholder="ex: F, H, X, ou autre"
            maxLength={32}
            className="w-40"
          />
          <Toggle
            checked={visibility.publicGender}
            onChange={() => toggle("publicGender")}
          />
        </FieldRow>

        <FieldRow label="Téléphone">
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+32 ..."
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
            "Enregistrer"
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
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <span className="text-[10px] font-mono uppercase text-muted-foreground">
        Public
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
