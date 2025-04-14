/*
  Warnings:

  - You are about to drop the `espectador` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `espectador`;

-- CreateTable
CREATE TABLE `Contas` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `evento` VARCHAR(191) NULL,
    `role` ENUM('USER', 'ADMIN', 'EVENT_MANAGER') NOT NULL DEFAULT 'USER',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
