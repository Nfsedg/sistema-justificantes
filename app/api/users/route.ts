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

    const { searchParams } = new URL(req.url)
    const roleParam = searchParams.get("role")
    const rolesParam = searchParams.get("roles")

    if (token.role !== "COORDINADOR") {
      const isStudentFetchingTeachers = token.role === "ESTUDIANTE" && 
        ((roleParam === "DOCENTE" || roleParam === "TUTOR") || 
         (rolesParam && rolesParam.split(',').every(r => r === "DOCENTE" || r === "TUTOR")));

      if (!isStudentFetchingTeachers) {
        return NextResponse.json({ error: "Solo los coordinadores pueden realizar esta acción" }, { status: 403 })
      }
    }

    const queryWhere: any = {}
    if (roleParam && Object.values(Role).includes(roleParam as Role)) {
      queryWhere.role = roleParam as Role
    } else if (rolesParam) {
      const rolesArray = rolesParam.split(',').filter(r => Object.values(Role).includes(r as Role)) as Role[];
      if (rolesArray.length > 0) {
        queryWhere.role = { in: rolesArray }
      }
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
