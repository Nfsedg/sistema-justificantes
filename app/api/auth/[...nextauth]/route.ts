import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import type { NextAuthOptions } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

function isNumericLocalPart(email: string): boolean {
  const [localPart] = email.split("@");
  return /^[0-9]+$/.test(localPart);
}

const COORDINATOR_EMAILS = [
  "ing.software@upqroo.edu.mx",
  "lic.terapiafisica@upqroo.edu.mx",
  "ing.biomedica@upqroo.edu.mx",
  "ing.financiera@upqroo.edu.mx",
  "ing.biotecnologia@upqroo.edu.mx",
  "coordinator@upqroo.edu.mx",
];

function determineRole(email: string): "ESTUDIANTE" | "COORDINADOR" | "DOCENTE" | "TUTOR" {
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    if (process.env.DEV_TUTOR_EMAIL && email === process.env.DEV_TUTOR_EMAIL) return "TUTOR";
    if (process.env.DEV_COORDINATOR_EMAIL && email === process.env.DEV_COORDINATOR_EMAIL) return "COORDINADOR";
  }

  if (COORDINATOR_EMAILS.includes(email)) return "COORDINADOR";
  if (isNumericLocalPart(email)) return "ESTUDIANTE";
  
  return "DOCENTE";
}

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  events: {
    async createUser({ user }) {
      if (!user.email) return;
      const newRole = determineRole(user.email);
      await prisma.user.update({
        where: { id: user.id },
        data: { role: newRole as any },
      });
    },
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role; 
      }
      return session;
    },
    async signIn({ account, profile }: any) {
      if (account.provider === "google") {
        const isDev = process.env.NODE_ENV === 'development';
        const isAllowed = isDev ? profile.email_verified : (profile.email_verified && profile.email.endsWith("@upqroo.edu.mx"));
        
        if (!isAllowed) {
          // Redirigir explícitamente a la raíz (que es /justificantes por el basePath)
          // Esto asegura que se respete el basePath y se mantenga al usuario en el flujo de login.
          return "/?error=AccessDenied";
        }
        return true;
      }
      return false;
    },
    async jwt({ token, user }) {
      // Al iniciar sesión (user está presente)
      if (user) {
        token.id = user.id;
        token.email = user.email;
        
        // Intentar obtener el rol de la DB
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        
        if (dbUser?.role) {
          token.role = dbUser.role;
        } else {
          // Fallback si la DB tarda en responder o es un usuario nuevo en proceso de creación
          token.role = determineRole(user.email!);
        }
      }
      
      // Si el token ya existe pero por algún motivo perdió el rol
      if (!token.role && (token.id || token.sub)) {
        const userId = (token.id || token.sub) as string;
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
        });
        if (dbUser?.role) {
          token.role = dbUser.role;
        } else if (token.email) {
          token.role = determineRole(token.email as string);
        }
      }

      return token;
    }
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }