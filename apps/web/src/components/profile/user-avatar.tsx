"use client";

import Image from "next/image";

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: 32,
  md: 48,
  lg: 80,
  xl: 120,
};

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserAvatar({
  name,
  image,
  avatarUrl,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const px = sizes[size];
  const src = avatarUrl || image;

  if (src) {
    return (
      <div
        className={`relative rounded-full overflow-hidden bg-muted flex-shrink-0 ${className}`}
        style={{ width: px, height: px }}
      >
        <Image
          src={src}
          alt={name || "Avatar"}
          fill
          className="object-cover"
          sizes={`${px}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: px, height: px, fontSize: px * 0.35 }}
    >
      {getInitials(name)}
    </div>
  );
}
