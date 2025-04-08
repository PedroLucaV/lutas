/*
  Warnings:

  - You are about to drop the column `cpf` on the `Competidor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Competidor` DROP COLUMN `cpf`,
    ADD COLUMN `cpfResp` VARCHAR(191) NULL;
