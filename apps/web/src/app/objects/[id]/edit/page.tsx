"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera } from "lucide-react";
import { Header, Navigation } from "../../../../components/navigation";
import { EditObjectDialog } from "../../../../components/objects/edit-object-dialog";
import { PhotoCapture } from "../../../../components/photos/photo-capture";
import { trpc } from "../../../../lib/trpc";

/**
 * Page d'édition d'un objet.
 * Protégée — nécessite authentification (middleware).
 */
export default function EditObjectPage() {
  const params = useParams();
  const router = useRouter();
  const objectId = params.id as string;
  const [dialogOpen, setDialogOpen] = useState(true);

  const { data: object, isLoading } = trpc.objects.get.useQuery(
    { id: objectId },
    { enabled: !!objectId }
  );
  const utils = trpc.useUtils();

  const handleSuccess = () => {
    router.push(`/objects/${objectId}`);
  };

  const handleClose = () => {
    router.push(`/objects/${objectId}`);
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Back button */}
        <Link
          href={`/objects/${objectId}`}
          className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Détail de l&apos;objet
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl vhs-text-glow text-primary">
            MODIFIER
          </h1>
          <p className="font-mono text-sm text-muted-foreground mt-2">
            Modifier les informations de l&apos;objet
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="spinner-vhs w-8 h-8" />
          </div>
        )}

        {/* Photo section */}
        {object && (
          <section className="mb-8">
            <h2 className="font-mono text-xs text-muted-foreground uppercase mb-3">
              // PHOTOS
            </h2>
            <PhotoCapture
              objectId={objectId}
              onPhotoAdded={() => utils.objects.get.invalidate({ id: objectId })}
            />
            {object.photos && object.photos.length > 0 && (
              <div className="mt-4">
                <p className="font-mono text-xs text-muted-foreground mb-2">
                  {object.photos.length} photo{object.photos.length !== 1 ? "s" : ""}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {object.photos.map((photo) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt=""
                      className="w-20 h-20 object-cover rounded border border-border"
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Edit dialog */}
        {!isLoading && object && (
          <EditObjectDialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) handleClose();
            }}
            objectId={objectId}
            objectName={object.name}
            collectionType={object.collection?.type}
            initialData={{
              name: object.name,
              author: object.author,
              edition: object.edition,
              condition: object.condition,
              notes: object.notes,
              isbn: object.isbn,
              // BOARD_GAME
              playersMin: object.playersMin,
              playersMax: object.playersMax,
              playingTimeMinutes: object.playingTimeMinutes,
              ageMin: object.ageMin,
              // ELECTRIC
              powerWatts: object.powerWatts,
              // CLOTHING
              clothingSize: object.clothingSize,
              clothingGender: object.clothingGender,
              clothingColor: object.clothingColor,
              clothingMaterial: object.clothingMaterial,
              // TOOL
              toolManual: object.toolManual,
              toolSector: object.toolSector,
              toolBattery: object.toolBattery,
              // CUSTOM
              customField1: object.customField1,
              customField2: object.customField2,
              // Caution et tarification
              cautionAmount: object.cautionAmount ? Number(object.cautionAmount) : null,
              rentalPriceDay: object.rentalPriceDay ? Number(object.rentalPriceDay) : null,
              rentalPriceHour: object.rentalPriceHour ? Number(object.rentalPriceHour) : null,
              rentalPriceWeek: object.rentalPriceWeek ? Number(object.rentalPriceWeek) : null,
              rentalPriceKm: object.rentalPriceKm ? Number(object.rentalPriceKm) : null,
              hasPricing: !!(object.cautionAmount || object.rentalPriceDay || object.rentalPriceHour || object.rentalPriceWeek || object.rentalPriceKm),
            }}
            onSuccess={handleSuccess}
          />
        )}

        {/* Not found state */}
        {!isLoading && !object && (
          <div className="card-vhs p-8 text-center">
            <p className="font-mono text-sm text-muted-foreground">
              Objet non trouvé.
            </p>
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
}