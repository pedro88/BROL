/**
 * Page de connexion OAuth.
 * Affiche les boutons Google, GitHub et Apple pour l'authentification.
 *
 * @package @brol/web
 */

"use client";

import { oauthSignIn } from "@/lib/auth-client";
import { useState } from "react";

export default function SignInPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSignIn(provider: "google" | "github" | "apple") {
    setLoading(provider);
    try {
      await oauthSignIn(provider, "/");
    } catch (err) {
      console.error("Sign in failed:", err);
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl mb-2 vhs-text-glow text-primary">
            CONNEXION
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            &gt; Accédez à votre espace Brol_
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-4">
          <OAuthButton
            provider="google"
            label="Connexion avec Google"
            loading={loading}
            onClick={handleSignIn}
          />
          <OAuthButton
            provider="github"
            label="Connexion avec GitHub"
            loading={loading}
            onClick={handleSignIn}
          />
          <OAuthButton
            provider="apple"
            label="Connexion avec Apple"
            loading={loading}
            onClick={handleSignIn}
          />
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center font-mono text-xs text-muted-foreground">
         Aucun mot de passe requis — authentification sécurisée via votre compte.
        </p>
      </div>
    </div>
  );
}

function OAuthButton({
  provider,
  label,
  loading,
  onClick,
}: {
  provider: "google" | "github" | "apple";
  label: string;
  loading: string | null;
  onClick: (p: "google" | "github" | "apple") => void;
}) {
  const isLoading = loading === provider;

  const iconPaths: Record<string, string> = {
    google: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z M12 23c2.97 0 5.46-1.97 6.38-4.83H12v-2.77h-.12-.03c-.56.96-1.47 1.74-2.88 1.74-.88 0-1.69-.28-2.35-.78-1.67-1.28-1.47-3.89-.21-5.59l3.74.97-.17.47c-.55 1.52.13 3.19 1.89 3.19.53 0 1.04-.15 1.4-.42z M12 4.36c1.59 0 3.03.55 4.16 1.63L18.15 3.1c-1.53-.96-3.55-1.54-6.15-1.54-4.73 0-8.59 3.84-8.59 8.59 0 2.29.9 4.38 2.38 5.87l3.66-3.66C10.54 9.67 11.23 8.43 12 8.43c.81 0 1.55.31 2.12.82l2.72-2.72c-1.25-1.03-2.83-1.64-4.84-1.64z",
    github: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
    apple: "M17.05 20.28c-.98-.01-1.77-.78-2.87-.78-1.14 0-2.23.8-2.87.8-.7 0-2.37-.81-3.92-.81-2.51 0-4.41 1.84-4.41 5.03 0 3.02 2.01 4.87 4.32 4.87.74 0 2.13-.32 3.39-.32 1.23 0 2.75.35 3.39.32 2.71-54.41-3.83-4.07-3.83-4.07-1.14.66-2.17.93-2.17 1.86 0 1.17.96 1.71 2.01 2.01.94.27 1.88.35 3.47.4 2.19.07 3.92-.7 4.95-.7.69 0 2.36.63 2.36 2.1 0 2.28-2.85 2.69-2.85 3.78 0 1.56 2.33 1.49 2.33.91-.01 1.07-.63 2.08-2.34 2.08-2.34.03-3.8-1.21-3.8-2.91z M12.27 3.11c-.65 0-1.27.25-1.65.65-.07.07-.14.14-.2.22-.34.05-.69.07-1.05.07-.36 0-.71-.02-1.05-.07-.07-.08-.13-.15-.2-.22-.38-.4-1-.65-1.65-.65-.65 0-1.27.25-1.65.65-.07.07-.14.14-.2.22-.34.05-.69.07-1.05.07s-.71-.02-1.05-.07c-.07-.08-.13-.15-.2-.22-.38-.4-1-.65-1.65-.65-.65 0-1.27.25-1.65.65-.07.07-.14.14-.2.22-.34.05-.69.07-1.05.07-.36 0-.71-.02-1.05-.07-.07-.08-.13-.15-.2-.22-.38-.4-1-.65-1.65-.65s-1.27.25-1.65.65c-.07.07-.14.14-.2.22-.34.05-.69.07-1.05.07s-.71-.02-1.05-.07c-.07-.08-.13-.15-.2-.22-.38-.4-1-.65-1.65-.65s-1.27.25-1.65.65c-.07.07-.14.14-.2.22-.34.05-.69.07-1.05.07-.36 0-.71-.02-1.05-.07-.07-.08-.13-.15-.2-.22-.38-.4-1-.65-1.65-.65s-1.27.25-1.65.65c-.07.07-.14.14-.2.22-.34.05-.69.07-1.05.07-.36 0-.71-.02-1.05-.07-.07-.08-.13-.15-.2-.22-.38-.4-1-.65-1.65-.65-.65 0-1.27.25-1.65.65-.07.07-.14.14-.2.22-.34.05-.69.07-1.05.07-.36 0-.71-.02-1.05-.07-.07-.08-.13-.15-.2-.22-.38-.4-1-.65-1.65-.65s-1.27.25-1.65.65c-.07.07-.14.14-.2.22-.34.05-.69.07-1.05.07-.36 0-.71-.02-1.05-.07-.07-.08-.13-.15-.2-.22-.38-.4-1-.65-1.65-.65s-1.27.25-1.65.65c-.07.07-.14.14-.2.22-.34.05-.69.07-1.05.07-.36 0-.71-.02-1.05-.07-.07-.08-.13-.15-.2-.22-.38-.4-1-.65-1.65-.65",
  };

  const buttonColors: Record<string, string> = {
    google: "bg-white hover:bg-gray-100 text-gray-900 border-gray-300",
    github: "bg-[#24292f] hover:bg-[#3b434b] text-white border-transparent",
    apple: "bg-black hover:bg-gray-800 text-white border-transparent",
  };

  return (
    <button
      onClick={() => onClick(provider)}
      disabled={isLoading}
      className={`
        w-full flex items-center gap-3 px-4 py-3
        border-2 rounded-sm font-display text-lg
        transition-all hover:scale-[1.02] active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${buttonColors[provider]}
      `}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-6 h-6 flex-shrink-0"
        fill="currentColor"
      >
        <path d={iconPaths[provider]} />
      </svg>
      <span className="flex-1 text-left">{isLoading ? "Redirection..." : label}</span>
      {isLoading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
    </button>
  );
}
