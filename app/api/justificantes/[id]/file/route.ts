import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import path from "path"
import fs from "fs/promises"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET!
    });

    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    });

    if (!justificante) {
      return NextResponse.json({ error: "Documento no encontrado o no existe" }, { status: 404 });
    }

    // 🛡️ Seguridad y permisos
    if (token.role === "ESTUDIANTE") {
      if (justificante.estudianteId !== token.sub) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (token.role === "DOCENTE" || token.role === "TUTOR") {
      if (!token.email) {
        return NextResponse.json({ error: "Correo del usuario no válido" }, { status: 400 });
      }
      
      const isAssigned = justificante.workflowInstancia?.etapasInstancia?.some((etapa: any) =>
        etapa.asignaciones?.some((asignacion: any) => asignacion.email === token.email)
      );

      if (!isAssigned) {
        return NextResponse.json({ error: "No tienes permiso para ver este documento" }, { status: 403 });
      }
    } else if (token.role !== "COORDINADOR") {
      // Si no es ESTUDIANTE, DOCENTE, TUTOR ni COORDINADOR (ej. ADMIN si hay, pero asumiendo COORDINADOR como rol máximo válido).
      // Si el sistema tiene ADMIN, podrías permitirlo aquí. Para el contexto actual, mantenemos lo estricto.
      return NextResponse.json({ error: "Rol no válido" }, { status: 403 });
    }

    if (!justificante.fileUrl) {
      return NextResponse.json({ error: "No URL found for justificante" }, { status: 404 });
    }

    // El fileUrl en la DB viene normalmente como '/uploads/justificantes/archivo.pdf'
    // Extraemos sólo el nombre del archivo
    const fileName = justificante.fileUrl.split("/").pop();
    if (!fileName) {
      return NextResponse.json({ error: "Invalid file URL" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "uploads/justificantes", fileName);

    let fileBuffer;
    try {
      fileBuffer = await fs.readFile(filePath);
    } catch (fsError) {
      return NextResponse.json({ error: "El archivo físico no se pudo encontrar en el servidor" }, { status: 404 });
    }

    // Determinar content type basándonos en la extensión
    let contentType = "application/octet-stream";
    const extension = path.extname(fileName).toLowerCase();
    
    if (extension === ".pdf") {
      contentType = "application/pdf";
    } else if (extension === ".jpg" || extension === ".jpeg") {
      contentType = "image/jpeg";
    } else if (extension === ".png") {
      contentType = "image/png";
    }

    const safeFileName = fileName.replace(/[^\x20-\x7E]/g, "");
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${safeFileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
      }
    });

  } catch (error) {
    console.error("Error al obtener el archivo del justificante:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
