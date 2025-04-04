/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Competidor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Competidor_email_key` ON `Competidor`(`email`);
