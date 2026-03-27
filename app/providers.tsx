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
    <div className="min-h-screen bg-background flex flex-col">
      {showHeader && <Header />}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <Toaster />
    </div>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <AuthProvider>
        <AppLayout>{children}</AppLayout>
      </AuthProvider>
    </SessionProvider>
  );
}
