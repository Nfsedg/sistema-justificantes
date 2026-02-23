import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET!
    })

    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (token.role !== "TUTOR" && token.role !== "COORDINADOR") {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const docentes = await prisma.user.findMany({
      where: {
        role: "DOCENTE"
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(docentes)

  } catch (error) {
    console.error("Error fetching docentes:", error)
    return NextResponse.json(
      { error: "Error al obtener docentes" },
      { status: 500 }
    )
  }
}
