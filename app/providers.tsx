'use client';

import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  // Mostrar el header solo si hay usuario logueado y no está en la vista de login (/)
  const showHeader = Boolean(user) && pathname !== '/';

  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header />}
      <div className="container mx-auto px-4 py-6">
        {children}
      </div>
      <Toaster />
    </div>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <AppLayout>{children}</AppLayout>
      </AuthProvider>
    </SessionProvider>
  );
}
