import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import { JustificanteStatus, EstadoEtapa, EstadoRevision } from "@/generated/prisma/client"

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

    if (!token?.sub || !token.email || !token.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role === "ESTUDIANTE") {
      return NextResponse.json({ error: "Los estudiantes no pueden evaluar justificantes" }, { status: 403 });
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
                asignaciones: true,
                workflowEtapa: true
              }
            }
          }
        }
      }
    });

    if (!justificante || !justificante.workflowInstancia) {
      return NextResponse.json({ error: "Justificante o Workflow no encontrado" }, { status: 404 });
    }

    // 2️⃣ Encontrar la etapa activa (EN_PROCESO) o la etapa donde el usuario rechazó el justificante
    let etapaActiva = justificante.workflowInstancia.etapasInstancia.find(e => e.estado === "EN_PROCESO");
    
    if (!etapaActiva) {
      // Si no hay etapa en proceso, buscamos si el usuario tiene un rechazo en una etapa completada
      etapaActiva = justificante.workflowInstancia.etapasInstancia.find(e => 
        e.asignaciones.some(a => a.email === token.email && a.estado === "RECHAZADO")
      );
    }
    
    if (!etapaActiva) {
      return NextResponse.json({ error: "No hay ninguna etapa de evaluación activa para este justificante" }, { status: 400 });
    }

    // 3️⃣ Verificar que el usuario tenga asignación en esta etapa
    const asignacionUsuario = etapaActiva.asignaciones.find(a => a.email === token.email);

    if (!asignacionUsuario) {
      return NextResponse.json({ error: "No tienes permisos para evaluar este justificante en la etapa actual" }, { status: 403 });
    }

    if (asignacionUsuario.estado !== "PENDIENTE") {
      // Permitir cambiar de RECHAZADO a APROBAR
      if (!(asignacionUsuario.estado === "RECHAZADO" && action === "APROBAR")) {
        return NextResponse.json({ error: "Ya has evaluado este justificante y no puedes cambiar tu decisión" }, { status: 400 });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Si estamos cambiando de RECHAZADO a APROBAR, necesitamos asegurarnos de que la etapa y el justificante estén activos
      if (asignacionUsuario.estado === "RECHAZADO" && action === "APROBAR") {
        // Reactivar etapa si estaba completada
        if (etapaActiva.estado === "COMPLETADA") {
          await tx.workflowEtapaInstancia.update({
            where: { id: etapaActiva.id },
            data: { estado: "EN_PROCESO", completadaEn: null }
          });
        }
        
        // Reactivar justificante si estaba en CON_OBSERVACIONES
        if (justificante.status === JustificanteStatus.CON_OBSERVACIONES) {
          await tx.justificantes.update({
            where: { id: justificanteId },
            data: { status: JustificanteStatus.EN_PROCESO }
          });
        }
      }

      // 4️⃣ Registrar la respuesta
      const estadoRevision: EstadoRevision = action === "APROBAR" ? "APROBADO" : "RECHAZADO";
      
      const asignacionActualizada = await tx.workflowAsignacion.update({
        where: { id: asignacionUsuario.id },
        data: {
          estado: estadoRevision,
          comentario: observaciones || null,
          revisadoEn: new Date(),
          userId: token.sub!
        }
      });

      // Recalcular el estado de todos en esta etapa
      const todasLasAsignaciones = etapaActiva.asignaciones.map(a => 
        a.id === asignacionActualizada.id ? asignacionActualizada : a
      );

      const algunRechazo = todasLasAsignaciones.some(a => a.estado === "RECHAZADO");
      const todosAprobaron = todasLasAsignaciones.every(a => a.estado === "APROBADO");
      const tipoAprobacion = etapaActiva.workflowEtapa.tipo; // SECUENCIAL o PARALELA

      // Si es rechazo, la etapa actual muere y el justificante es rechazado
      if (algunRechazo) {
        await tx.workflowEtapaInstancia.update({
          where: { id: etapaActiva.id },
          data: { estado: "COMPLETADA", completadaEn: new Date() }
        });

        await tx.justificantes.update({
          where: { id: justificanteId },
          data: { status: JustificanteStatus.CON_OBSERVACIONES } // O CON_OBSERVACIONES según regla de negocio
        });

        return tx.justificantes.findUnique({
          where: { id: justificanteId },
          include: { workflowInstancia: { include: { etapasInstancia: { include: { asignaciones: true } } } } }
        });
      }

      // Si es paralela o secuencial, evaluamos si ya todos emitieron su voto
      // Para SECUENCIAL usualmente es 1 persona. Para PARALELA son múltiples.
      if (todosAprobaron) {
        // La etapa actual finaliza exitosamente
        await tx.workflowEtapaInstancia.update({
          where: { id: etapaActiva.id },
          data: { estado: "COMPLETADA", completadaEn: new Date() }
        });

        // Lógica particular del Tutor en etapa 1: puede reescribir docentes
        if (etapaActiva.orden === 1) {
          const etapaSiguiente = justificante.workflowInstancia!.etapasInstancia.find(e => e.orden === etapaActiva.orden + 1);
          
          if (etapaSiguiente) {
            await tx.workflowEtapaInstancia.update({
              where: { id: etapaSiguiente.id },
              data: { estado: "EN_PROCESO", iniciadaEn: new Date() }
            });

            // Tutor re-asigna docentes (sobre-escribiendo los del estudiante)
            if (profesoresEmails && Array.isArray(profesoresEmails) && profesoresEmails.length > 0) {
              await tx.workflowAsignacion.deleteMany({
                where: { etapaInstanciaId: etapaSiguiente.id }
              });

              const emailsUnicos = Array.from(new Set(profesoresEmails));
              const profesoresFiltrados = emailsUnicos.filter(email => email !== token.email);
              if (profesoresFiltrados.length > 0) {
                await tx.workflowAsignacion.createMany({
                  data: profesoresFiltrados.map((email: string) => ({
                    etapaInstanciaId: etapaSiguiente.id,
                    email
                  }))
                });

                await tx.notificacion.createMany({
                  data: profesoresFiltrados.map((email: string) => ({
                    usuarioEmail: email,
                    mensaje: `El tutor te ha asignado un nuevo justificante para evaluación.`,
                    tipo: "ASIGNACION",
                    justificanteId: justificanteId
                  }))
                });
              }
            } else if (etapaSiguiente.asignaciones.length === 0) {
              // Si no hay profesores y el estudiante tampoco, saltar? (Pendiente de reglas)
            }
          } else {
             // Si no hay más etapas, el justificante se aprueba por completo
             await tx.justificantes.update({
               where: { id: justificanteId },
               data: { status: JustificanteStatus.FINALIZADO }
             });
          }
        } else {
          // Etapa > 1 aprobada (por todos si es paralela) -> pasar a siguiente o finalizar
          const etapaSiguiente = justificante.workflowInstancia!.etapasInstancia.find(e => e.orden === etapaActiva.orden + 1);
          
          if (etapaSiguiente) {
            await tx.workflowEtapaInstancia.update({
              where: { id: etapaSiguiente.id },
              data: { estado: "EN_PROCESO", iniciadaEn: new Date() }
            });
          } else {
            // Ya no hay más etapas. Justificante aprobado
            await tx.justificantes.update({
              where: { id: justificanteId },
              data: { status: JustificanteStatus.FINALIZADO }
            });
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
