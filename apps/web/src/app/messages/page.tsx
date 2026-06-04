"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Header, Navigation } from "@/components/navigation";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Mail, MessageSquare, ChevronDown } from "lucide-react";

/** Compteur badge non-lus réutilisé localement (rouge VHS). */
function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-mono flex items-center justify-center">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export default function MessagesPage() {
  const t = useTranslations();
  const locale = useLocale();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.messages.inbox.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const markQrRead = trpc.messages.markQrRead.useMutation({
    onSuccess: () => {
      utils.messages.inbox.invalidate();
      utils.messages.unreadCount.invalidate();
    },
  });

  const [expanded, setExpanded] = useState<string | null>(null);

  function fmtDate(d: Date | string) {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(d));
  }

  function toggleQr(id: string, read: boolean) {
    setExpanded((cur) => (cur === id ? null : id));
    if (!read && expanded !== id) markQrRead.mutate({ id });
  }

  const threads = data?.threads ?? [];
  const qrMessages = data?.qrMessages ?? [];
  const isEmpty = !isLoading && threads.length === 0 && qrMessages.length === 0;

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <main className="px-4 py-6 max-w-lg mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono text-xs uppercase">{t("nav.home")}</span>
        </Link>

        <h1 className="font-display text-2xl vhs-text-glow text-primary mb-6">
          {t("messages.title")}
        </h1>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="spinner-vhs w-8 h-8" />
          </div>
        )}

        {isEmpty && (
          <div className="card-vhs p-8 text-center">
            <Mail className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-mono text-sm text-muted-foreground mb-1">
              {t("messages.empty")}
            </p>
            <p className="font-mono text-xs text-muted-foreground/70">
              {t("messages.emptyDescription")}
            </p>
          </div>
        )}

        {/* Conversations (threads de demandes) */}
        {threads.length > 0 && (
          <section className="mb-6">
            <h2 className="font-mono text-xs uppercase text-muted-foreground mb-2">
              {t("messages.conversationsSection")}
            </h2>
            <div className="card-vhs overflow-hidden">
              {threads.map((th) => {
                const name = th.otherParty.name ?? th.otherParty.handle ?? t("messages.noName");
                return (
                  <Link
                    key={th.requestId}
                    href={`/requests/${th.requestId}`}
                    className={`flex items-start gap-3 p-4 border-b border-border last:border-b-0 transition-colors hover:bg-muted/40 ${
                      th.unreadCount > 0 ? "bg-primary/5" : ""
                    }`}
                  >
                    <MessageSquare className="w-5 h-5 mt-0.5 text-secondary shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-medium truncate">{name}</h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <UnreadBadge count={th.unreadCount} />
                          <span className="text-xs text-muted-foreground">
                            {fmtDate(th.lastMessage.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground/80 truncate">
                        {t("messages.threadAbout", { title: th.requestTitle })}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {th.lastMessage.content}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Contacts via QR (anonymes, lecture seule) */}
        {qrMessages.length > 0 && (
          <section>
            <h2 className="font-mono text-xs uppercase text-muted-foreground mb-2">
              {t("messages.qrSection")}
            </h2>
            <div className="card-vhs overflow-hidden">
              {qrMessages.map((m) => {
                const isOpen = expanded === m.id;
                const mailto = `mailto:${m.fromEmail}?subject=${encodeURIComponent(
                  `Re: ${m.objectName}`,
                )}`;
                return (
                  <div
                    key={m.id}
                    className={`border-b border-border last:border-b-0 ${
                      !m.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleQr(m.id, m.read)}
                      className="w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-muted/40"
                    >
                      <Mail className="w-5 h-5 mt-0.5 text-accent shrink-0" strokeWidth={1.5} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-medium truncate">{m.fromName}</h3>
                          <div className="flex items-center gap-2 shrink-0">
                            {!m.read && <UnreadBadge count={1} />}
                            <span className="text-xs text-muted-foreground">
                              {fmtDate(m.createdAt)}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-muted-foreground transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground/80 truncate">
                          {t("messages.qrObjectLabel")} : {m.objectName}
                        </p>
                        {!isOpen && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            {m.content}
                          </p>
                        )}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pl-12 space-y-3">
                        <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                        <a
                          href={mailto}
                          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase text-primary hover:underline"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {t("messages.replyByEmail")} ({m.fromEmail})
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <Navigation />
    </div>
  );
}
