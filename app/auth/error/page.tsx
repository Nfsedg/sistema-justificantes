"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldAlert, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, { title: string; description: string }> = {
    AccessDenied: {
      title: "Acceso Denegado",
      description: "No tienes permisos para acceder a este sistema. Asegúrate de usar tu correo institucional con dominio @upqroo.edu.mx.",
    },
    Verification: {
      title: "Error de Verificación",
      description: "El enlace de verificación ha expirado o ya ha sido utilizado.",
    },
    Configuration: {
      title: "Error de Configuración",
      description: "Hay un problema con la configuración del servidor de autenticación.",
    },
    Default: {
      title: "Error de Autenticación",
      description: "Ocurrió un error inesperado al intentar iniciar sesión.",
    },
  };

  const currentError = errorMessages[error as string] || errorMessages.Default;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1a0a00 0%, #3d1a00 40%, #7c3500 100%)",
      }}
    >
      {/* Círculos decorativos para mantener consistencia con el Login */}
      <div
        className="absolute top-[-120px] left-[-120px] w-[450px] h-[450px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(251,146,60,0.25), transparent)",
        }}
      />
      <div
        className="absolute bottom-[-120px] right-[-120px] w-[450px] h-[450px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(234,88,12,0.2), transparent)",
        }}
      />
      <div
        className="absolute top-[35%] right-[8%] w-[220px] h-[220px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(251,146,60,0.12), transparent)",
        }}
      />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo y título */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Image 
              src="/justificantes/logo_upqroo_150.png" 
              alt="Logo UPQROO" 
              width={80} 
              height={80} 
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-wider">SIJE</h1>
            <p className="text-lg text-orange-200 font-medium">
              Sistema de Justificantes Estudiantiles
            </p>
          </div>
        </div>

        {/* Card de Error */}
        <Card className="border-0 shadow-2xl ring-1 ring-orange-300/30 bg-background/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-destructive/10 rounded-full animate-pulse">
                <ShieldAlert className="h-12 w-12 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl text-destructive font-black tracking-tight">
              {currentError.title}
            </CardTitle>
            <CardDescription className="text-base mt-3 font-medium px-2">
              {currentError.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <Link href="/login" className="block w-full">
              <Button
                className="w-full h-14 text-lg font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-lg transition-all active:scale-95"
              >
                <LogIn className="mr-3 h-6 w-6" />
                Intentar de Nuevo
              </Button>
            </Link>

            <div className="flex flex-col space-y-4 pt-2">
              <div className="h-px bg-orange-100/10 w-full" />
              <p className="text-sm text-center text-muted-foreground leading-relaxed">
                Recuerda que el acceso es exclusivo para la comunidad universitaria con correo institucional.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-3">
          <p className="text-sm text-orange-200/80 font-medium">
            Universidad Politécnica de Quintana Roo
          </p>
          <p className="text-[10px] text-orange-300/50 uppercase tracking-[0.2em]">
            Cancún, México
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center bg-[#1a0a00]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
