/**
 * Schémas Zod partagés pour la validation côté client et serveur.
 * @package @brol/shared
 */

import { z } from "zod";

// ============================================
// CONSTANTES
// ============================================

export const OBJECT_CONDITIONS = ["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"] as const;
export const LOAN_STATUSES = ["ACTIVE", "RETURNED", "OVERDUE", "CANCELLED"] as const;
export const LOCALES = ["fr", "nl", "en"] as const;
export const OBJECT_TYPES = ["BOOK", "BOARD_GAME", "TOOL", "FILM", "MUSIC", "ELECTRONIC", "ELECTRIC", "CLOTHING", "CUSTOM"] as const;

// ============================================
// USER
// ============================================

/**
 * Schéma de mise à jour du profil utilisateur.
 */
export const updateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  locale: z.enum(LOCALES).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ============================================
// COLLECTION
// ============================================

/**
 * Schéma de création d'une collection.
 */
export const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  coverImage: z.string().url().optional(),
  isPublic: z.boolean().default(false),
  type: z.enum(OBJECT_TYPES),
  customField1Label: z.string().max(50).optional(),
  customField2Label: z.string().max(50).optional(),
});

/**
 * Schéma de mise à jour d'une collection.
 */
export const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  isPublic: z.boolean().optional(),
  type: z.enum(OBJECT_TYPES).optional(),
  customField1Label: z.string().max(50).optional().nullable(),
  customField2Label: z.string().max(50).optional().nullable(),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;

// ============================================
// OBJECT
// ============================================

/**
 * Schema de création d'objet.
 * Champs communs + champs conditionnels selon objectType (optionnel — router default à BOOK).
 * La validation par type est faite côté router via collection.type si objectType absent.
 */
export const createObjectSchema = z.object({
  collectionId: z.string().cuid(),
  name: z.string().min(1).max(255),
  author: z.string().max(255).optional(),
  edition: z.string().max(100).optional(),
  barcode: z.string().max(50).optional(),
  condition: z.enum(OBJECT_CONDITIONS).default("GOOD"),
  notes: z.string().max(1000).optional(),
  coverImage: z.string().url().optional(),
  qrStockId: z.string().cuid().optional(),
  objectType: z.enum(OBJECT_TYPES).optional(),
  // Champs conditionnels (tous optionnels — router filtre selon objectType)
  isbn: z.string().regex(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/i).optional().or(z.literal("")),
  playersMin: z.number().int().min(1).optional(),
  playersMax: z.number().int().min(1).optional(),
  playingTimeMinutes: z.number().int().min(1).optional(),
  ageMin: z.number().int().min(0).optional(),
  powerWatts: z.number().int().min(1).optional(),
  customField1: z.string().max(255).optional(),
  customField2: z.string().max(255).optional(),
});

/**
 * Schéma de mise à jour d'un objet.
 * Champs conditionnels selon objectType (optionnels pour partial update).
 */
const updateObjectBase = {
  name: z.string().min(1).max(255).optional(),
  author: z.string().max(255).optional().nullable(),
  edition: z.string().max(100).optional().nullable(),
  barcode: z.string().max(50).optional().nullable(),
  condition: z.enum(OBJECT_CONDITIONS).optional(),
  notes: z.string().max(1000).optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  objectType: z.enum(OBJECT_TYPES).optional(),
  // BOARD_GAME
  playersMin: z.number().int().min(1).optional().nullable(),
  playersMax: z.number().int().min(1).optional().nullable(),
  playingTimeMinutes: z.number().int().min(1).optional().nullable(),
  ageMin: z.number().int().min(0).optional().nullable(),
  // ELECTRIC
  powerWatts: z.number().int().min(1).optional().nullable(),
  // BOOK / FILM
  isbn: z.string().regex(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/i).optional().or(z.literal("")).nullable(),
  // CUSTOM
  customField1: z.string().max(255).optional().nullable(),
  customField2: z.string().max(255).optional().nullable(),
};

export const updateObjectSchema = z.object(updateObjectBase);

export type CreateObjectInput = z.infer<typeof createObjectSchema>;
export type UpdateObjectInput = z.infer<typeof updateObjectSchema>;

// ============================================
// CONTACT
// ============================================

/**
 * Schéma de création d'un contact.
 */
export const createContactSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  note: z.string().max(500).optional(),
});

/**
 * Schéma de mise à jour d'un contact.
 */
export const updateContactSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  phone: z.string().max(20).optional().nullable(),
  note: z.string().max(500).optional().nullable(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;

// ============================================
// LOAN
// ============================================

/**
 * Schéma de création d'un prêt.
 * contactId: ID du Contact à qui prêter (peut avoir ou non un compte Brol).
 * Le prêt est attaché soit à borrowerId (si le contact a un compte), soit à borrowerContactId.
 */
export const createLoanSchema = z.object({
  objectId: z.string().cuid(),
  contactId: z.string().cuid(), // Contact à qui prêter
  returnDueDate: z.coerce.date().optional(),
  notes: z.string().max(1000).optional(),
});

/**
 * Schéma de retour d'objet.
 */
export const returnLoanSchema = z.object({
  loanId: z.string().cuid(),
});

/**
 * Schéma de rappel de prêt.
 */
export const remindLoanSchema = z.object({
  loanId: z.string().cuid(),
});

/**
 * Schéma pour l'ajout d'un contact depuis un scan de profil.
 */
export const addContactFromScanSchema = z.object({
  userCode: z.string().min(1), // Le code scanné depuis le QR profil
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type ReturnLoanInput = z.infer<typeof returnLoanSchema>;
export type RemindLoanInput = z.infer<typeof remindLoanSchema>;

// ============================================
// QR STOCK
// ============================================

/**
 * Schéma de génération de QR codes vierges.
 */
export const generateQrStockSchema = z.object({
  count: z.number().int().min(1).max(100).default(10),
});

/**
 * Schéma d'assignation d'un QR stock à un objet.
 */
export const assignQrStockSchema = z.object({
  objectId: z.string().cuid(),
  qrStockId: z.string().cuid(),
});

export type GenerateQrStockInput = z.infer<typeof generateQrStockSchema>;
export type AssignQrStockInput = z.infer<typeof assignQrStockSchema>;

// ============================================
// SCAN PUBLIC
// ============================================

/**
 * Schéma de scan public d'un objet ( QR sur l'objet physique).
 */
export const publicObjectScanSchema = z.object({
  code: z.string().min(1), // Le code dans le QR
});

// ============================================
// MESSAGE AU PROPRIÉTAIRE
// ============================================

/**
 * Schéma d'envoi de message au propriétaire d'un objet.
 */
export const sendOwnerMessageSchema = z.object({
  objectId: z.string().cuid(),
  message: z.string().min(1).max(500),
});

export type SendOwnerMessageInput = z.infer<typeof sendOwnerMessageSchema>;

// ============================================
// PAGINATION
// ============================================

/**
 * Schéma de pagination standard.
 */
export const paginationSchema = z.object({
  cursor: z.string().cuid().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
