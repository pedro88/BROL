"use client";

import { UserAvatar } from "@/components/profile/user-avatar";

interface RequestCardProps {
  request: {
    id: string;
    title: string;
    description?: string | null;
    zone?: string | null;
    status: string;
    createdAt: string;
    author: {
      id: string;
      name?: string | null;
      image?: string | null;
    };
  };
  onFulfill?: (id: string) => void;
  showFulfillButton?: boolean;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    OPEN: { label: "Ouverte", className: "bg-primary/10 text-primary" },
    FULFILLED: { label: "Traitée", className: "bg-green-500/10 text-green-600" },
    CANCELLED: { label: "Annulée", className: "bg-muted text-muted-foreground" },
    EXPIRED: { label: "Expirée", className: "bg-muted text-muted-foreground" },
  };
  const s = map[status] ?? { label: status, className: "bg-muted" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-mono uppercase ${s.className}`}>
      {s.label}
    </span>
  );
}

export function RequestCard({ request, onFulfill, showFulfillButton }: RequestCardProps) {
  return (
    <div className="card-vhs p-4">
      <div className="flex items-start gap-3">
        <UserAvatar
          name={request.author.name}
          image={request.author.image}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-medium text-sm">{request.title}</h3>
            <StatusBadge status={request.status} />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>{request.author.name || "Anonyme"}</span>
            <span>·</span>
            <span>{formatDate(request.createdAt)}</span>
            {request.zone && (
              <>
                <span>·</span>
                <span>{request.zone}</span>
              </>
            )}
          </div>
          {request.description && (
            <p className="text-sm text-muted-foreground">{request.description}</p>
          )}
          {showFulfillButton && request.status === "OPEN" && onFulfill && (
            <button
              onClick={() => onFulfill(request.id)}
              className="mt-3 text-xs font-medium text-primary hover:underline"
            >
              Répondre à cette demande
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
