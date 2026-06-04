"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header, Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, MapPin, MessagesSquare, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Ouverte",
  FULFILLED: "Pourvue",
  CANCELLED: "Annulée",
  EXPIRED: "Expirée",
};

function formatRelative(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("fr-BE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  const requestId = params.id;

  const meQuery = trpc.users.me.useQuery();
  const requestQuery = trpc.communityRequest.get.useQuery({ id: requestId });
  const messagesQuery = trpc.requestMessages.list.useQuery(
    { requestId },
    { refetchInterval: 15_000 },
  );

  const utils = trpc.useUtils();
  const sendMessage = trpc.requestMessages.send.useMutation({
    onSuccess: () => {
      setDraft("");
      utils.requestMessages.list.invalidate({ requestId });
      utils.messages.unreadCount.invalidate();
      toast.success("Message envoyé");
    },
    onError: (err) => {
      toast.error(err.message || "Impossible d'envoyer le message");
    },
  });

  const [draft, setDraft] = useState("");

  // L'ouverture du thread marque les messages reçus comme lus côté serveur
  // (requestMessages.list). On rafraîchit le badge Mail dès que la liste est
  // chargée pour qu'il se vide sans attendre le polling.
  useEffect(() => {
    if (messagesQuery.data) {
      utils.messages.unreadCount.invalidate();
    }
  }, [messagesQuery.data, utils]);

  if (requestQuery.isLoading || meQuery.isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <main className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </main>
        <Navigation />
      </div>
    );
  }

  if (requestQuery.isError || !requestQuery.data) {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <main className="px-4 py-6 max-w-lg mx-auto">
          <Link
            href="/notifications"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono text-xs uppercase">Retour</span>
          </Link>
          <div className="card-vhs p-8 text-center">
            <p className="font-mono text-sm text-muted-foreground">
              Demande introuvable ou supprimée.
            </p>
          </div>
        </main>
        <Navigation />
      </div>
    );
  }

  const request = requestQuery.data;
  const isAuthor = meQuery.data?.id === request.authorId;
  const canSend = draft.trim().length >= 1 && request.status === "OPEN";

  // L'author ne peut écrire en premier — on désactive le form tant qu'aucun
  // owner ne s'est manifesté. Le backend bloque aussi.
  const messages = messagesQuery.data?.messages ?? [];
  const authorMayWrite = !isAuthor || messages.some((m) => m.fromUserId !== request.authorId);

  function handleSend() {
    if (!canSend || !authorMayWrite) return;
    sendMessage.mutate({ requestId, content: draft.trim() });
  }

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <main className="px-4 py-6 max-w-lg mx-auto">
        <Link
          href="/notifications"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono text-xs uppercase">Retour</span>
        </Link>

        {/* Header demande */}
        <div className="card-vhs p-5 mb-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="font-display text-xl text-primary leading-tight">
              {request.title}
            </h1>
            <span className="font-mono text-[10px] uppercase px-2 py-1 rounded bg-muted text-muted-foreground flex-shrink-0">
              {STATUS_LABELS[request.status] ?? request.status}
            </span>
          </div>
          {request.description && (
            <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
              {request.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground">
            <span>
              {request.author.name ?? "Anonyme"}
              {request.author.handle && (
                <span className="ml-1 text-muted-foreground/70">
                  #{request.author.handle}
                </span>
              )}
            </span>
            {request.zone && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {request.zone}
              </span>
            )}
            <span>{formatRelative(request.createdAt as unknown as string)}</span>
          </div>
        </div>

        {/* Thread */}
        <h2 className="font-mono text-xs uppercase text-muted-foreground mb-3 flex items-center gap-2">
          <MessagesSquare className="w-3 h-3" />
          Messages
        </h2>

        <div className="space-y-3 mb-4">
          {messagesQuery.isLoading && (
            <div className="card-vhs p-4 text-center">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mx-auto" />
            </div>
          )}
          {!messagesQuery.isLoading && messages.length === 0 && (
            <div className="card-vhs p-4 text-center">
              <p className="font-mono text-sm text-muted-foreground">
                {isAuthor
                  ? "Aucun voisin ne s'est encore manifesté."
                  : "Soyez le premier à proposer votre aide."}
              </p>
            </div>
          )}
          {messages.map((m) => {
            const isMine = m.fromUserId === meQuery.data?.id;
            return (
              <div
                key={m.id}
                className={`card-vhs p-3 ${isMine ? "border-primary/40 ml-8" : "mr-8"}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-medium">
                    {isMine ? "Vous" : (m.fromUser.name ?? "Voisin")}
                    {!isMine && m.fromUser.handle && (
                      <span className="ml-1 text-muted-foreground/70 font-mono">
                        #{m.fromUser.handle}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {formatRelative(m.createdAt as unknown as string)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
              </div>
            );
          })}
        </div>

        {/* Form d'envoi */}
        {request.status === "OPEN" && (
          <div className="card-vhs p-4">
            {isAuthor && !authorMayWrite ? (
              <p className="font-mono text-xs text-muted-foreground text-center">
                Vous pourrez répondre dès qu'un voisin se sera manifesté.
              </p>
            ) : (
              <div className="space-y-3">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={
                    isAuthor
                      ? "Répondre…"
                      : "Proposez votre aide : objet disponible, conditions, contact…"
                  }
                  maxLength={500}
                  rows={3}
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {draft.length}/500
                  </span>
                  <Button
                    type="button"
                    onClick={handleSend}
                    disabled={!canSend || sendMessage.isPending}
                  >
                    {sendMessage.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-1" />
                        Envoyer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Navigation />
    </div>
  );
}
