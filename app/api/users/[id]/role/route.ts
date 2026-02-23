import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import { Role } from "@/generated/prisma/client"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET!
    });

    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "COORDINADOR") {
      return NextResponse.json({ error: "Solo los coordinadores pueden realizar esta acción" }, { status: 403 });
    }

    const { role } = await req.json();

    if (!role || !Object.values(Role).includes(role as Role)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Only allow changing between DOCENTE and TUTOR for now as requested
    if (!["DOCENTE", "TUTOR"].includes(user.role) || !["DOCENTE", "TUTOR"].includes(role)) {
       return NextResponse.json({ error: "Cambio de rol no permitido. Solo se puede alternar entre DOCENTE y TUTOR." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role: role as Role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Error interno al actualizar rol" },
      { status: 500 }
    );
  }
}
