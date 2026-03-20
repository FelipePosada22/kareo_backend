-- AlterTable
ALTER TABLE "InvoiceItem" ADD COLUMN     "treatmentPlanItemId" TEXT;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_treatmentPlanItemId_fkey" FOREIGN KEY ("treatmentPlanItemId") REFERENCES "TreatmentPlanItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
