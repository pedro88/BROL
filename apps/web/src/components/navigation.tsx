"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Home, BookOpen, Repeat, Users, QrCode, Settings, LogIn, LogOut, Bell, Mail, Menu, Trophy } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { signOut } from "@/lib/auth-client";
import { setSessionToken, sessionTokenStore, getSessionToken } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogoMark, BROL_TAGLINE } from "./logo";
import { LanguageSwitcher } from "./language-switcher";
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
  { href: "/", labelKey: "home", icon: Home },
  { href: "/collections", labelKey: "collections", icon: BookOpen },
  { href: "/loans", labelKey: "loans", icon: Repeat },
  { href: "/contacts", labelKey: "contacts", icon: Users },
  { href: "/qr", labelKey: "qrCodes", icon: QrCode },
] as const;

export function Navigation() {
  const t = useTranslations("nav");
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
              {t(item.labelKey)}
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

function useMessagesUnread(enabled: boolean): number {
  const { data } = trpc.messages.unreadCount.useQuery(undefined, {
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
  const t = useTranslations();
  const isAuthenticated = !!token;
  const unreadCount = useUnreadCount(isAuthenticated);
  const messagesUnread = useMessagesUnread(isAuthenticated);
  const notifAria =
    unreadCount > 0 ? `${t("nav.notifications")} (${unreadCount})` : t("nav.notifications");
  const messagesAria =
    messagesUnread > 0 ? `${t("nav.messages")} (${messagesUnread})` : t("nav.messages");

  async function handleLogout() {
    await signOut();
    setSessionToken(undefined);
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3 no-underline group">
          <div className="relative">
            <LogoMark width={88} priority />
            <span className="absolute -top-1 -right-3 text-[10px] font-mono text-secondary vhs-text-glow-cyan">
              BETA
            </span>
          </div>
          <span
            className="hidden sm:inline font-mono text-[10px] text-secondary/80 uppercase tracking-widest"
            aria-label={BROL_TAGLINE}
          >
            {BROL_TAGLINE}
          </span>
        </Link>

        {/* Mobile: Hamburger menu */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-primary transition-colors"
                aria-label={t("common.menu")}
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
                      {t("nav.notifications")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages" className="flex items-center gap-2">
                      <span className="relative">
                        <Mail className="w-4 h-4" />
                        <NotifBadge count={messagesUnread} />
                      </span>
                      {t("nav.messages")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/badges" className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      {t("nav.badges")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {isAuthenticated ? (
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    {t("nav.settings")}
                  </Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/sign-in" className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    {t("auth.signIn")}
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
                    {t("auth.signOut")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop: Inline actions */}
        <div className="hidden md:flex items-center gap-1">
          <LanguageSwitcher />

          {isAuthenticated && (
            <Link
              href="/notifications"
              className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label={notifAria}
            >
              <Bell className="w-5 h-5" strokeWidth={1.5} />
              <NotifBadge count={unreadCount} />
            </Link>
          )}

          {isAuthenticated && (
            <Link
              href="/messages"
              className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label={messagesAria}
            >
              <Mail className="w-5 h-5" strokeWidth={1.5} />
              <NotifBadge count={messagesUnread} />
            </Link>
          )}

          {isAuthenticated && (
            <Link
              href="/badges"
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label={t("nav.badges")}
            >
              <Trophy className="w-5 h-5" strokeWidth={1.5} />
            </Link>
          )}

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 p-2 text-muted-foreground hover:text-destructive transition-colors"
              aria-label={t("auth.signOut")}
            >
              <LogOut className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-xs font-mono uppercase">{t("auth.signOut")}</span>
            </button>
          ) : (
            <Link
              href="/sign-in"
              className="flex items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label={t("auth.signIn")}
            >
              <LogIn className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-xs font-mono uppercase">{t("auth.signIn")}</span>
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
