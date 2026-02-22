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
  events: {
    async createUser({ user }) {
      if (!user.email) return;
      
      let newRole: "ESTUDIANTE" | "COORDINADOR" | "DOCENTE" = "DOCENTE";
      
      if (isNumericLocalPart(user.email)) {
        newRole = "ESTUDIANTE";
      } else if (user.email === "coordinator@upqroo.edu.mx") {
        newRole = "COORDINADOR";
      }
      
      await prisma.user.update({
        where: { id: user.id },
        data: { role: newRole },
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
        return profile.email_verified && profile.email.endsWith("@upqroo.edu.mx")
      }
      return false
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        })
        if (dbUser?.role) {
          token.role = dbUser.role;
          token.id = dbUser.id;
        }
      }
      return token
    }
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }