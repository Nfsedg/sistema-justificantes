import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

// Obtener todas las notificaciones no leídas del usuario authenticado
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET!,
    });

    if (!token?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notificaciones = await prisma.notificacion.findMany({
      where: {
        usuarioEmail: token.email,
        leida: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        justificante: true,
      },
    });

    return NextResponse.json(notificaciones);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Error al obtener notificaciones" },
      { status: 500 }
    );
  }
}

// Marcar notificación(es) como leídas
export async function PATCH(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET!,
    });

    if (!token?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body;

    if (id) {
      // Marcar una específica
      const notificacion = await prisma.notificacion.updateMany({
        where: {
          id: parseInt(id),
          usuarioEmail: token.email,
        },
        data: {
          leida: true,
        },
      });
      return NextResponse.json({ success: true, count: notificacion.count });
    } else {
      // Marcar todas como leídas
      const notificaciones = await prisma.notificacion.updateMany({
        where: {
          usuarioEmail: token.email,
          leida: false,
        },
        data: {
          leida: true,
        },
      });
      return NextResponse.json({ success: true, count: notificaciones.count });
    }
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Error al actualizar notificaciones" },
      { status: 500 }
    );
  }
}
