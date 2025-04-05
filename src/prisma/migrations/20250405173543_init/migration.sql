/*
  Warnings:

  - Added the required column `equipeImg` to the `Competidor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fotoCompetidor` to the `Competidor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Competidor` ADD COLUMN `equipeImg` VARCHAR(191) NOT NULL,
    ADD COLUMN `fotoCompetidor` VARCHAR(191) NOT NULL;
