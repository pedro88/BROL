/**
 * Hooks tRPC pour les photos.
 * @package @brol/web
 */

import { trpc } from "../trpc";
import type { Photo } from "@brol/shared";

/**
 * Liste les photos d'un objet.
 */
export function usePhotosList(objectId: string) {
  return trpc.photos.list.useQuery(
    { objectId },
    { enabled: !!objectId }
  );
}

/**
 * Demande une presigned URL pour uploader une photo.
 */
export function usePresignedUrl() {
  return trpc.photos.getPresignedUrl.useMutation({ retry: 1 });
}

/**
 * Ajoute une photo à un objet (après upload vers S3).
 */
export function usePhotoAdd(options?: {
  onSuccess?: (photo: Photo) => void;
  onError?: (error: unknown) => void;
}) {
  const utils = trpc.useUtils();

  return trpc.photos.add.useMutation({
    onSuccess: (photo) => {
      utils.photos.list.invalidate({ objectId: photo.objectId });
      options?.onSuccess?.(photo);
    },
    onError: (err) => {
      console.error("[usePhotoAdd]", err);
      options?.onError?.(err);
    },
  });
}

/**
 * Supprime une photo.
 */
export function usePhotoRemove(options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) {
  const utils = trpc.useUtils();

  return trpc.photos.remove.useMutation({
    onSuccess: (_, variables) => {
      utils.photos.list.invalidate({ objectId: variables.objectId });
      options?.onSuccess?.();
    },
    onError: (err) => {
      console.error("[usePhotoRemove]", err);
      options?.onError?.(err);
    },
  });
}

/**
 * Réordonne les photos d'un objet.
 */
export function usePhotoReorder(options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) {
  const utils = trpc.useUtils();

  return trpc.photos.reorder.useMutation({
    onSuccess: (_, variables) => {
      utils.photos.list.invalidate({ objectId: variables.objectId });
      options?.onSuccess?.();
    },
    onError: (err) => {
      console.error("[usePhotoReorder]", err);
      options?.onError?.(err);
    },
  });
}
