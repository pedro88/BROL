"use client";

import { use } from "react";
import Link from "next/link";
import { Header, Navigation } from "../../../components/navigation";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { UserAvatar } from "@/components/profile/user-avatar";
import { StarRating } from "@/components/profile/star-rating";
import { ReviewCard } from "@/components/profile/review-card";
import { LeaveReviewDialog } from "@/components/profile/leave-review-dialog";
import { useState } from "react";
import { ArrowLeft, Calendar, MessageSquare, MapPin, Phone, Mail, Cake, User as UserIcon } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatMemberSince(dateStr: string): string {
  return new Intl.DateTimeFormat("fr", {
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

export default function ProfilePage({ params }: PageProps) {
  const { id } = use(params);
  const utils = trpc.useUtils();

  const { data: profile, isLoading } = trpc.profile.get.useQuery({ userId: id });
  const { data: canReviewData } = trpc.review.canReview.useQuery(
    { targetId: id },
    { retry: false }
  );
  const reviewsQuery = trpc.review.list.useQuery(
    { targetId: id, limit: 20 },
    { enabled: !!profile }
  );
  const createReview = trpc.review.create.useMutation({
    onSuccess: () => {
      utils.review.list.invalidate({ targetId: id });
      utils.review.canReview.invalidate({ targetId: id });
      utils.profile.get.invalidate({ userId: id });
    },
  });

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <main className="px-4 py-6 max-w-lg mx-auto flex items-center justify-center py-12">
          <div className="spinner-vhs w-8 h-8" />
        </main>
        <Navigation />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <main className="px-4 py-6 max-w-lg mx-auto text-center">
          <h2 className="font-display text-xl text-muted-foreground mb-4">
            PROFIL INTROUVABLE
          </h2>
          <Link href="/">
            <Button variant="outline">Retour à l'accueil</Button>
          </Link>
        </main>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-lg mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono text-xs uppercase">Retour</span>
        </Link>

        {/* Header */}
        <div className="card-vhs p-6 mb-6">
          <div className="flex items-start gap-4">
            <UserAvatar
              name={profile.name}
              image={profile.image}
              avatarUrl={profile.avatarUrl}
              size="xl"
            />
            <div className="flex-1">
              <h1 className="font-display text-2xl vhs-text-glow text-primary mb-1">
                {profile.name || "Sans nom"}
              </h1>
              {profile.bio && (
                <p className="text-sm text-muted-foreground mb-2">
                  {profile.bio}
                </p>
              )}
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                Membre depuis {formatMemberSince(profile.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Informations publiques (selon flags publicXxx du profil) */}
        <PublicInfoBlock
          email={profile.email}
          phone={profile.phone}
          city={profile.city}
          birthYear={profile.birthYear}
          gender={profile.gender}
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card-vhs p-4 text-center">
            <StarRating rating={profile.averageRating} size="sm" showValue />
            <p className="text-xs text-muted-foreground mt-1">
              {profile.reviewCount} avis
            </p>
          </div>
          <div className="card-vhs p-4 text-center">
            <div className="font-display text-2xl text-primary">
              {profile.badges.length}
            </div>
            <p className="text-xs text-muted-foreground">badges</p>
          </div>
          <div className="card-vhs p-4 text-center">
            <div className="font-display text-2xl text-primary">—</div>
            <p className="text-xs text-muted-foreground">prêts</p>
          </div>
        </div>

        {/* Badges */}
        {profile.badges.length > 0 && (
          <div className="mb-6">
            <h2 className="font-display text-lg vhs-text-glow text-primary mb-3">
              BADGES
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge) => (
                <div
                  key={badge.slug}
                  className="card-vhs px-3 py-2 flex items-center gap-2"
                  title={badge.description}
                >
                  <span className="text-lg">{badge.icon}</span>
                  <span className="text-sm font-medium">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leave review CTA */}
        {canReviewData?.canReview && (
          <div className="mb-6">
            <Button
              onClick={() => setReviewDialogOpen(true)}
              className="w-full"
            >
              <MessageSquare className="w-4 h-4" />
              Laisser un avis
            </Button>
          </div>
        )}

        {/* Reviews */}
        <div>
          <h2 className="font-display text-lg vhs-text-glow text-primary mb-3">
            AVIS ({reviewsQuery.data?.items.length ?? 0})
          </h2>

          {reviewsQuery.isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="spinner-vhs w-6 h-6" />
            </div>
          )}

          {!reviewsQuery.isLoading && reviewsQuery.data?.items.length === 0 && (
            <div className="card-vhs p-6 text-center">
              <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground/50 mb-3" />
              <p className="font-mono text-sm text-muted-foreground">
                Aucun avis pour le moment
              </p>
            </div>
          )}

          {!reviewsQuery.isLoading && reviewsQuery.data && (
            <div className="space-y-3">
              {reviewsQuery.data.items.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Navigation />

      <LeaveReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        targetName={profile.name || undefined}
        onSubmit={async (data) => {
          await createReview.mutateAsync({ targetId: id, ...data });
        }}
      />
    </div>
  );
}

/**
 * Bloc "infos publiques" du profil. Affiche uniquement les champs qui sont
 * non-null — le serveur (profile.get) a déjà appliqué les flags publicXxx.
 * Masque le bloc entier si aucun champ n'est exposé.
 */
function PublicInfoBlock({
  email,
  phone,
  city,
  birthYear,
  gender,
}: {
  email: string | null;
  phone: string | null;
  city: string | null;
  birthYear: number | null;
  gender: string | null;
}) {
  const hasAny = email || phone || city || birthYear || gender;
  if (!hasAny) return null;

  return (
    <div className="card-vhs p-4 mb-6 space-y-2">
      {city && (
        <InfoLine icon={<MapPin className="w-3.5 h-3.5" />} value={city} />
      )}
      {email && (
        <InfoLine
          icon={<Mail className="w-3.5 h-3.5" />}
          value={
            <a href={`mailto:${email}`} className="hover:text-primary underline">
              {email}
            </a>
          }
        />
      )}
      {phone && (
        <InfoLine
          icon={<Phone className="w-3.5 h-3.5" />}
          value={
            <a href={`tel:${phone}`} className="hover:text-primary underline">
              {phone}
            </a>
          }
        />
      )}
      {birthYear && (
        <InfoLine icon={<Cake className="w-3.5 h-3.5" />} value={String(birthYear)} />
      )}
      {gender && (
        <InfoLine icon={<UserIcon className="w-3.5 h-3.5" />} value={gender} />
      )}
    </div>
  );
}

function InfoLine({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="text-muted-foreground/70">{icon}</span>
      {value}
    </p>
  );
}
