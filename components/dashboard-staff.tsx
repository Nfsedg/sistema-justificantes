"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
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
import { JustificanteEvaluar } from "./justificante-evaluar"; // Lo crearemos más adelante

export function DashboardStaff() {
  const { user } = useAuth();
  const [justificantes, setJustificantes] = useState<Justificante[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJustificante, setSelectedJustificante] = useState<Justificante | null>(null);
  const [isEvaluarOpen, setIsEvaluarOpen] = useState(false);

  // Consideramos coordinador o admin basado en el rol real de sesión
  const isCoordinador = user?.role === "COORDINADOR";

  const fetchJustificantes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/justificantes/api/justificantes");
      if (res.ok) {
        const data = await res.json();
        setJustificantes(data);
      } else {
        console.error("Failed to fetch justificantes");
      }
    } catch (error) {
      console.error("Error fetching justificantes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJustificantes();
  }, [user]);

  const handleEvaluarSuccess = () => {
    setIsEvaluarOpen(false);
    fetchJustificantes(); // Recargar tras evaluar
  };

  const stats = {
    total: justificantes.length,
    pendientes: justificantes.filter((j) => j.status === "EN_PROCESO").length,
    aprobados: justificantes.filter((j) => j.status === "FINALIZADO").length,
    alumnos: new Set(justificantes.map((j) => j.estudianteId)).size,
  };

  const pendientes = justificantes.filter((j) => j.status === "EN_PROCESO");
  const recientes = [...justificantes]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 10);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando justificantes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Asignados
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
            <p className="text-xs text-muted-foreground">en proceso</p>
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
            <p className="text-xs text-muted-foreground">finalizados</p>
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
                : "Todos los justificantes en los que participas"
            }
            onViewDetails={(j) => {
              setSelectedJustificante(j);
              setIsEvaluarOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="pendientes" className="mt-6">
          <JustificantesList
            justificantes={pendientes}
            isAlumnoView={false}
            title="Justificantes Pendientes"
            description="Justificantes que están en proceso de evaluación"
            onViewDetails={(j) => {
              setSelectedJustificante(j);
              setIsEvaluarOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="recientes" className="mt-6">
          <JustificantesList
            justificantes={recientes}
            isAlumnoView={false}
            title="Justificantes Recientes"
            description="Últimos 10 justificantes asignados"
            onViewDetails={(j) => {
              setSelectedJustificante(j);
              setIsEvaluarOpen(true);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Drawer/Modal para evaluar */}
      {selectedJustificante && isEvaluarOpen && (
        <JustificanteEvaluar
          justificante={selectedJustificante}
          isOpen={isEvaluarOpen}
          setIsOpen={setIsEvaluarOpen}
          onSuccess={handleEvaluarSuccess}
        />
      )}
    </div>
  );
}
