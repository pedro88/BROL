/**
 * Utility functions for cn (className merging).
 * @package @brol/web
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge multiple class names with Tailwind CSS.
 * Handles tailwind-merge conflicts.
 *
 * @param inputs - Class names to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
