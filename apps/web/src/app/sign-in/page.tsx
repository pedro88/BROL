/**
 * Page de connexion et inscription par email + mot de passe.
 *
 * OAuth (Google, GitHub, Apple) — commented out for future use.
 *
 * @package @brol/web
 */

"use client";

import { signInEmailPassword, signUpEmailPassword } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const callbackUrl = typeof window !== "undefined"
      ? new URL(window.location.href).searchParams.get("callbackUrl") ?? "/"
      : "/";

    try {
      if (mode === "signin") {
        const result = await signInEmailPassword(email, password, callbackUrl);
        if (result.error) {
          setError(result.error);
        } else {
          router.push(callbackUrl);
          router.refresh();
        }
      } else {
        const result = await signUpEmailPassword(email, password, name, callbackUrl);
        if (result.error) {
          setError(result.error);
        } else {
          router.push(callbackUrl);
          router.refresh();
        }
      }
    } finally {
      setLoading(false);
    }
  }

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
          {mode === "signup" && (
            <div className="space-y-1">
              <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider" htmlFor="name">
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

          <div className="space-y-1">
            <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider" htmlFor="email">
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

          <div className="space-y-1">
            <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder={mode === "signup" ? "Min. 8 caractères" : "••••••••"}
              className="w-full px-4 py-3 bg-background border-2 border-primary/30 rounded-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:shadow-[0_0_8px_rgba(var(--primary))] transition-all"
            />
          </div>

          {error && (
            <div className="px-4 py-3 border-2 border-destructive/60 rounded-sm bg-destructive/10">
              <p className="font-mono text-xs text-destructive">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
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
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setEmail("");
              setPassword("");
              setName("");
            }}
            className="font-mono text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            {mode === "signin"
              ? "Pas encore de compte ? Créez-en un."
              : "Déjà un compte ? Connectez-vous."}
          </button>
        </div>

        {/*
          OAuth providers — commented out for future use.
          Uncomment the buttons below and remove this block to re-enable OAuth.
        */}
        {/*
        <div className="mt-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-background font-mono text-xs text-muted-foreground">
                Ou continuer avec
              </span>
            </div>
          </div>
          <OAuthButton
            provider="google"
            label="Google"
            loading={loading}
            onClick={handleOAuthSignIn}
          />
          <OAuthButton
            provider="github"
            label="GitHub"
            loading={loading}
            onClick={handleOAuthSignIn}
          />
        </div>
        */}
      </div>
    </div>
  );
}

/*
  OAuthButton — commented out for future use.

  function OAuthButton({
    provider,
    label,
    loading,
    onClick,
  }: {
    provider: "google" | "github";
    label: string;
    loading: boolean;
    onClick: (p: "google" | "github") => void;
  }) {
    const iconPaths: Record<string, string> = {
      google: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z M12 23c2.97 0 5.46-1.97 6.38-4.83H12v-2.77h-.12-.03c-.56.96-1.47 1.74-2.88 1.74-.88 0-1.69-.28-2.35-.78-1.67-1.28-1.47-3.89-.21-5.59l3.74.97-.17.47c-.55 1.52.13 3.19 1.89 3.19.53 0 1.04-.15 1.4-.42z M12 4.36c1.59 0 3.03.55 4.16 1.63L18.15 3.1c-1.53-.96-3.55-1.54-6.15-1.54-4.73 0-8.59 3.84-8.59 8.59 0 2.29.9 4.38 2.38 5.87l3.66-3.66C10.54 9.67 11.23 8.43 12 8.43c.81 0 1.55.31 2.12.82l2.72-2.72c-1.25-1.03-2.83-1.64-4.84-1.64z",
      github: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
    };

    const buttonColors: Record<string, string> = {
      google: "bg-white hover:bg-gray-100 text-gray-900 border-gray-300",
      github: "bg-[#24292f] hover:bg-[#3b434b] text-white border-transparent",
    };

    return (
      <button
        onClick={() => onClick(provider)}
        disabled={loading}
        className={`
          w-full flex items-center gap-3 px-4 py-3
          border-2 rounded-sm font-display text-lg
          transition-all hover:scale-[1.02] active:scale-[0.98]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${buttonColors[provider]}
        `}
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0" fill="currentColor">
          <path d={iconPaths[provider]} />
        </svg>
        <span className="flex-1 text-left">
          {loading ? "Redirection..." : `Continuer avec ${label}`}
        </span>
      </button>
    );
  }
*/
