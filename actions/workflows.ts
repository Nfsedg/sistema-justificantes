"use server";

import { prisma } from "@/lib/prisma";

export async function getWorkflows() {
  return await prisma.workflow.findMany({
    include: {
      etapas: true,
    },
    orderBy: {
      createdAt: 'desc',
    }
  });
}

export async function setDefaultWorkflow(id: number) {
  return await prisma.$transaction([
    // Unset all default
    prisma.workflow.updateMany({
      where: { isDefault: true },
      data: { isDefault: false }
    }),
    // Set new default
    prisma.workflow.update({
      where: { id },
      data: { isDefault: true }
    })
  ]);
}

export type EtapaInput = {
  nombre: string;
  orden: number;
  tipo: 'SECUENCIAL' | 'PARALELA';
};

export async function createWorkflow(nombre: string, etapas: EtapaInput[]) {
  return await prisma.workflow.create({
    data: {
      nombre,
      isDefault: false,
      etapas: {
        create: etapas.map(e => ({
          nombre: e.nombre,
          orden: e.orden,
          tipo: e.tipo
        }))
      }
    }
  });
}
