import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import { Role } from "@/generated/prisma/client"

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET!
    })

    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (token.role !== "COORDINADOR") {
      return NextResponse.json({ error: "Solo los coordinadores pueden realizar esta acción" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const roleParam = searchParams.get("role")

    const queryWhere: any = {}
    if (roleParam && Object.values(Role).includes(roleParam as Role)) {
      queryWhere.role = roleParam as Role
    }

    const users = await prisma.user.findMany({
      where: queryWhere,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(users)

  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    )
  }
}
