import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET!,
  });

  const { pathname } = req.nextUrl;

  // 1. Rutas públicas de API y archivos estáticos (las dejamos pasar siempre)
  const publicApiPaths = ["/api/auth", "/_next", "/favicon.ico", "/logo_upqroo_150.png"];
  
  // También permitir cualquier archivo con extensión común de imagen/estático
  const isStaticFile = pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/i);
  
  if (publicApiPaths.some((path) => pathname.startsWith(path)) || isStaticFile) {
    return NextResponse.next();
  }

  // 2. ¿Es la ruta de login o la ruta raíz?
  const isAuthRoute = pathname === "/login" || pathname === "/";

  // 3. SI EL USUARIO NO ESTÁ LOGUEADO
  if (!token) {
    if (!isAuthRoute) {
      // Si intenta ir a una ruta privada sin sesión, mandar al login
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Si intenta ir a /login o /, lo dejamos (para que pueda iniciar sesión)
    return NextResponse.next();
  }

  // 4. SI EL USUARIO SÍ ESTÁ LOGUEADO
  if (token && token.role) {
    const role = token.role as string;
    
    // Rutas permitidas para cada rol (además de /api y páginas de error)
    const rolePaths: Record<string, string[]> = {
      "ESTUDIANTE": ["/estudiante"],
      "DOCENTE": ["/justificantes"], // Se usa /justificantes ya que no hay carpeta /docentes en app
      "TUTOR": ["/tutor", "/justificantes"],
      "COORDINADOR": ["/coordinador", "/justificantes"]
    };

    // Determinar la página de inicio (dashboard) de cada rol
    let defaultRoleDashboard = "/login";
    if (role === "ESTUDIANTE") defaultRoleDashboard = "/estudiante";
    if (role === "DOCENTE") defaultRoleDashboard = "/justificantes";
    if (role === "TUTOR") defaultRoleDashboard = "/tutor";
    if (role === "COORDINADOR") defaultRoleDashboard = "/coordinador";

    // Si un usuario logueado intenta ir al /login o la ruta raíz /, redirigirlo directamente a su dashboard
    if (isAuthRoute) {
      const url = req.nextUrl.clone();
      url.pathname = defaultRoleDashboard;
      return NextResponse.redirect(url);
    }

    // Permitir todas las peticiones a la API si ya está logueado
    if (pathname.startsWith("/api")) {
      return NextResponse.next();
    }

    // Verificar si el rol tiene permiso para acceder a la ruta actual
    const allowedPrefixes = rolePaths[role] || [];
    // Todas las sesiones con token pueden acceder a /docs
    const isAllowed = allowedPrefixes.some(prefix => pathname.startsWith(prefix)) || pathname.startsWith("/docs");
    
    // Si la ruta no le pertenece, se le bloquea y se le envía a su respectivo dashboard
    if (!isAllowed) {
      const url = req.nextUrl.clone();
      url.pathname = defaultRoleDashboard;
      return NextResponse.redirect(url);
    }
  }

  // Si está logueado pero por algún motivo no tiene rol, déjalo pasar (NextAuth maneja su caso en páginas)
  return NextResponse.next();
}

// Configuración sobre qué rutas inspecciona el middleware.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - also exclude any path with a dot (static files in public/)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
