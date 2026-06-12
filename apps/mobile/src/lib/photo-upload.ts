/**
 * Helper d'upload de photo pour mobile.
 * Flow : getPresignedUrl → fetch PUT vers S3 → photos.add.
 * Modèle : `apps/web/src/components/objects/object-form.tsx:257-330`.
 *
 * @package @brol/mobile
 */

import type { PickedPhoto } from "../components/photo-picker";

interface UploadDeps {
  /** Procédure tRPC `photos.getPresignedUrl.mutateAsync`. */
  getPresignedUrl: (input: {
    objectId: string;
    filename: string;
    contentType: string;
    fileSize: number;
  }) => Promise<{ uploadUrl: string; publicUrl: string }>;
  /** Procédure tRPC `photos.add.mutateAsync`. */
  addPhoto: (input: {
    objectId: string;
    url: string;
    position: number;
  }) => Promise<unknown>;
}

/**
 * Upload une photo et l'attache à un objet.
 *
 * @param objectId  ID de l'objet à enrichir.
 * @param photo     Fichier sélectionné via PhotoPicker.
 * @param position  Position de la photo (0 = principale).
 * @param deps      Mutations tRPC à appeler.
 */
export async function uploadObjectPhoto(
  objectId: string,
  photo: PickedPhoto,
  position: number,
  deps: UploadDeps,
): Promise<void> {
  const { uploadUrl, publicUrl } = await deps.getPresignedUrl({
    objectId,
    filename: photo.name,
    contentType: photo.mimeType,
    fileSize: photo.size,
  });

  if (!uploadUrl || !publicUrl) {
    throw new Error("Presigned URL invalide");
  }

  // Récupère le blob depuis l'URI local (file:// ou content://) et l'envoie sur S3.
  const fileResponse = await fetch(photo.uri);
  const blob = await fileResponse.blob();
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": photo.mimeType },
  });
  if (!putRes.ok) {
    throw new Error(`Upload S3 échoué: ${putRes.status}`);
  }

  await deps.addPhoto({ objectId, url: publicUrl, position });
}
