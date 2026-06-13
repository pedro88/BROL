-- CreateEnum
CREATE TYPE "PaymentKind" AS ENUM ('SUBSCRIPTION_FIRST', 'SUBSCRIPTION_RECURRING');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('OPEN', 'PENDING', 'PAID', 'FAILED', 'CANCELED', 'EXPIRED');

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "mollieCustomerId" TEXT,
ADD COLUMN     "mollieSubscriptionId" TEXT;

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "molliePaymentId" TEXT NOT NULL,
    "kind" "PaymentKind" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'OPEN',
    "tier" "UserTier" NOT NULL,
    "amount" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_molliePaymentId_key" ON "payments"("molliePaymentId");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
