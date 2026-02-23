import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import { JustificanteStatus } from "@/generated/prisma/client"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const justificanteId = parseInt(paramId);

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET!
    });

    if (!token?.sub || !token.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "TUTOR") {
      return NextResponse.json({ error: "Solo los tutores pueden realizar esta acción por ahora" }, { status: 403 });
    }

    const { action, observaciones, profesoresEmails } = await req.json();

    if (!action || !["APROBAR", "RECHAZAR"].includes(action)) {
      return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
    }

    // 1️⃣ Obtener el justificante con su workflow
    const justificante = await prisma.justificantes.findUnique({
      where: { id: justificanteId },
      include: {
        workflowInstancia: {
          include: {
            etapasInstancia: {
              include: {
                asignaciones: true
              }
            }
          }
        }
      }
    });

    if (!justificante || !justificante.workflowInstancia) {
      return NextResponse.json({ error: "Justificante o Workflow no encontrado" }, { status: 404 });
    }

    // 2️⃣ Verificar que el usuario sea el tutor asignado en la etapa 1
    const etapaTutor = justificante.workflowInstancia.etapasInstancia.find(e => e.orden === 1);
    const asignacionTutor = etapaTutor?.asignaciones.find(a => a.email === token.email);

    if (!etapaTutor || !asignacionTutor) {
      return NextResponse.json({ error: "No eres el tutor asignado a este justificante" }, { status: 403 });
    }

    if (asignacionTutor.estado !== "PENDIENTE") {
      return NextResponse.json({ error: "Ya has revisado este justificante" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 3️⃣ Registrar la respuesta del tutor
      const estadoRevision = action === "APROBAR" ? "APROBADO" : "RECHAZADO";
      
      await tx.workflowAsignacion.update({
        where: { id: asignacionTutor.id },
        data: {
          estado: estadoRevision,
          comentario: observaciones || null,
          revisadoEn: new Date(),
          userId: token.sub!
        }
      });

      await tx.workflowEtapaInstancia.update({
        where: { id: etapaTutor.id },
        data: {
          estado: "COMPLETADA",
          completadaEn: new Date()
        }
      });

      // 4️⃣ Manejar la acción (Aprobar o Rechazar)
      if (action === "RECHAZAR") {
        await tx.justificantes.update({
          where: { id: justificanteId },
          data: { status: JustificanteStatus.CON_OBSERVACIONES }
        });
      } else if (action === "APROBAR") {
        // Encontrar etapa 2 (Profesores)
        const etapaProfesores = justificante.workflowInstancia!.etapasInstancia.find(e => e.orden === 2);
        
        if (etapaProfesores) {
          // Iniciar la etapa 2
          await tx.workflowEtapaInstancia.update({
            where: { id: etapaProfesores.id },
            data: {
              estado: "EN_PROCESO",
              iniciadaEn: new Date()
            }
          });

          // Sobre-escribir asignaciones de docentes basándose en profesoresEmails (control definitivo del tutor)
          // Primero borramos las asignaciones previas si existen
          await tx.workflowAsignacion.deleteMany({
            where: { etapaInstanciaId: etapaProfesores.id }
          });

          // Luego creamos las nuevas
          if (profesoresEmails && Array.isArray(profesoresEmails) && profesoresEmails.length > 0) {
            const emailsUnicos = Array.from(new Set(profesoresEmails));
            const profesoresFiltrados = emailsUnicos.filter(email => email !== token.email); // Evitar tutor asignado como doc.

            if (profesoresFiltrados.length > 0) {
              await tx.workflowAsignacion.createMany({
                data: profesoresFiltrados.map((email: string) => ({
                  etapaInstanciaId: etapaProfesores.id,
                  email
                }))
              });
            }
          }
        }
      }

      // Devolver justificante actualizado
      return tx.justificantes.findUnique({
        where: { id: justificanteId },
        include: {
          workflowInstancia: {
            include: {
              etapasInstancia: {
                include: {
                  asignaciones: true
                }
              }
            }
          }
        }
      });
    });

    return NextResponse.json({ success: true, justificante: result });

  } catch (error) {
    console.error("Error updating workflow:", error);
    return NextResponse.json(
      { error: "Error interno al procesar el workflow" },
      { status: 500 }
    );
  }
}
