"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { LoginForm } from "@/components/login-form";
import { Header } from "@/components/header";
import { DashboardAlumno } from "@/components/dashboard-alumno";
import { DashboardStaff } from "@/components/dashboard-staff";
import { SessionProvider } from "next-auth/react";

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {user.rol === "alumno" ? <DashboardAlumno /> : <DashboardStaff />}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <SessionProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SessionProvider>
  );
}
