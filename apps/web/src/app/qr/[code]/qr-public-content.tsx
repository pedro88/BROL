"use client";

/**
 * Client component for the public QR page.
 * Split out of page.tsx so the page itself stays a Server Component
 * while still using tRPC hooks to fetch the QR data.
 *
 * @package @brol/web
 */

import { BookOpen, Clock, Mail } from "lucide-react";
import { QrCodeImage } from "../../../components/qr/qr-code-image";
import { ContactOwnerDialog } from "../../../components/qr/contact-owner-dialog";
import { UserAvatar } from "../../../components/profile/user-avatar";
import { trpc } from "../../../lib/trpc";
import type { ObjectCondition } from "@brol/shared";

const conditionLabels: Record<ObjectCondition, string> = {
  NEW: "Neuf",
  LIKE_NEW: "Comme neuf",
  GOOD: "Bon",
  FAIR: "Correct",
  POOR: "Mauvais",
};

const conditionColors: Record<ObjectCondition, string> = {
  NEW: "bg-green-500/20 text-green-400 border-green-500/50",
  LIKE_NEW: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  GOOD: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  FAIR: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  POOR: "bg-red-500/20 text-red-400 border-red-500/50",
};

export function QrPublicContent({ code }: { code: string }) {
  const { data: qrData, isLoading } = trpc.qr.getByCode.useQuery(
    { code },
    { enabled: !!code },
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
  const owner = qrData.user;

  if (!object) {
    return (
      <div className="card-vhs p-8 text-center">
        <h1 className="font-display text-2xl text-primary vhs-text-glow mb-4">
          OBJET INTROUVABLE
        </h1>
        <p className="font-mono text-sm text-muted-foreground">
          Cet QR code n&apos;est pas associé à un objet.
        </p>
      </div>
    );
  }

  const ownerAvatarUrl = owner.profile?.avatarUrl;
  const ownerName = owner.name ?? "Propriétaire";
  const ownerBio = owner.profile?.bio;

  return (
    <div className="space-y-6">
      {/* Object cover and basic info */}
      <div className="text-center">
        {object.coverImage ? (
          <div className="w-32 h-40 mx-auto mb-4 overflow-hidden rounded-lg">
            <img
              src={object.coverImage}
              alt={object.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-32 h-40 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/50" />
          </div>
        )}

        <h1 className="font-display text-2xl text-primary vhs-text-glow">
          {object.name}
        </h1>

        {object.author && (
          <p className="font-mono text-sm text-muted-foreground mt-1">
            {object.author}
          </p>
        )}

        <span
          className={`inline-block mt-2 px-3 py-1 text-xs font-mono border ${conditionColors[object.condition]}`}
        >
          {conditionLabels[object.condition]}
        </span>
      </div>

      {/* QR Code display */}
      <div className="card-vhs p-6 flex flex-col items-center gap-4">
        <QrCodeImage code={code} size={200} />
        <p className="font-mono text-xs text-muted-foreground">{code}</p>
      </div>

      {/* Owner info card */}
      <div className="card-vhs p-4">
        <p className="font-mono text-xs text-muted-foreground uppercase mb-3">
          Propriétaire
        </p>
        <div className="flex items-center gap-3">
          <UserAvatar
            name={ownerName}
            image={owner.image}
            avatarUrl={ownerAvatarUrl}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <p className="font-display text-lg vhs-text-glow text-primary truncate">
              {ownerName}
            </p>
            {ownerBio && (
              <p className="font-mono text-xs text-muted-foreground line-clamp-2">
                {ownerBio}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-muted-foreground/50">
          <Clock className="w-4 h-4" />
          <span className="font-mono text-xs">Disponible</span>
        </div>
      </div>

      {/* Contact button */}
      <ContactOwnerDialog
        objectId={object.id}
        ownerId={owner.id}
        ownerName={ownerName}
        objectName={object.name}
        trigger={
          <button className="w-full py-3 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-mono text-sm uppercase tracking-wider vhs-glow">
            <Mail className="w-4 h-4" />
            Contacter le propriétaire
          </button>
        }
      />

      <p className="font-mono text-xs text-muted-foreground text-center">
        Scannez ce code pour identifier cet objet.
      </p>
    </div>
  );
}
