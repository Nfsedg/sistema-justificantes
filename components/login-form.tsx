"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export function LoginForm() {
  const { loginWithGoogle, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch {
      setError("Error al iniciar sesión. Por favor intenta de nuevo.");
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1a0a00 0%, #3d1a00 40%, #7c3500 100%)",
      }}
    >
      {/* Círculos decorativos */}
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
      <div
        className="absolute bottom-[20%] left-[5%] w-[180px] h-[180px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(253,186,116,0.1), transparent)",
        }}
      />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo y título */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex items-center justify-center">
              <Image
                src="/justificantes/logo_upqroo_150.png"
                alt="Logo UPQROO"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">SIJE</h1>
            <p className="text-lg text-orange-200">
              Sistema de Justificantes Estudiantiles
            </p>
          </div>
        </div>

        {/* Card de login */}
        <Card className="border-0 shadow-xl ring-1 ring-orange-300/30">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Bienvenido</CardTitle>
            <CardDescription>
              Inicia sesión con tu cuenta institucional de la UPQROO
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {error}
              </div>
            )}

            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 text-base bg-transparent"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continuar con Google
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Usa tu correo institucional{" "}
              <span className="font-medium">@upqroo.edu.mx</span>
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-orange-200">
            Universidad Politécnica de Quintana Roo
          </p>
          <p className="text-xs text-orange-300/70">
            Av. Arco Bicentenario MZ 11, Lote 1119-33, Cancún, Q. Roo
          </p>
        </div>
      </div>
    </div>
  );
}