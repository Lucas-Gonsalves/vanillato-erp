-- CreateEnum
CREATE TYPE "PersonType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "PaymentCondition" AS ENUM ('CASH', 'CREDIT');

-- CreateEnum
CREATE TYPE "ReceivableStatus" AS ENUM ('OPEN', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "ReceivableHistoryEventType" AS ENUM ('CREATED', 'DUE_DATE_CHANGED', 'PAYMENT_REGISTERED', 'PAYMENT_CANCELED', 'PAID', 'CANCELED');

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "allow_credit_purchase" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "alternative_phone" TEXT,
ADD COLUMN     "birth_date" TIMESTAMP(3),
ADD COLUMN     "complement" TEXT,
ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "credit_limit" DECIMAL(10,2),
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "internal_notes" TEXT,
ADD COLUMN     "is_vip" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "number" TEXT,
ADD COLUMN     "origin" TEXT,
ADD COLUMN     "person_type" "PersonType",
ADD COLUMN     "reference" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "whatsapp" TEXT,
ADD COLUMN     "zip_code" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "expected_payment_date" TIMESTAMP(3),
ADD COLUMN     "expected_payment_method_id" TEXT,
ADD COLUMN     "payment_condition" "PaymentCondition" NOT NULL DEFAULT 'CASH',
ADD COLUMN     "payment_notes" TEXT;

-- AlterTable
ALTER TABLE "payment_methods" ADD COLUMN     "badge_color" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "display_order" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "accounts_receivable" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "remaining_amount" DECIMAL(10,2) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "ReceivableStatus" NOT NULL DEFAULT 'OPEN',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_receivable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_receivable_payments" (
    "id" TEXT NOT NULL,
    "receivable_id" TEXT NOT NULL,
    "payment_method_id" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "canceled_at" TIMESTAMP(3),
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_receivable_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_receivable_history" (
    "id" TEXT NOT NULL,
    "receivable_id" TEXT NOT NULL,
    "event_type" "ReceivableHistoryEventType" NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "note" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_receivable_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_receivable_renegotiations" (
    "id" TEXT NOT NULL,
    "receivable_id" TEXT NOT NULL,
    "old_due_date" TIMESTAMP(3) NOT NULL,
    "new_due_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_receivable_renegotiations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_receivable_order_id_key" ON "accounts_receivable"("order_id");

-- CreateIndex
CREATE INDEX "accounts_receivable_customer_id_idx" ON "accounts_receivable"("customer_id");

-- CreateIndex
CREATE INDEX "accounts_receivable_due_date_idx" ON "accounts_receivable"("due_date");

-- CreateIndex
CREATE INDEX "accounts_receivable_status_idx" ON "accounts_receivable"("status");

-- CreateIndex
CREATE INDEX "account_receivable_payments_receivable_id_idx" ON "account_receivable_payments"("receivable_id");

-- CreateIndex
CREATE INDEX "account_receivable_history_receivable_id_idx" ON "account_receivable_history"("receivable_id");

-- CreateIndex
CREATE INDEX "account_receivable_renegotiations_receivable_id_idx" ON "account_receivable_renegotiations"("receivable_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_expected_payment_method_id_fkey" FOREIGN KEY ("expected_payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_receivable" ADD CONSTRAINT "accounts_receivable_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_receivable" ADD CONSTRAINT "accounts_receivable_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_receivable_payments" ADD CONSTRAINT "account_receivable_payments_receivable_id_fkey" FOREIGN KEY ("receivable_id") REFERENCES "accounts_receivable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_receivable_payments" ADD CONSTRAINT "account_receivable_payments_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_receivable_payments" ADD CONSTRAINT "account_receivable_payments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_receivable_history" ADD CONSTRAINT "account_receivable_history_receivable_id_fkey" FOREIGN KEY ("receivable_id") REFERENCES "accounts_receivable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_receivable_history" ADD CONSTRAINT "account_receivable_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_receivable_renegotiations" ADD CONSTRAINT "account_receivable_renegotiations_receivable_id_fkey" FOREIGN KEY ("receivable_id") REFERENCES "accounts_receivable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_receivable_renegotiations" ADD CONSTRAINT "account_receivable_renegotiations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
