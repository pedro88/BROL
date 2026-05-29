/**
 * Page publique d'affichage d'un QR code.
 * Accessible sans authentification — permet à quiconque de scanner un objet et voir son propriétaire.
 *
 * @package @brol/web
 */

import { Suspense } from "react";
import { Header } from "../../../components/navigation";
import { QrPublicContent } from "./qr-public-content";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function QrPublicPage({ params }: PageProps) {
  const { code } = await params;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="spinner-vhs w-8 h-8" />
            </div>
          }
        >
          <QrPublicContent code={code} />
        </Suspense>
      </main>
    </div>
  );
}
