import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });

  if (!token?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const justificante = await prisma.justificantes.findUnique({
    where: { id: Number(params.id) },
  });

  if (!justificante) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = justificante.userId === token.sub;
  const isPrivileged = token.role === "TEACHER" || token.role === "ADMIN" || token.role === "COORDINATOR";

  if (!isOwner && !isPrivileged) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const filePath = path.join(
    process.cwd(),
    "uploads/justificantes",
    justificante.fileUrl
  );

  try {
    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `inline; filename="${justificante.fileUrl}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found on server" }, { status: 404 });
  }
}
