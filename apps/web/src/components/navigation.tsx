"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Home, BookOpen, Repeat, Users, QrCode, Settings, LogIn, LogOut, Bell, Menu } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { signOut } from "@/lib/auth-client";
import { setSessionToken, sessionTokenStore, getSessionToken } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around py-2 sm:py-3 max-w-lg mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-2 sm:px-3 py-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <item.icon className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider">
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
 * - Mobile: menu hamburger avec DropdownMenu
 * - Desktop: actions inline (notifications, login/logout, settings)
 */
function useUnreadCount(enabled: boolean): number {
  const { data } = trpc.notification.unreadCount.useQuery(undefined, {
    enabled,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
  return data?.count ?? 0;
}

function NotifBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-mono flex items-center justify-center"
      aria-label={`${count} notification${count > 1 ? "s" : ""} non lue${count > 1 ? "s" : ""}`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function Header() {
  const token = useSessionToken();
  const router = useRouter();
  const isAuthenticated = !!token;
  const unreadCount = useUnreadCount(isAuthenticated);

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
          <Link href="/" className="relative no-underline">
            <span className="font-display text-3xl vhs-text-glow text-primary">
              BROL
            </span>
            <span className="absolute -top-1 -right-2 text-xs font-mono text-secondary vhs-text-glow-cyan">
              BETA
            </span>
          </Link>
        </div>

        {/* Mobile: Hamburger menu */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-primary transition-colors"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isAuthenticated && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/notifications" className="flex items-center gap-2">
                      <span className="relative">
                        <Bell className="w-4 h-4" />
                        <NotifBadge count={unreadCount} />
                      </span>
                      Notifications
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {isAuthenticated ? (
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Paramètres
                  </Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/sign-in" className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Connexion
                  </Link>
                </DropdownMenuItem>
              )}
              {isAuthenticated && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop: Inline actions */}
        <div className="hidden md:flex items-center gap-1">
          {isAuthenticated && (
            <Link
              href="/notifications"
              className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lue${unreadCount > 1 ? "s" : ""})` : ""}`}
            >
              <Bell className="w-5 h-5" strokeWidth={1.5} />
              <NotifBadge count={unreadCount} />
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
