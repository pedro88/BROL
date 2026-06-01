/**
 * Brol logo — VHS cassette mark + wordmark.
 * Asset PNG (transparent, neon VHS) lives in `apps/web/public/brand/logo.png`.
 *
 * @package @brol/web
 */

import Image from "next/image";
import Link from "next/link";

export const BROL_TAGLINE = "Beautiful Real Object Library";

const LOGO_SRC = "/brand/logo.png";
const LOGO_NATIVE_W = 881;
const LOGO_NATIVE_H = 594;

interface LogoMarkProps {
  width?: number;
  className?: string;
  priority?: boolean;
}

/**
 * VHS cassette logo (transparent PNG).
 * Height derived from native aspect ratio (881x594).
 */
export function LogoMark({ width = 96, className, priority }: LogoMarkProps) {
  const height = Math.round((width * LOGO_NATIVE_H) / LOGO_NATIVE_W);
  return (
    <Image
      src={LOGO_SRC}
      alt="Brol — Beautiful Real Object Library"
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}

interface WordmarkProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  asLink?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { mark: 72, tagline: "text-[10px]" },
  md: { mark: 110, tagline: "text-xs" },
  lg: { mark: 220, tagline: "text-sm" },
} as const;

/**
 * Composite: cassette logo + tagline beneath (optional).
 * No separate "BROL" text — the wordmark is inside the logo itself.
 */
export function Wordmark({
  size = "md",
  showTagline = false,
  asLink = false,
  className,
}: WordmarkProps) {
  const cfg = SIZE_MAP[size];
  const content = (
    <div className={`flex flex-col items-center ${className ?? ""}`}>
      <LogoMark width={cfg.mark} priority={size === "lg"} />
      {showTagline && (
        <span
          className={`font-mono ${cfg.tagline} text-secondary vhs-text-glow-cyan uppercase tracking-widest mt-2`}
        >
          {BROL_TAGLINE}
        </span>
      )}
    </div>
  );
  if (asLink) {
    return (
      <Link href="/" className="no-underline">
        {content}
      </Link>
    );
  }
  return content;
}
