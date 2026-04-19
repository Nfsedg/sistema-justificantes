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
      
      let newRole: "ESTUDIANTE" | "COORDINADOR" | "DOCENTE" | "TUTOR" = "DOCENTE";
      
      const isDev = process.env.NODE_ENV === 'development';
      const devTutorEmail = process.env.DEV_TUTOR_EMAIL;
      const devCoordinatorEmail = process.env.DEV_COORDINATOR_EMAIL;

      if (isDev && devTutorEmail && user.email === devTutorEmail) {
        newRole = "TUTOR";
      } else if (isDev && devCoordinatorEmail && user.email === devCoordinatorEmail) {
        newRole = "COORDINADOR";
      } else if (COORDINATOR_EMAILS.includes(user.email)) {
        newRole = "COORDINADOR";
      } else if (isNumericLocalPart(user.email)) {
        newRole = "ESTUDIANTE";
      }
      
      await prisma.user.update({
        where: { id: user.id },
        data: { role: newRole as any }, // Cast to any to handle Prisma enum type if needed
      });
    },
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // Also expose role to session if needed anywhere else
        (session.user as any).role = token.role; 
      }
      return session;
    },
    async signIn({ account, profile }: any) {
      if (account.provider === "google") {
        const isDev = process.env.NODE_ENV === 'development';
        // En desarrollo, permitir cualquier correo electrónico verificado
        if (isDev) {
          return profile.email_verified;
        }
        // En producción, restringir a correos institucionales
        return profile.email_verified && profile.email.endsWith("@upqroo.edu.mx");
      }
      return false;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        if (dbUser?.role) {
          token.role = dbUser.role;
          token.id = dbUser.id;
        }
      }
      
      // Sobrescribir el rol en el token si estamos en desarrollo
      const isDev = process.env.NODE_ENV === 'development';
      if (isDev && token.email) {
        if (process.env.DEV_TUTOR_EMAIL && token.email === process.env.DEV_TUTOR_EMAIL) {
          token.role = "TUTOR";
        } else if (process.env.DEV_COORDINATOR_EMAIL && token.email === process.env.DEV_COORDINATOR_EMAIL) {
          token.role = "COORDINADOR";
        } else if (COORDINATOR_EMAILS.includes(token.email)) {
          token.role = "COORDINADOR";
        }
      }

      return token;
    }
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }