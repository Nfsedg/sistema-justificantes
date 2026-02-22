import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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

// 🔹 UPDATE
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const body = await req.json()

    const justificante = await prisma.justificantes.update({
      where: { id },
      data: {
        fechaInicio: body.fechaInicio ? new Date(body.fechaInicio) : undefined,
        fechaFin: body.fechaFin ? new Date(body.fechaFin) : undefined,
        motivo: body.motivo,
        descripcion: body.descripcion,
        fileUrl: body.fileUrl
      }
    })

    return NextResponse.json(justificante)

  } catch (error) {
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