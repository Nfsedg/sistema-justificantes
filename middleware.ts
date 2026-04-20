import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const BASE_PATH = "/justificantes";
const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
const cookiePrefix = useSecureCookies ? "__Secure-" : "";
const sessionCookieName = `${cookiePrefix}next-auth.session-token`;

export async function middleware(req: NextRequest) {
  // Debug de cookies crudas para ver si llegan al servidor
  const allCookies = req.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 10)}...`);
  
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET!,
    cookieName: sessionCookieName,
  });

  const { pathname } = req.nextUrl;
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    console.log(`------------------------------------------------`);
    console.log(`[Middleware] Pathname: ${pathname}`);
    console.log(`[Middleware] Token encontrado: ${!!token}`);
    if (token) console.log(`[Middleware] Rol: ${token.role}`);
    console.log(`[Middleware] Cookies presentes: ${allCookies.join(", ")}`);
  }

  // 1. Rutas públicas
  const publicApiPaths = ["/api/auth", "/_next", "/favicon.ico", "/logo_upqroo_150.png"];
  const isStaticFile = pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/i);
  
  if (publicApiPaths.some((path) => pathname.startsWith(path)) || isStaticFile) {
    return NextResponse.next();
  }

  const isAuthRoute = pathname === "/login" || pathname === "/";

  // 3. SI EL USUARIO NO ESTÁ LOGUEADO
  if (!token) {
    if (!isAuthRoute) {
      console.log(`[Middleware] Redirigiendo a login: usuario no autenticado en ${pathname}`);
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("callbackUrl", BASE_PATH + pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 4. SI EL USUARIO SÍ ESTÁ LOGUEADO
  if (token) {
    const role = (token.role as string) || "GUEST";
    
    // IMPORTANTE: Aquí las rutas NO deben llevar "/justificantes" 
    // porque el middleware ya recibe la ruta relativa al basePath.
    const rolePaths: Record<string, string[]> = {
      "ESTUDIANTE": ["/estudiante"],
      "DOCENTE": ["/justificantes"], // El dashboard del docente es /justificantes
      "TUTOR": ["/tutor"],
      "COORDINADOR": ["/coordinador"]
    };

    let defaultRoleDashboard = "/login";
    if (role === "ESTUDIANTE") defaultRoleDashboard = "/estudiante";
    if (role === "DOCENTE") defaultRoleDashboard = "/justificantes";
    if (role === "TUTOR") defaultRoleDashboard = "/tutor";
    if (role === "COORDINADOR") defaultRoleDashboard = "/coordinador";

    if (isAuthRoute) {
      const url = req.nextUrl.clone();
      url.pathname = defaultRoleDashboard;
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/api")) return NextResponse.next();

    const allowedPrefixes = rolePaths[role] || [];
    const isAllowed = pathname === "/" || allowedPrefixes.some(prefix => pathname.startsWith(prefix)) || pathname.startsWith("/docs");
    
    if (!isAllowed) {
      console.log(`[Middleware] Acceso denegado: Rol ${role} no puede entrar a ${pathname}. Redirigiendo a ${defaultRoleDashboard}`);
      const url = req.nextUrl.clone();
      url.pathname = defaultRoleDashboard;
      return NextResponse.redirect(url);
    }
  }

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
