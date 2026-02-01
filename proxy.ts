// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET!,
  });

  const { pathname } = req.nextUrl;

  // Public routes (no auth required)
  const publicPaths = ["/login", "/api/auth", "/_next", "/favicon.ico"];

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Protected routes
  const protectedPaths = ["/dashboard", "/justificantes", "/profile", "/upload", "/estudiante"];

  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );


  // If logged in, handle role-based redirects
  if (token?.role) {
    if (pathname.startsWith("/api")) {
      return NextResponse.next();
    }
    // STUDENT
    if (token.role === "STUDENT") {
      if (!pathname.startsWith("/estudiante")) {
        return NextResponse.redirect(new URL("/estudiante", req.url));
      }
    }

    // TEACHER
    if (token.role === "TEACHER") {
      if (!pathname.startsWith("/justificantes")) {
        return NextResponse.redirect(new URL("/justificantes", req.url));
      }
    }
  }

  // If trying to access protected route without session → login
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }


  return NextResponse.next();
}

// IMPORTANT: limit where middleware runs
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
