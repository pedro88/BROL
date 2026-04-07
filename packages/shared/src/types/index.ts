/**
 * Types TypeScript inférés des schémas Zod.
 * @package @brol/shared
 */

import type {
  UpdateUserInput,
  CreateCollectionInput,
  UpdateCollectionInput,
  CreateObjectInput,
  UpdateObjectInput,
  CreateContactInput,
  UpdateContactInput,
  CreateLoanInput,
  ReturnLoanInput,
  RemindLoanInput,
  GenerateQrStockInput,
  AssignQrStockInput,
  PaginationInput,
  SendOwnerMessageInput,
} from "../schemas";

// Ré-export des types depuis les schémas
export type {
  UpdateUserInput,
  CreateCollectionInput,
  UpdateCollectionInput,
  CreateObjectInput,
  UpdateObjectInput,
  CreateContactInput,
  UpdateContactInput,
  CreateLoanInput,
  ReturnLoanInput,
  RemindLoanInput,
  GenerateQrStockInput,
  AssignQrStockInput,
  PaginationInput,
  SendOwnerMessageInput,
};

// ============================================
// TYPES UTILISATEUR
// ============================================

export interface UserPublic {
  id: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface UserProfile extends UserPublic {
  email: string;
  locale: string;
  createdAt: Date;
}

// ============================================
// TYPES COLLECTION
// ============================================

export interface CollectionWithCounts {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  userId: string;
  objectCount: number;
  lentOutCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// TYPES OBJET
// ============================================

export type ObjectCondition = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR";

export interface ObjectWithLoan {
  id: string;
  name: string;
  author: string | null;
  edition: string | null;
  isbn: string | null;
  barcode: string | null;
  condition: ObjectCondition;
  notes: string | null;
  coverImage: string | null;
  collectionId: string;
  qrStockId: string | null;
  currentLoan?: {
    id: string;
    status: string;
    borrower: UserPublic;
    returnDueDate: Date | null;
  } | null;
}

export interface PublicObjectInfo {
  id: string;
  name: string;
  owner: UserPublic;
  currentLoan?: {
    borrower: UserPublic;
    lentAt: Date;
    returnDueDate: Date | null;
  } | null;
}

// ============================================
// TYPES CONTACT
// ============================================

export interface ContactWithUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  note: string | null;
  linkedUser?: UserPublic;
}

// ============================================
// TYPES PRÊT
// ============================================

export type LoanStatus = "ACTIVE" | "RETURNED" | "OVERDUE" | "CANCELLED";

export interface LoanWithDetails {
  id: string;
  object: {
    id: string;
    name: string;
    coverImage: string | null;
  };
  borrower: UserPublic;
  status: LoanStatus;
  lentAt: Date;
  returnDueDate: Date | null;
  returnedAt: Date | null;
  notes: string | null;
}

export interface LentOutPool {
  active: LoanWithDetails[];
  overdue: LoanWithDetails[];
}

// ============================================
// TYPES QR
// ============================================

export interface QrStockItem {
  id: string;
  code: string;
  used: boolean;
  usedAt: Date | null;
}

export interface QrPdfDocument {
  codes: QrStockItem[];
  generatedAt: Date;
}

// ============================================
// TYPES API
// ============================================

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

// ============================================
// TYPES i18n
// ============================================

export type Locale = "fr" | "nl" | "en";

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LOCALES: LocaleConfig[] = [
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "en", name: "English", nativeName: "English" },
];
