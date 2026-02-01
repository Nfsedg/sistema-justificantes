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
      if(user.email === undefined || user.email === null) return;
      if(isNumericLocalPart(user.email)) {
        const defaultRole = await prisma.role.findUnique({
          where: { name: "STUDENT" },
        })
        if (defaultRole) {
          await prisma.user.update({
            where: { id: user.id },
            data: { roleId: defaultRole.id },
          })
        }
      } else if(user.email === "coordinator@upqroo.edu.mx") {
        const defaultRole = await prisma.role.findUnique({
          where: { name: "COORD" },
        })
        if (defaultRole) {
          await prisma.user.update({
            where: { id: user.id },
            data: { roleId: defaultRole.id },
          })
        }
      } else {
        const defaultRole = await prisma.role.findUnique({
          where: { name: "TEACHER" },
        })
        if (defaultRole) {
          await prisma.user.update({
            where: { id: user.id },
            data: { roleId: defaultRole.id },
          })
        }
      }
    },
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
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
          include: { role: true },
        })
        if (dbUser?.role) {
          token.role = dbUser.role.name
          token.id = dbUser.id
        }
      }
      return token
    }
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }