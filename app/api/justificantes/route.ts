import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import path from "path"
import fs from "fs/promises"
import { JustificanteStatus } from "@/generated/prisma/client"

export async function POST(req: NextRequest) {
  try {
    // 🔐 Autenticación
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET!
    })

    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (token.role !== "ESTUDIANTE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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

    const profesoresEmails = profesoresEmailsRaw
      ? JSON.parse(profesoresEmailsRaw)
      : []

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files allowed" }, { status: 400 })
    }

    // 📂 Guardar archivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), "uploads/justificantes")

    await fs.mkdir(uploadDir, { recursive: true })

    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`
    const filePath = path.join(uploadDir, fileName)

    await fs.writeFile(filePath, buffer)

    const fileUrl = `/uploads/justificantes/${fileName}`

    // 🔁 Transacción completa
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Crear justificante
      const justificante = await tx.justificantes.create({
        data: {
          estudianteId: token.sub!,
          fechaInicio: new Date(fechaInicio),
          fechaFin: new Date(fechaFin),
          motivo,
          descripcion,
          fileUrl,
          status: JustificanteStatus.EN_PROCESO
        }
      })

      // 2️⃣ Obtener workflow fijo
      const workflow = await tx.workflow.findFirst({
        include: { etapas: true }
      })

      if (!workflow) {
        throw new Error("Workflow no configurado")
      }

      // 3️⃣ Crear instancia workflow
      const instancia = await tx.workflowInstancia.create({
        data: {
          justificanteId: justificante.id,
          workflowId: workflow.id
        }
      })

      // 4️⃣ Crear etapas instanciadas
      for (const etapa of workflow.etapas) {
        const etapaInstancia = await tx.workflowEtapaInstancia.create({
          data: {
            workflowInstanciaId: instancia.id,
            workflowEtapaId: etapa.id,
            orden: etapa.orden,
            estado: etapa.orden === 1 ? "EN_PROCESO" : "PENDIENTE"
          }
        })

        // Tutor (etapa 1)
        if (etapa.orden === 1 && tutorEmail) {
          await tx.workflowAsignacion.create({
            data: {
              etapaInstanciaId: etapaInstancia.id,
              email: tutorEmail
            }
          })
        }

        // Profesores (etapa 2)
        if (etapa.orden === 2 && profesoresEmails.length > 0) {

          const profesoresFiltrados = profesoresEmails.filter(
            (email: string) => email !== tutorEmail
          )

          await tx.workflowAsignacion.createMany({
            data: profesoresFiltrados.map((email: string) => ({
              etapaInstanciaId: etapaInstancia.id,
              email
            }))
          })
        }
      }

      return justificante
    })

    return NextResponse.json(
      { success: true, justificante: result },
      { status: 201 }
    )

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

// 🔹 GET ALL
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET!
    })

    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let queryWhere: any = {}

    if (token.role === "ESTUDIANTE") {
      queryWhere = { estudianteId: token.sub }
    } else if (token.role === "DOCENTE") {
      if (!token.email) {
        return NextResponse.json({ error: "El docente no tiene un correo válido registrado en la sesión" }, { status: 400 })
      }
      queryWhere = {
        workflowInstancia: {
          etapasInstancia: {
            some: {
              asignaciones: {
                some: {
                  email: token.email
                }
              }
            }
          }
        }
      }
    } else if (token.role !== "COORDINADOR") {
      return NextResponse.json({ error: "Rol no válido" }, { status: 403 })
    }

    const justificantes = await prisma.justificantes.findMany({
      where: queryWhere,
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
    })

    return NextResponse.json(justificantes)

  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener justificantes" },
      { status: 500 }
    )
  }
}