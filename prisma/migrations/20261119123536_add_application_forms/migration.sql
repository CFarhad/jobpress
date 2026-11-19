-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "answers" JSONB;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "formId" TEXT;

-- CreateTable
CREATE TABLE "ApplicationForm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "fields" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationForm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Job_formId_idx" ON "Job"("formId");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_formId_fkey" FOREIGN KEY ("formId") REFERENCES "ApplicationForm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
