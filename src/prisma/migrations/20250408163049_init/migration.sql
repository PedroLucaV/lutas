/*
  Warnings:

  - Added the required column `categoria` to the `Competidor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Competidor` ADD COLUMN `categoria` VARCHAR(191) NOT NULL;
