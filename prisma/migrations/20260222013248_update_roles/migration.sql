/*
  Warnings:

  - You are about to drop the column `userId` on the `Justificantes` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `estudianteId` to the `Justificantes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Justificantes` DROP FOREIGN KEY `Justificantes_userId_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_roleId_fkey`;

-- DropIndex
DROP INDEX `Justificantes_userId_fkey` ON `Justificantes`;

-- DropIndex
DROP INDEX `User_roleId_fkey` ON `User`;

-- AlterTable
ALTER TABLE `Justificantes` DROP COLUMN `userId`,
    ADD COLUMN `estudianteId` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` ENUM('BORRADOR', 'EN_PROCESO', 'FINALIZADO', 'CON_OBSERVACIONES', 'CANCELADO') NOT NULL DEFAULT 'EN_PROCESO';

-- AlterTable
ALTER TABLE `User` DROP COLUMN `roleId`,
    ADD COLUMN `role` ENUM('ESTUDIANTE', 'DOCENTE', 'COORDINADOR') NOT NULL;

-- DropTable
DROP TABLE `Role`;

-- CreateTable
CREATE TABLE `Workflow` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkflowEtapa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workflowId` INTEGER NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `orden` INTEGER NOT NULL,
    `tipo` ENUM('SECUENCIAL', 'PARALELA') NOT NULL DEFAULT 'PARALELA',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `WorkflowEtapa_workflowId_orden_key`(`workflowId`, `orden`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkflowInstancia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `justificanteId` INTEGER NOT NULL,
    `workflowId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `WorkflowInstancia_justificanteId_key`(`justificanteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkflowEtapaInstancia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workflowInstanciaId` INTEGER NOT NULL,
    `workflowEtapaId` INTEGER NOT NULL,
    `estado` ENUM('PENDIENTE', 'EN_PROCESO', 'COMPLETADA') NOT NULL DEFAULT 'PENDIENTE',
    `orden` INTEGER NOT NULL,
    `iniciadaEn` DATETIME(3) NULL,
    `completadaEn` DATETIME(3) NULL,

    UNIQUE INDEX `WorkflowEtapaInstancia_workflowInstanciaId_orden_key`(`workflowInstanciaId`, `orden`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkflowAsignacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `etapaInstanciaId` INTEGER NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `estado` ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO') NOT NULL DEFAULT 'PENDIENTE',
    `comentario` VARCHAR(191) NULL,
    `revisadoEn` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `WorkflowAsignacion_etapaInstanciaId_email_key`(`etapaInstanciaId`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Justificantes` ADD CONSTRAINT `Justificantes_estudianteId_fkey` FOREIGN KEY (`estudianteId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkflowEtapa` ADD CONSTRAINT `WorkflowEtapa_workflowId_fkey` FOREIGN KEY (`workflowId`) REFERENCES `Workflow`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkflowInstancia` ADD CONSTRAINT `WorkflowInstancia_justificanteId_fkey` FOREIGN KEY (`justificanteId`) REFERENCES `Justificantes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkflowInstancia` ADD CONSTRAINT `WorkflowInstancia_workflowId_fkey` FOREIGN KEY (`workflowId`) REFERENCES `Workflow`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkflowEtapaInstancia` ADD CONSTRAINT `WorkflowEtapaInstancia_workflowInstanciaId_fkey` FOREIGN KEY (`workflowInstanciaId`) REFERENCES `WorkflowInstancia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkflowEtapaInstancia` ADD CONSTRAINT `WorkflowEtapaInstancia_workflowEtapaId_fkey` FOREIGN KEY (`workflowEtapaId`) REFERENCES `WorkflowEtapa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkflowAsignacion` ADD CONSTRAINT `WorkflowAsignacion_etapaInstanciaId_fkey` FOREIGN KEY (`etapaInstanciaId`) REFERENCES `WorkflowEtapaInstancia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkflowAsignacion` ADD CONSTRAINT `WorkflowAsignacion_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
