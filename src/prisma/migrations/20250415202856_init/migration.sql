/*
  Warnings:

  - Added the required column `area` to the `Luta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `luta` ADD COLUMN `area` INTEGER NOT NULL;
