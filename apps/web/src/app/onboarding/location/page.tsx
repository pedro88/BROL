"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COUNTRIES } from "@/lib/countries";
import { Loader2, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const LOC_COOKIE_NAME = "brol_loc_complete";
const ONE_YEAR_SEC = 60 * 60 * 24 * 365;

function setLocationCookie() {
  if (typeof document === "undefined") return;
  const isHttps =
    typeof window !== "undefined" && window.location.protocol === "https:";
  const secure = isHttps ? "; Secure" : "";
  document.cookie = `${LOC_COOKIE_NAME}=1; Path=/; Max-Age=${ONE_YEAR_SEC}; SameSite=Lax${secure}`;
}

export default function OnboardingLocationPage() {
  const utils = trpc.useUtils();
  const { data: me, isLoading: meLoading } = trpc.users.me.useQuery();

  const [country, setCountry] = useState("BE");
  const [postalCode, setPostalCode] = useState("");
  const [debouncedCp, setDebouncedCp] = useState("");

  const isAlreadyComplete = !!me?.postalCode;

  // Si user a déjà une localisation → sync cookie + redirect dashboard.
  // Hard nav pour que le middleware Next relise le cookie posé.
  useEffect(() => {
    if (isAlreadyComplete) {
      setLocationCookie();
      window.location.assign("/");
    }
  }, [isAlreadyComplete]);

  // Debounce CP input (400 ms) → preview query.
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedCp(postalCode.trim());
    }, 400);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [postalCode]);

  const previewEnabled = useMemo(
    () => debouncedCp.length >= 3 && /^[A-Za-z0-9 -]{3,10}$/.test(debouncedCp),
    [debouncedCp],
  );

  const preview = trpc.users.previewLocation.useQuery(
    { country, postalCode: debouncedCp },
    {
      enabled: previewEnabled,
      retry: false,
    },
  );

  const updateLocation = trpc.users.updateLocation.useMutation({
    onSuccess: async () => {
      setLocationCookie();
      toast.success("Localisation enregistrée");
      // Purge le cache `users.me` pour que dashboard + middleware client
      // voient le nouveau `postalCode` immédiatement.
      await utils.users.me.invalidate();
      // Hard nav plutôt que router.replace : force le middleware Next à
      // relire le cookie fraîchement posé et évite tout état React-Query
      // résiduel d'avant la mise à jour.
      window.location.assign("/");
    },
    onError: (err) => {
      toast.error(err.message || "Impossible d'enregistrer la localisation");
    },
  });

  const canSubmit = preview.data != null && !updateLocation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    updateLocation.mutate({ country, postalCode: postalCode.trim() });
  }

  if (meLoading || isAlreadyComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Complétez votre profil</h1>
            <p className="text-sm text-muted-foreground">
              Indiquez votre code postal pour utiliser les demandes communauté.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="country" className="text-sm font-medium">
              Pays
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="postalCode" className="text-sm font-medium">
              Code postal
            </label>
            <Input
              id="postalCode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="ex: 1000"
              autoComplete="postal-code"
              maxLength={10}
            />
            <PreviewHint
              enabled={previewEnabled}
              loading={preview.isLoading || preview.isFetching}
              error={preview.isError}
              city={preview.data?.city ?? null}
              notFound={preview.data === null}
            />
          </div>

          <Button type="submit" disabled={!canSubmit} className="w-full">
            {updateLocation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Continuer"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

function PreviewHint({
  enabled,
  loading,
  error,
  city,
  notFound,
}: {
  enabled: boolean;
  loading: boolean;
  error: boolean;
  city: string | null;
  notFound: boolean;
}) {
  if (!enabled) {
    return (
      <p className="text-xs text-muted-foreground">
        Au moins 3 caractères.
      </p>
    );
  }
  if (loading) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Recherche…
      </p>
    );
  }
  if (error) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-destructive">
        <XCircle className="h-3 w-3" />
        Service indisponible, réessayez.
      </p>
    );
  }
  if (city) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        {city}
      </p>
    );
  }
  if (notFound) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-destructive">
        <XCircle className="h-3 w-3" />
        Code postal inconnu pour ce pays.
      </p>
    );
  }
  return null;
}
