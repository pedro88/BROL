/**
 * Compression d'image côté client avant upload S3.
 *
 * - Resize au max `maxDimension` (côté le plus long).
 * - Re-encode en JPEG qualité `quality` (sauf si déjà plus petit).
 * - Préserve le ratio.
 * - Si la sortie est plus grosse que l'original (typique pour PNG <
 *   500 KB ou photos très compressées), renvoie l'original.
 *
 * Pas de dépendance — Canvas API natif. Bundle-safe (pas de polyfill).
 *
 * @package @brol/web
 */

export interface CompressOptions {
  /** Côté le plus long après resize (px). Défaut 2000. */
  maxDimension?: number;
  /** Qualité JPEG, 0–1. Défaut 0.85. */
  quality?: number;
  /** MIME type de sortie. Défaut `image/jpeg`. */
  mimeType?: "image/jpeg" | "image/webp";
}

const DEFAULTS = {
  maxDimension: 2000,
  quality: 0.85,
  mimeType: "image/jpeg" as const,
};

/**
 * Compresse un `File` image. Renvoie un nouveau `File` ou l'original si
 * la compression est contre-productive (sortie plus grosse).
 *
 * GIF animés et formats vectoriels (SVG) sont renvoyés tels quels —
 * Canvas perdrait l'animation / la résolution.
 */
export async function compressImage(
  input: File,
  options: CompressOptions = {},
): Promise<File> {
  const opts = { ...DEFAULTS, ...options };

  // Skip formats non rasterisables proprement
  if (input.type === "image/gif" || input.type === "image/svg+xml") {
    return input;
  }
  if (!input.type.startsWith("image/")) {
    return input;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(input);
  } catch {
    // Format non supporté par le navigateur → fallback original
    return input;
  }

  const { width, height } = bitmap;
  const longest = Math.max(width, height);
  const scale = longest > opts.maxDimension ? opts.maxDimension / longest : 1;
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

  const canvas = typeof OffscreenCanvas !== "undefined"
    ? new OffscreenCanvas(targetW, targetH)
    : Object.assign(document.createElement("canvas"), {
        width: targetW,
        height: targetH,
      });

  const ctx = (canvas as HTMLCanvasElement | OffscreenCanvas).getContext("2d");
  if (!ctx) {
    bitmap.close();
    return input;
  }
  (ctx as CanvasRenderingContext2D).drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close();

  let blob: Blob;
  if ("convertToBlob" in canvas) {
    blob = await canvas.convertToBlob({
      type: opts.mimeType,
      quality: opts.quality,
    });
  } else {
    blob = await new Promise<Blob>((resolve, reject) => {
      (canvas as HTMLCanvasElement).toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob a renvoyé null"))),
        opts.mimeType,
        opts.quality,
      );
    });
  }

  if (blob.size >= input.size) {
    return input;
  }

  const ext = opts.mimeType === "image/webp" ? "webp" : "jpg";
  const baseName = input.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.${ext}`, {
    type: opts.mimeType,
    lastModified: Date.now(),
  });
}
