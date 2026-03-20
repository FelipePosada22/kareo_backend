/*
  Warnings:

  - Added the required column `tenantId` to the `Reminder` table without a default value. This is not possible if the table is not empty.
  - Made the column `sentAt` on table `Reminder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `Reminder` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "message" TEXT,
ADD COLUMN     "tenantId" TEXT NOT NULL,
ALTER COLUMN "sentAt" SET NOT NULL,
ALTER COLUMN "sentAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'SENT';

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
