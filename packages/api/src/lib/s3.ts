/**
 * S3 client pour l'upload de photos.
 * Support S3-compatible (AWS S3, Backblaze B2, MinIO, etc.)
 * @package @brol/api
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";

// ===========================================
// TYPES
// ===========================================

export interface PresignedUpload {
  /** URL pour uploader directement depuis le client (PUT request) */
  uploadUrl: string;
  /** URL publique du fichier une fois uploadé */
  publicUrl: string;
  /** Clé S3 du fichier (path dans le bucket) */
  key: string;
}

export interface PresignedDownload {
  url: string;
  expiresInSeconds: number;
}

// ===========================================
// CONSTANTES
// ===========================================

const ALLOWED_TYPES = (process.env.S3_ALLOWED_TYPES ?? "image/jpeg,image/png,image/webp,image/gif")
  .split(",")
  .map((t) => t.trim());

const MAX_FILE_SIZE_MB = Number(process.env.S3_MAX_FILE_SIZE_MB ?? 10);
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/** Durée de validité des presigned URLs (15 minutes) */
const PRESIGNED_URL_EXPIRES_IN = 15 * 60;

// ===========================================
// S3 CLIENT (singleton lazy)
// ===========================================

let _s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (_s3Client) return _s3Client;

  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION ?? "eu-central-1";
  const accessKeyId = process.env.S3_ACCESS_KEY;
  const secretAccessKey = process.env.S3_SECRET_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        "S3 non configuré. Définissez S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY dans .env",
    });
  }

  _s3Client = new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    // Force path-style pour Backblaze B2 et MinIO (important pour la compatibilité)
    forcePathStyle: true,
  });

  return _s3Client;
}

function getBucket(): string {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "S3_BUCKET non configuré dans .env",
    });
  }
  return bucket;
}

// ===========================================
// KEY GENERATION
// ===========================================

/**
 * Génère une clé S3 pour une photo.
 * Format: photos/{objectId}/{uuid}.{ext}
 */
export function generatePhotoKey(objectId: string, filename: string): string {
  const uuid = crypto.randomUUID();
  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  return `photos/${objectId}/${uuid}.${ext}`;
}

// ===========================================
// VALIDATION
// ===========================================

/**
 * Valide le type MIME d'un fichier.
 */
export function validateContentType(contentType: string): boolean {
  return ALLOWED_TYPES.includes(contentType);
}

/**
 * Valide la taille d'un fichier.
 */
export function validateFileSize(sizeBytes: number): boolean {
  return sizeBytes <= MAX_FILE_SIZE_BYTES;
}

// ===========================================
// PRESIGNED URLS
// ===========================================

/**
 * Génère une presigned URL pour uploader un fichier directement vers S3.
 * L'upload est fait côté client (PUT request) avec le content-type correct.
 * Le client doit ensuite appeler photo.add avec l'URL publique retournée.
 *
 * @param objectId - ID de l'objet auquel la photo appartient
 * @param filename  - Nom original du fichier (pour l'extension)
 * @param contentType - MIME type (ex: image/jpeg)
 * @param fileSize - Taille du fichier en bytes (pour validation)
 */
export async function getPresignedUploadUrl(
  objectId: string,
  filename: string,
  contentType: string,
  fileSize: number
): Promise<PresignedUpload> {
  // Valider le content-type
  if (!validateContentType(contentType)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Type de fichier non autorisé: ${contentType}. Types acceptés: ${ALLOWED_TYPES.join(", ")}`,
    });
  }

  // Valider la taille
  if (!validateFileSize(fileSize)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Fichier trop volumineux. Maximum: ${MAX_FILE_SIZE_MB}MB`,
    });
  }

  const client = getS3Client();
  const bucket = getBucket();
  const key = generatePhotoKey(objectId, filename);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    // Cache-Control pour que les navigateurs cachent les images
    CacheControl: "public, max-age=31536000, immutable",
    // Metadata optionnelle
    Metadata: {
      "original-filename": filename,
      "uploaded-at": new Date().toISOString(),
    },
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: PRESIGNED_URL_EXPIRES_IN,
  });

  // Construire l'URL publique
  const publicUrl = buildPublicUrl(key);

  return { uploadUrl, publicUrl, key };
}

/**
 * Génère une URL publique pour accéder à un fichier.
 * Pour S3-compatible avec endpoint custom (Backblaze, MinIO).
 */
export function buildPublicUrl(key: string): string {
  const endpoint = process.env.S3_ENDPOINT?.replace(/\/$/, ""); // retire le trailing slash
  const bucket = getBucket();

  if (!endpoint) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "S3_ENDPOINT non configuré",
    });
  }

  // L'endpoint doit pointer vers le bucket (ex: https://s3.eu-central-1.backblazeb2.com/{bucket}/)
  // Pour les services compatibles S3, on utilise {endpoint}/{bucket}/{key}
  return `${endpoint}/${bucket}/${key}`;
}

/**
 * Supprime un fichier de S3.
 */
export async function deleteS3Object(key: string): Promise<void> {
  const client = getS3Client();
  const bucket = getBucket();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

/**
 * Récupère l'URL publique d'une clé (sans générer de presigned URL).
 * Utile pour les tests ou quand on a déjà l'URL stockée.
 */
export function getPublicUrl(key: string): string {
  return buildPublicUrl(key);
}

/**
 * Extrait la clé S3 d'une URL publique.
 */
export function extractKeyFromUrl(publicUrl: string): string | null {
  const bucket = getBucket();
  const prefix = `/${bucket}/`;
  const idx = publicUrl.indexOf(prefix);
  if (idx === -1) return null;
  return publicUrl.slice(idx + prefix.length);
}
