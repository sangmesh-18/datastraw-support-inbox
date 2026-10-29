/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[eventId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "brandId" TEXT NOT NULL DEFAULT 'verdant-co';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "eventId" TEXT,
ADD COLUMN     "externalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Message_externalId_key" ON "Message"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_eventId_key" ON "Message"("eventId");
