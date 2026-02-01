import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });

    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await req.formData();
    const file = data.get("file") as File | null;
  
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
  
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }
  
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
  
    const uploadDir = path.join(process.cwd(), "uploads/justificantes");
  
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = path.join(uploadDir, fileName);
  
    fs.writeFileSync(filePath, buffer);

    const record = await prisma.justificantes.create({
      data: {
        userId: token!.sub,
        fileUrl: `/uploads/${fileName}`,
        fechaFin: new Date(),
        fechaInicio: new Date(),
        motivo: "Cita médica",
        descripcion: "Justificante subido",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  
    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
