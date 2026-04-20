import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import path from "path"
import fs from "fs/promises"
import { JustificanteStatus } from "@/generated/prisma/client"

// 🔹 GET BY ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    const justificante = await prisma.justificantes.findUnique({
      where: { id },
      include: {
        estudiante: true,
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
    })

    if (!justificante) {
      return NextResponse.json(
        { error: "No encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(justificante)

  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener justificante" },
      { status: 500 }
    )
  }
}

// 🔹 UPDATE (PUT)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    // 🔐 Autenticación
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET!
    })

    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 1️⃣ Obtener justificante actual para verificar permisos y estado
    const justificanteActual = await prisma.justificantes.findUnique({
      where: { id },
      include: {
        workflowInstancia: {
          include: {
            etapasInstancia: true
          }
        }
      }
    })

    if (!justificanteActual) {
      return NextResponse.json({ error: "Justificante no encontrado" }, { status: 404 })
    }

    // Verificar propiedad
    if (justificanteActual.estudianteId !== token.sub && token.role !== "ADMIN") {
      return NextResponse.json({ error: "No tienes permiso para editar este justificante" }, { status: 403 })
    }

    // Verificar estado del workflow (No se puede editar si el tutor ya completó su etapa 1)
    const etapaTutor = justificanteActual.workflowInstancia?.etapasInstancia.find(e => e.orden === 1)
    if (etapaTutor?.estado === "COMPLETADA" && token.role !== "ADMIN") {
      return NextResponse.json({ error: "No se puede editar un justificante que ya ha sido procesado por el tutor" }, { status: 400 })
    }

    // 📦 Obtener formData
    const data = await req.formData()
    const file = data.get("file") as File | null
    const fechaInicio = data.get("fechaInicio") as string
    const fechaFin = data.get("fechaFin") as string
    const motivo = data.get("motivo") as string
    const descripcion = data.get("descripcion") as string
    const tutorEmail = data.get("tutorEmail") as string
    const profesoresEmailsRaw = data.get("profesoresEmails") as string
    const profesoresEmails = profesoresEmailsRaw ? JSON.parse(profesoresEmailsRaw) : []

    let fileUrl = justificanteActual.fileUrl

    // 📂 Manejo de archivo nuevo si existe
    if (file && typeof file !== "string") {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const uploadDir = path.join(process.cwd(), "uploads/justificantes")
      await fs.mkdir(uploadDir, { recursive: true })

      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`
      const filePath = path.join(uploadDir, fileName)
      await fs.writeFile(filePath, buffer)

      // Borrar archivo anterior si existe
      if (justificanteActual.fileUrl) {
        const oldPath = path.join(process.cwd(), justificanteActual.fileUrl)
        try { await fs.unlink(oldPath) } catch (e) { console.warn("No se pudo borrar archivo anterior", e) }
      }

      fileUrl = `/uploads/justificantes/${fileName}`
    }

    // 🔁 Transacción para actualizar datos y workflow
    const result = await prisma.$transaction(async (tx) => {
      // A) Actualizar datos básicos
      const updated = await tx.justificantes.update({
        where: { id },
        data: {
          fechaInicio: new Date(fechaInicio),
          fechaFin: new Date(fechaFin),
          motivo,
          descripcion,
          fileUrl,
          // Si el justificante estaba marcado como observado/rechazado, lo devolvemos a EN_PROCESO
          status: JustificanteStatus.EN_PROCESO
        }
      })

      const instanciaId = justificanteActual.workflowInstancia?.id
      if (instanciaId) {
        const etapas = justificanteActual.workflowInstancia?.etapasInstancia || []
        
        // B) Actualizar Tutor (Etapa 1)
        const e1 = etapas.find(e => e.orden === 1)
        if (e1 && tutorEmail) {
          // Resetear estado de la etapa del tutor a EN_PROCESO por si estaba completada (aunque el check de arriba lo previene, por seguridad)
          await tx.workflowEtapaInstancia.update({
            where: { id: e1.id },
            data: { estado: "EN_PROCESO", iniciadaEn: new Date(), completadaEn: null }
          })

          // Actualizar asignación
          await tx.workflowAsignacion.deleteMany({ where: { etapaInstanciaId: e1.id } })
          await tx.workflowAsignacion.create({
            data: { etapaInstanciaId: e1.id, email: tutorEmail }
          })
        }

        // C) Actualizar Profesores (Etapa 2)
        const e2 = etapas.find(e => e.orden === 2)
        if (e2 && profesoresEmails.length > 0) {
          await tx.workflowAsignacion.deleteMany({ where: { etapaInstanciaId: e2.id } })
          const profesoresFiltrados = profesoresEmails.filter((email: string) => email !== tutorEmail)
          await tx.workflowAsignacion.createMany({
            data: profesoresFiltrados.map((email: string) => ({
              etapaInstanciaId: e2.id,
              email
            }))
          })
        }
      }

      return updated
    })

    return NextResponse.json({ success: true, justificante: result })

  } catch (error) {
    console.error("Error updating justificante:", error)
    return NextResponse.json(
      { error: "Error al actualizar justificante" },
      { status: 500 }
    )
  }
}

// 🔹 DELETE
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    await prisma.justificantes.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: "Eliminado correctamente" }
    )

  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar justificante" },
      { status: 500 }
    )
  }
}