"use client";

import { useState } from "react";
import Link from "next/link";
import { Header, Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Bell, CheckCheck } from "lucide-react";

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: {
    id: string;
    title: string;
    message?: string | null;
    type: string;
    isRead: boolean;
    createdAt: string;
    relatedType?: string | null;
    relatedId?: string | null;
  };
  onMarkRead: (id: string) => void;
}) {
  const icons: Record<string, string> = {
    RETURN_REMINDER: "📅",
    OVERDUE: "⚠️",
    COMMUNITY_REQUEST: "📢",
    REVIEW_RECEIVED: "⭐",
    REQUEST_FULFILLED: "✅",
  };

  const typeLabels: Record<string, string> = {
    RETURN_REMINDER: "Rappel",
    OVERDUE: "Retard",
    COMMUNITY_REQUEST: "Communauté",
    REVIEW_RECEIVED: "Avis",
    REQUEST_FULFILLED: "Demande traitée",
  };

  return (
    <div
      className={`p-4 border-b border-border transition-colors ${
        !notification.isRead ? "bg-primary/5" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">
          {icons[notification.type] ?? "🔔"}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium">{notification.title}</h3>
            {!notification.isRead && (
              <button
                onClick={() => onMarkRead(notification.id)}
                className="text-xs text-muted-foreground hover:text-primary flex-shrink-0"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
          </div>
          {notification.message && (
            <p className="text-sm text-muted-foreground mt-1">
              {notification.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {new Intl.DateTimeFormat("fr", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(notification.createdAt))}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.notification.list.useQuery(
    { unreadOnly: false, limit: 50 },
    { refetchInterval: 30000 } // Refresh every 30s
  );
  const markRead = trpc.notification.markRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
    },
  });
  const markAllRead = trpc.notification.markAllRead.useMutation({
    onSuccess: () => {
      utils.notification.list.invalidate();
      utils.notification.unreadCount.invalidate();
    },
  });

  const unreadCount = data?.items.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <main className="px-4 py-6 max-w-lg mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono text-xs uppercase">Accueil</span>
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl vhs-text-glow text-primary">
            NOTIFICATIONS
          </h1>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Tout marquer lu
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="spinner-vhs w-8 h-8" />
          </div>
        )}

        {!isLoading && data?.items.length === 0 && (
          <div className="card-vhs p-8 text-center">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-mono text-sm text-muted-foreground">
              Aucune notification
            </p>
          </div>
        )}

        {!isLoading && data && (
          <div className="card-vhs overflow-hidden">
            {data.items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={(id) => markRead.mutate({ id })}
              />
            ))}
          </div>
        )}
      </main>
      <Navigation />
    </div>
  );
}
