/**
 * Page de connexion et inscription par email + mot de passe.
 *
 * OAuth (Google, GitHub, Apple) — commented out for future use.
 *
 * @package @brol/web
 */

"use client";

import { signInEmailPassword, signUpEmailPassword, getSession } from "@/lib/auth-client";
import { setSessionToken } from "@/lib/auth-store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

/**
 * Le cookie `brol_loc_complete` est posé par /onboarding/location pour
 * gate les pages protégées. Il n'est pas lié à un user — il persiste donc
 * cross-session. À chaque visite de la page de login, on le purge pour
 * que le user qui s'apprête à se (re)connecter ait son propre cycle :
 *   nouveau user / DB sans postalCode → middleware redirect onboarding.
 *   user existant avec postalCode → /onboarding/location détecte via
 *     users.me et reposte le cookie + redirect dashboard.
 */
const LOC_COOKIE_NAME = "brol_loc_complete";
function clearLocationCookie() {
  if (typeof document !== "undefined") {
    document.cookie = `${LOC_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
}

// ---------------------------------------------------------------------------
// Password strength
// ---------------------------------------------------------------------------

type StrengthLevel = "empty" | "short" | "weak" | "fair" | "strong";

function getPasswordStrength(password: string): StrengthLevel {
  if (!password) return "empty";
  if (password.length < 8) return "short";
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
  if (score >= 3 && password.length >= 12) return "strong";
  if (score >= 2) return "fair";
  return "weak";
}

const STRENGTH_CONFIG: Record<StrengthLevel, { label: string; color: string; bar: number }> = {
  empty: { label: "", color: "bg-muted", bar: 0 },
  short: { label: "Trop court", color: "bg-destructive", bar: 1 },
  weak: { label: "Faible", color: "bg-orange-500", bar: 2 },
  fair: { label: "Correct", color: "bg-yellow-500", bar: 3 },
  strong: { label: "Fort", color: "bg-green-500", bar: 4 },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // S01: password confirmation + toggle visibility
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const strength: StrengthLevel = getPasswordStrength(password);
  const strengthCfg = STRENGTH_CONFIG[strength];

  // Purge le cookie de gate localisation à chaque visite de cette page,
  // pour que le futur user soit forcé de passer par /onboarding/location.
  useEffect(() => {
    clearLocationCookie();
  }, []);

  const confirmMismatch = mode === "signup" && passwordConfirm && password !== passwordConfirm;
  const isPasswordConfirmInvalid =
    mode === "signup" && passwordConfirm && confirmMismatch;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // S01: client-side validation before submit
    if (mode === "signup") {
      if (password.length < 8) {
        setError("Le mot de passe doit contenir au moins 8 caractères.");
        return;
      }
      if (password !== passwordConfirm) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }
    }

    setLoading(true);

    const callbackUrl =
      typeof window !== "undefined"
        ? new URL(window.location.href).searchParams.get("callbackUrl") ?? "/"
        : "/";

    try {
      if (mode === "signin") {
        const result = await signInEmailPassword(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          await syncTokenToStore();
          router.push(callbackUrl);
          router.refresh();
        }
      } else {
        const result = await signUpEmailPassword(email, password, name);
        if (result.error) {
          setError(result.error);
        } else {
          await syncTokenToStore();
          router.push(callbackUrl);
          router.refresh();
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function syncTokenToStore(): Promise<void> {
    try {
      // /!\ getSession() utilise NEXT_PUBLIC_API_URL en interne — il faut taper
      // l'API Better-auth (api.brol.dev), pas le web (app.brol.dev) qui n'a pas
      // de handler /api/auth/*. Garder ce détour évite un 500 dans la console.
      const { session } = await getSession();
      if (session?.token) setSessionToken(session.token);
    } catch {
      // Non-critical — cookie auth still works
    }
  }

  function toggleMode() {
    setMode(mode === "signin" ? "signup" : "signin");
    setError(null);
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
    setName("");
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl mb-2 vhs-text-glow text-primary">
            {mode === "signin" ? "CONNEXION" : "CRÉER UN COMPTE"}
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            {mode === "signin"
              ? "> Accédez à votre espace Brol_"
              : "> Rejoignez Brol_"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name (sign-up only) */}
          {mode === "signup" && (
            <div className="space-y-1">
              <label
                className="font-mono text-xs text-muted-foreground uppercase tracking-wider"
                htmlFor="name"
              >
                Nom
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Jean Dupont"
                className="w-full px-4 py-3 bg-background border-2 border-primary/30 rounded-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:shadow-[0_0_8px_rgba(var(--primary))] transition-all"
              />
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label
              className="font-mono text-xs text-muted-foreground uppercase tracking-wider"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="jean@example.com"
              className="w-full px-4 py-3 bg-background border-2 border-primary/30 rounded-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:shadow-[0_0_8px_rgba(var(--primary))] transition-all"
            />
          </div>

          {/* Password + toggle */}
          <div className="space-y-1">
            <label
              className="font-mono text-xs text-muted-foreground uppercase tracking-wider"
              htmlFor="password"
            >
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder={mode === "signup" ? "Min. 8 caractères" : "••••••••"}
                className="w-full px-4 py-3 pr-12 bg-background border-2 border-primary/30 rounded-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:shadow-[0_0_8px_rgba(var(--primary))] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* S01: strength indicator (sign-up only) */}
            {mode === "signup" && password && (
              <div className="space-y-1">
                {/* Strength bar */}
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${strengthCfg.color}`}
                    style={{ width: `${(strengthCfg.bar / 4) * 100}%` }}
                  />
                </div>
                <p
                  className={`font-mono text-xs ${
                    strength === "strong"
                      ? "text-green-500"
                      : strength === "fair"
                      ? "text-yellow-500"
                      : "text-destructive"
                  }`}
                >
                  {strengthCfg.label}
                  {strength === "weak" && (
                    <span className="text-muted-foreground">
                      {" "}— ajoutez une majuscule, un chiffre ou un caractère spécial
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Password confirmation (sign-up only) */}
          {mode === "signup" && (
            <div className="space-y-1">
              <label
                className="font-mono text-xs text-muted-foreground uppercase tracking-wider"
                htmlFor="passwordConfirm"
              >
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  id="passwordConfirm"
                  type={showPasswordConfirm ? "text" : "password"}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Ressayez votre mot de passe"
                  className={`w-full px-4 py-3 pr-12 bg-background border-2 rounded-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all ${
                    isPasswordConfirmInvalid
                      ? "border-destructive focus:border-destructive"
                      : "border-primary/30 focus:border-primary focus:shadow-[0_0_8px_rgba(var(--primary))]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm((v) => !v)}
                  aria-label={
                    showPasswordConfirm ? "Masquer le mot de passe" : "Afficher le mot de passe"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPasswordConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {isPasswordConfirmInvalid && (
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-destructive" />
                  <p className="font-mono text-xs text-destructive">
                    Les mots de passe ne correspondent pas
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Global error */}
          {error && (
            <div className="px-4 py-3 border-2 border-destructive/60 rounded-sm bg-destructive/10">
              <p className="font-mono text-xs text-destructive">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!isPasswordConfirmInvalid}
            className="w-full px-4 py-3 bg-primary text-primary-foreground border-2 border-primary rounded-sm font-display text-xl tracking-wider uppercase hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading
              ? "..."
              : mode === "signin"
              ? "Se connecter"
              : "Créer mon compte"}
          </button>
        </form>

        {/* Mode toggle */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="font-mono text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            {mode === "signin"
              ? "Pas encore de compte ? Créez-en un."
              : "Déjà un compte ? Connectez-vous."}
          </button>
        </div>

        {/*
          OAuth providers — commented out for future use.
        */}
      </div>
    </div>
  );
}