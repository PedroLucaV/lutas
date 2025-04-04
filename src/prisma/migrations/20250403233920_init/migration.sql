-- CreateTable
CREATE TABLE `Luta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoria` VARCHAR(191) NOT NULL,
    `fase` INTEGER NOT NULL,
    `competidor1Id` INTEGER NULL,
    `competidor2Id` INTEGER NULL,
    `vencedorId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Luta` ADD CONSTRAINT `Luta_competidor1Id_fkey` FOREIGN KEY (`competidor1Id`) REFERENCES `Competidor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Luta` ADD CONSTRAINT `Luta_competidor2Id_fkey` FOREIGN KEY (`competidor2Id`) REFERENCES `Competidor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Luta` ADD CONSTRAINT `Luta_vencedorId_fkey` FOREIGN KEY (`vencedorId`) REFERENCES `Competidor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
