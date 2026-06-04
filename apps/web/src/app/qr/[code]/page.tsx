/**
 * Résolveur QR → objet. Scan d'un QR code (URL `https://app.brol.dev/qr/{code}`)
 * redirige vers `/objects/{id}` qui rend la vue par rôle (owner / borrower /
 * viaContact / anonyme) via `objects.getPublic`.
 *
 * Cas marginaux gérés ici :
 *   - QR inconnu → message clair (pas de loader infini).
 *   - QR connu mais sans objet associé → message "pas encore assigné".
 *   - QR avec plusieurs objets → liste cliquable (cas rare, modèle `qrStock.objects[]`).
 *
 * @package @brol/web
 */

"use client";

import { use, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Header } from "../../../components/navigation";
import { trpc } from "../../../lib/trpc";
import { ArrowLeft, QrCode, AlertCircle } from "lucide-react";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function QrResolverPage({ params }: PageProps) {
  const { code } = use(params);
  const t = useTranslations();

  const { data, isLoading, isError, error } = trpc.qr.getByCode.useQuery(
    { code },
    { enabled: !!code, retry: false },
  );

  const objects = data?.objects ?? [];
  const singleObjectId = objects.length === 1 ? objects[0].id : null;

  // Hard nav : middleware Next relit le cookie de session côté serveur,
  // et la page `/objects/{id}` re-fetch `getPublic` avec le bon tier.
  useEffect(() => {
    if (singleObjectId) {
      window.location.replace(`/objects/${singleObjectId}`);
    }
  }, [singleObjectId]);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="spinner-vhs w-8 h-8" />
          </div>
        )}

        {isError && (
          <div className="card-vhs p-6 text-center">
            <AlertCircle className="w-10 h-10 mx-auto text-destructive mb-3" />
            <h1 className="font-display text-xl vhs-text-glow text-primary mb-2">
              {t("qrCodes.unknownTitle")}
            </h1>
            <p className="font-mono text-sm text-muted-foreground mb-4">
              {error?.message ?? t("qrCodes.unknownDefault")}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("common.home")}
            </Link>
          </div>
        )}

        {!isLoading && !isError && objects.length === 0 && (
          <div className="card-vhs p-6 text-center">
            <QrCode className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
            <h1 className="font-display text-xl vhs-text-glow text-primary mb-2">
              {t("qrCodes.unassignedTitle")}
            </h1>
            <p className="font-mono text-sm text-muted-foreground">
              {t("qrCodes.unassignedDescription")}
            </p>
          </div>
        )}

        {/* Redirect en cours pour 1 objet — affiche un spinner pendant que
            window.location.replace prend la main. */}
        {singleObjectId && (
          <div className="flex items-center justify-center py-12">
            <div className="spinner-vhs w-8 h-8" />
          </div>
        )}

        {/* Cas marginal : plusieurs objets sur le même QR */}
        {!isLoading && !isError && objects.length > 1 && (
          <div>
            <h1 className="font-display text-2xl vhs-text-glow text-primary mb-4">
              {t("qrCodes.chooseObjectTitle")}
            </h1>
            <div className="space-y-3">
              {objects.map((obj) => (
                <Link
                  key={obj.id}
                  href={`/objects/${obj.id}`}
                  className="card-vhs p-4 flex items-center gap-3 hover:border-primary/50 transition-colors"
                >
                  {obj.coverImage ? (
                    <img
                      src={obj.coverImage}
                      alt={obj.name}
                      className="w-12 h-16 object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-16 bg-muted flex items-center justify-center flex-shrink-0">
                      <QrCode className="w-5 h-5 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-medium truncate">
                      {obj.name}
                    </p>
                    {obj.author && (
                      <p className="font-mono text-xs text-muted-foreground truncate">
                        {obj.author}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
