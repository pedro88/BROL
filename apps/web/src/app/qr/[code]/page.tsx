/**
 * Page publique d'affichage d'un QR code.
 * Accessible sans authentification — permet à quiconque de scanner un objet et voir son propriétaire.
 */

import { QrCodeImage } from "../../../components/qr/qr-code-image";
import { Header } from "../../../components/navigation";
import { trpc } from "../../../lib/trpc";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function QrPublicPage({ params }: PageProps) {
  const { code } = await params;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto text-center">
        <QrPublicView code={code} />
      </main>
    </div>
  );
}

/**
 * Client component for data fetching.
 */
import { Suspense } from "react";

function QrPublicView({ code }: { code: string }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="spinner-vhs w-8 h-8" />
        </div>
      }
    >
      <QrPublicContent code={code} />
    </Suspense>
  );
}

function QrPublicContent({ code }: { code: string }) {
  const { data: qrData, isLoading } = trpc.qr.getByCode.useQuery(
    { code },
    { enabled: !!code }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner-vhs w-8 h-8" />
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className="card-vhs p-8 text-center">
        <h1 className="font-display text-2xl text-primary vhs-text-glow mb-4">
          QR INCONNU
        </h1>
        <p className="font-mono text-sm text-muted-foreground">
          Ce QR code n&apos;existe pas dans notre système.
        </p>
      </div>
    );
  }

  const object = qrData.objects?.[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-primary vhs-text-glow">
          {object?.name ?? "Objet trouvé"}
        </h1>
        {object?.name && (
          <p className="font-mono text-sm text-muted-foreground mt-1">
            par BROL
          </p>
        )}
      </div>

      <div className="card-vhs p-6 flex flex-col items-center gap-4">
        <QrCodeImage code={code} size={220} />
        <p className="font-mono text-xs text-muted-foreground">{code}</p>
      </div>

      {object && (
        <div className="card-vhs p-4 text-left space-y-3">
          <div>
            <p className="font-mono text-xs text-muted-foreground uppercase">Nom</p>
            <p className="font-mono text-sm">{object.name}</p>
          </div>
          {object.author && (
            <div>
              <p className="font-mono text-xs text-muted-foreground uppercase">Auteur / Marque</p>
              <p className="font-mono text-sm">{object.author}</p>
            </div>
          )}
        </div>
      )}

      <p className="font-mono text-xs text-muted-foreground">
        Scannez ce code pour identifier cet objet.
      </p>
    </div>
  );
}