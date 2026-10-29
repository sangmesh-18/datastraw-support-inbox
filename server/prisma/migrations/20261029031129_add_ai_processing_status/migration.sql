-- CreateEnum
CREATE TYPE "AIProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "aiProcessingStatus" "AIProcessingStatus" NOT NULL DEFAULT 'PENDING';
