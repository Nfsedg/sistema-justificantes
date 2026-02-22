"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  getJustificantes,
  getJustificantesByCarrera,
} from "@/lib/justificantes-store";
import { Justificante } from "@/lib/types";
import { JustificantesList } from "./justificantes-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Clock,
  CheckCircle2,
  Users,
  GraduationCap,
} from "lucide-react";

export function DashboardStaff() {
  const { user } = useAuth();
  const [justificantes, setJustificantes] = useState<Justificante[]>([]);

  const isCoordinador = user?.role === "coordinador";

  useEffect(() => {
    setJustificantes(getJustificantes());
  }, [user, isCoordinador]);

  const stats = {
    total: justificantes.length,
    pendientes: justificantes.length,
    aprobados: 0,
    alumnos: new Set(justificantes.map((j) => j.estudianteId)).size,
  };

  const pendientes = justificantes;
  const recientes = [...justificantes]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {isCoordinador ? "Panel de Coordinación" : "Panel de Consulta"}
        </h1>
        <p className="text-muted-foreground">
          {isCoordinador ? (
            <>
              <GraduationCap className="inline w-4 h-4 mr-1" />
              Coordinador
            </>
          ) : (
            "Consulta los justificantes de los alumnos"
          )}
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Justificantes
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">registrados</p>
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
            <p className="text-xs text-muted-foreground">por revisar</p>
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
              Alumnos
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.alumnos}</div>
            <p className="text-xs text-muted-foreground">con justificantes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="pendientes">
            Pendientes ({stats.pendientes})
          </TabsTrigger>
          <TabsTrigger value="recientes">Recientes</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-6">
          <JustificantesList
            justificantes={justificantes}
            isAlumnoView={false}
            title="Todos los Justificantes"
            description={
              isCoordinador
                ? `Justificantes de alumnos de tu coordinación`
                : "Todos los justificantes registrados en el sistema"
            }
          />
        </TabsContent>

        <TabsContent value="pendientes" className="mt-6">
          <JustificantesList
            justificantes={pendientes}
            isAlumnoView={false}
            title="Justificantes Pendientes"
            description="Justificantes que requieren atención"
          />
        </TabsContent>

        <TabsContent value="recientes" className="mt-6">
          <JustificantesList
            justificantes={recientes}
            isAlumnoView={false}
            title="Justificantes Recientes"
            description="Últimos 10 justificantes registrados"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
