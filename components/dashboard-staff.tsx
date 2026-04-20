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
  XCircle,
  Users,
} from "lucide-react";
import { JustificanteEvaluar } from "./justificante-evaluar";

export function DashboardStaff() {
  const { user } = useAuth();
  const [justificantes, setJustificantes] = useState<Justificante[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJustificante, setSelectedJustificante] = useState<Justificante | null>(null);
  const [isEvaluarOpen, setIsEvaluarOpen] = useState(false);

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
    fetchJustificantes();
  };

  const justificantesDocente = justificantes.filter(j => {
    const etapaDocente = j.workflowInstancia?.etapasInstancia?.find((e: any) => e.orden === 2);
    const asignacion = etapaDocente?.asignaciones?.find((a: any) => a.email === user?.email);
    // Solo mostrar si el docente está asignado y la etapa ya no está pendiente (es su turno o ya pasó)
    return asignacion && etapaDocente.estado !== "PENDIENTE";
  });

  const stats = {
    total: justificantesDocente.length,
    pendientes: justificantesDocente.filter((j) => {
      const etapaDocente = j.workflowInstancia?.etapasInstancia?.find((e: any) => e.orden === 2);
      const asignacion = etapaDocente?.asignaciones?.find((a: any) => a.email === user?.email);
      return asignacion?.estado === "PENDIENTE";
    }).length,
    aprobados: justificantesDocente.filter((j) => {
      const etapaDocente = j.workflowInstancia?.etapasInstancia?.find((e: any) => e.orden === 2);
      const asignacion = etapaDocente?.asignaciones?.find((a: any) => a.email === user?.email);
      return asignacion?.estado === "APROBADO" || asignacion?.estado === "COMPLETADA" || asignacion?.estado === "FINALIZADO";
    }).length,
    rechazados: justificantesDocente.filter((j) => {
      const etapaDocente = j.workflowInstancia?.etapasInstancia?.find((e: any) => e.orden === 2);
      const asignacion = etapaDocente?.asignaciones?.find((a: any) => a.email === user?.email);
      return asignacion?.estado === "RECHAZADO";
    }).length,
    alumnos: new Set(justificantesDocente.map((j) => j.estudianteId)).size,
  };

  const pendientes = justificantesDocente.filter((j) => {
    const etapaDocente = j.workflowInstancia?.etapasInstancia?.find((e: any) => e.orden === 2);
    const asignacion = etapaDocente?.asignaciones?.find((a: any) => a.email === user?.email);
    return asignacion?.estado === "PENDIENTE";
  });

  const rechazados = justificantesDocente.filter((j) => {
    const etapaDocente = j.workflowInstancia?.etapasInstancia?.find((e: any) => e.orden === 2);
    const asignacion = etapaDocente?.asignaciones?.find((a: any) => a.email === user?.email);
    return asignacion?.estado === "RECHAZADO";
  });

  const aprobados = justificantesDocente.filter((j) => {
    const etapaDocente = j.workflowInstancia?.etapasInstancia?.find((e: any) => e.orden === 2);
    const asignacion = etapaDocente?.asignaciones?.find((a: any) => a.email === user?.email);
    return asignacion?.estado === "APROBADO" || asignacion?.estado === "COMPLETADA" || asignacion?.estado === "FINALIZADO";
  });

  const historial = [...justificantesDocente]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando justificantes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendientes}</div>
            <p className="text-xs text-muted-foreground">en proceso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rechazados</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rechazados}</div>
            <p className="text-xs text-muted-foreground">declinados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aprobados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aprobados}</div>
            <p className="text-xs text-muted-foreground">finalizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alumnos</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.alumnos}</div>
            <p className="text-xs text-muted-foreground">con justificantes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pendientes" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="pendientes">Pendientes ({stats.pendientes})</TabsTrigger>
          <TabsTrigger value="rechazados">Rechazados ({stats.rechazados})</TabsTrigger>
          <TabsTrigger value="aprobados">Aprobados ({stats.aprobados})</TabsTrigger>
          <TabsTrigger value="historial">Historial ({stats.total})</TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="mt-6">
          <JustificantesList
            justificantes={pendientes}
            isAlumnoView={false}
            title="Justificantes Pendientes"
            description="Justificantes que están en proceso de evaluación"
            onViewDetails={(j) => { setSelectedJustificante(j); setIsEvaluarOpen(true); }}
            onActionSuccess={fetchJustificantes}
            userEmail={user?.email ?? ""}
            userRole={user?.role ?? ""}
          />
        </TabsContent>

        <TabsContent value="historial" className="mt-6">
          <JustificantesList
            justificantes={historial}
            isAlumnoView={false}
            title="Historial de Justificantes"
            description="Todos los justificantes asignados"
            onViewDetails={(j) => { setSelectedJustificante(j); setIsEvaluarOpen(true); }}
            onActionSuccess={fetchJustificantes}
            userEmail={user?.email ?? ""}
            userRole={user?.role ?? ""}
          />
        </TabsContent>

        <TabsContent value="rechazados" className="mt-6">
          <JustificantesList
            justificantes={rechazados}
            isAlumnoView={false}
            title="Justificantes Rechazados"
            description="Justificantes que has rechazado"
            onViewDetails={(j) => { setSelectedJustificante(j); setIsEvaluarOpen(true); }}
            onActionSuccess={fetchJustificantes}
            userEmail={user?.email ?? ""}
            userRole={user?.role ?? ""}
          />
        </TabsContent>

        <TabsContent value="aprobados" className="mt-6">
          <JustificantesList
            justificantes={aprobados}
            isAlumnoView={false}
            title="Justificantes Aprobados"
            description="Justificantes que has aprobado exitosamente"
            onViewDetails={(j) => { setSelectedJustificante(j); setIsEvaluarOpen(true); }}
            onActionSuccess={fetchJustificantes}
            userEmail={user?.email ?? ""}
            userRole={user?.role ?? ""}
          />
        </TabsContent>
      </Tabs>

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