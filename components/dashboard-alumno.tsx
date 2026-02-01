"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getJustificantesByAlumno } from "@/lib/justificantes-store";
import { Justificante } from "@/lib/types";
import { JustificanteForm } from "./justificante-form";
import { JustificantesList } from "./justificantes-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Clock, CheckCircle2, XCircle } from "lucide-react";

export function DashboardAlumno() {
  const { user } = useAuth();
  const [justificantes, setJustificantes] = useState<Justificante[]>([]);

  useEffect(() => {
    if (user) {
      setJustificantes(getJustificantesByAlumno(user.id));
    }
  }, [user]);

  const stats = {
    total: justificantes.length,
    pendientes: justificantes.filter((j) => j.status === "pendiente").length,
    aprobados: justificantes.filter((j) => j.status === "aprobado").length,
    rechazados: justificantes.filter((j) => j.status === "rechazado").length,
  };

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Hola, {user?.nombre}
        </h1>
        <p className="text-muted-foreground">
          Gestiona tus justificantes de ausencia
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              justificantes enviados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendientes
            </CardTitle>
            <Clock className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendientes}</div>
            <p className="text-xs text-muted-foreground">en revisión</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aprobados
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aprobados}</div>
            <p className="text-xs text-muted-foreground">aceptados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rechazados
            </CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rechazados}</div>
            <p className="text-xs text-muted-foreground">no aceptados</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="nuevo" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="nuevo">Nuevo Justificante</TabsTrigger>
          <TabsTrigger value="historial">Mi Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="nuevo" className="mt-6">
          <div className="max-w-2xl">
            <JustificanteForm />
          </div>
        </TabsContent>

        <TabsContent value="historial" className="mt-6">
          <JustificantesList
            justificantes={justificantes}
            showAlumnoInfo={false}
            title="Mis Justificantes"
            description="Historial de tus justificantes enviados"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
