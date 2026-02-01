'use client';

import { Header } from "@/components/header";
import { AuthProvider } from "@/lib/auth-context";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Header/>
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </div>
      </AuthProvider>
    </SessionProvider>
  )
}
