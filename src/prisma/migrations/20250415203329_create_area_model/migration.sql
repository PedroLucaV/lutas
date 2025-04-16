/*
  Warnings:

  - You are about to drop the column `area` on the `luta` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `luta` DROP COLUMN `area`,
    ADD COLUMN `areaId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Area` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `especial` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Luta` ADD CONSTRAINT `Luta_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
