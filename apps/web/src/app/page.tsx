import Link from "next/link";
import { Header, Navigation } from "../components/navigation";

/**
 * Page d'accueil principale.
 * Affiche le récapitulatif de l'utilisateur et les actions rapides.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Hero section */}
        <section className="mb-8 text-center">
          <h1 className="font-display text-5xl mb-2 vhs-text-glow text-primary">
            BIENVENUE
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            &gt; Gestion de prêt simplifiée_
          </p>
        </section>

        {/* Stats rapides */}
        <section className="grid grid-cols-3 gap-3 mb-8">
          <StatCard label="Objets" value="24" trend="+2" />
          <StatCard label="Prêtés" value="3" trend="active" variant="warning" />
          <StatCard label="Contacts" value="12" />
        </section>

        {/* Actions rapides */}
        <section className="space-y-3">
          <h2 className="font-mono text-sm text-muted-foreground mb-3">
            // ACTIONS RAPIDES
          </h2>

          <QuickAction
            href="/loans/new"
            title="NOUVEAU PRÊT"
            description="Prêter un objet à un contact"
            variant="primary"
          />

          <QuickAction
            href="/objects/add"
            title="AJOUTER UN OBJET"
            description="Encoder un nouvel item"
            variant="secondary"
          />

          <QuickAction
            href="/scan"
            title="SCANNER"
            description="Scanner un QR code"
            variant="accent"
          />
        </section>

        {/* Objets prêtés récemment */}
        <section className="mt-8">
          <h2 className="font-mono text-sm text-muted-foreground mb-3">
            // RETOURS RECENTS
          </h2>

          <div className="card-vhs p-4 text-center">
            <p className="font-mono text-muted-foreground text-sm">
              Aucun prêt récent
            </p>
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
}

/**
 * Carte statistique avec valeur et tendance.
 */
function StatCard({
  label,
  value,
  trend,
  variant = "default",
}: {
  label: string;
  value: string;
  trend?: string;
  variant?: "default" | "warning" | "success";
}) {
  const variantStyles = {
    default: "text-foreground",
    warning: "text-accent",
    success: "text-secondary",
  };

  return (
    <div className="card-vhs p-3 text-center">
      <p className={`font-display text-3xl ${variantStyles[variant]}`}>{value}</p>
      <p className="font-mono text-xs text-muted-foreground uppercase">{label}</p>
      {trend && (
        <p className="font-mono text-xs text-muted-foreground mt-1">
          {trend}
        </p>
      )}
    </div>
  );
}

/**
 * Bouton d'action rapide stylisé VHS.
 */
function QuickAction({
  href,
  title,
  description,
  variant,
}: {
  href: string;
  title: string;
  description: string;
  variant: "primary" | "secondary" | "accent";
}) {
  const variantStyles = {
    primary: "border-primary hover:bg-primary hover:text-primary-foreground",
    secondary: "border-secondary hover:bg-secondary hover:text-secondary-foreground",
    accent: "border-accent hover:bg-accent hover:text-accent-foreground",
  };

  return (
    <Link
      href={href}
      className={`card-vhs block p-4 border-l-4 ${variantStyles[variant]} transition-all hover:scale-[1.02] active:scale-[0.98]`}
    >
      <h3 className="font-display text-xl mb-1">{title}</h3>
      <p className="font-mono text-xs text-muted-foreground">{description}</p>
    </Link>
  );
}
