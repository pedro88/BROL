"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Home, BookOpen, Repeat, Users, QrCode, Settings, LogIn, LogOut, Bell } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { signOut } from "@/lib/auth-client";
import { setSessionToken, sessionTokenStore, getSessionToken } from "@/lib/auth-store";
import { useRouter } from "next/navigation";

/**
 * React hook to read the session token store.
 * Uses useSyncExternalStore for React 19 compatibility.
 */
function useSessionToken(): string | undefined {
  return useSyncExternalStore(
    (callback) => {
      const unsub = sessionTokenStore.subscribe(callback);
      return unsub;
    },
    () => getSessionToken(),
    () => undefined, // server snapshot
  );
}

/**
 * Structure de navigation principale.
 * @decisions Navigation bottom-bar pour mobile-first,，侧栏 optionnelle pour desktop.
 */
const navItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/collections", label: "Collections", icon: BookOpen },
  { href: "/loans", label: "Prêts", icon: Repeat },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/qr", label: "QR Codes", icon: QrCode },
];

export function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur border-t border-border">
      <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <item.icon className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-xs font-mono uppercase tracking-wider">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

/**
 * Header principal de l'application.
 * Affiche le logo BROL et un bouton Login/Logout selon l'état de session.
 */
export function Header() {
  const token = useSessionToken();
  const router = useRouter();
  const isAuthenticated = !!token;

  async function handleLogout() {
    await signOut();
    setSessionToken(undefined);
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Logo — links to homepage */}
          <Link href="/" className="relative no-underline">
            <span className="font-display text-3xl vhs-text-glow text-primary">
              BROL
            </span>
            <span className="absolute -top-1 -right-2 text-xs font-mono text-secondary vhs-text-glow-cyan">
              BETA
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1">
          {isAuthenticated && (
            <Link
              href="/notifications"
              className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" strokeWidth={1.5} />
            </Link>
          )}

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 p-2 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-xs font-mono uppercase">Logout</span>
            </button>
          ) : (
            <Link
              href="/sign-in"
              className="flex items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Login"
            >
              <LogIn className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-xs font-mono uppercase">Login</span>
            </Link>
          )}

          {/* Settings — always visible, protected by middleware */}
          <Link
            href="/settings"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="w-5 h-5" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </header>
  );
}
