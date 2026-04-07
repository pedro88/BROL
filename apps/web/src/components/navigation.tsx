import Link from "next/link";
import { Home, BookOpen, Repeat, Users, QrCode, Settings } from "lucide-react";

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
 */
export function Header() {
  return (
    <header className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="relative">
            <span className="font-display text-3xl vhs-text-glow text-primary">
              BROL
            </span>
            <span className="absolute -top-1 -right-2 text-xs font-mono text-secondary vhs-text-glow-cyan">
              BETA
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Actions header */}
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
