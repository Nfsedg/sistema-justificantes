"use client";

import { useAuth } from "@/lib/auth-context";
import { JustificantesList } from "../justificantes-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useJustificantes from "@/hooks/useJustificantes";
import { useEffect, useState } from "react";
import { RevisionModal } from "./revision-modal";
import { Justificante } from "@/lib/types";

export function DashboardTutor() {
  const { justificantes, getJustificantes, getDocentes, docentes, updateJustificanteWorkflow } = useJustificantes()
  const { user } = useAuth();
  const [selectedJustificante, setSelectedJustificante] = useState<Justificante | null>(null);

  useEffect(() => {
    getJustificantes();
    getDocentes();
  }, []);

  // Filter justificantes: Pending vs Completed based on Tutor's step
  const pendientes = justificantes.filter(j => {
    const etapaTutor = j.workflowInstancia?.etapasInstancia?.find((e: any) => e.orden === 1);
    const asignacion = etapaTutor?.asignaciones?.find((a: any) => a.email === user?.email);
    return asignacion?.estado === "PENDIENTE";
  });

  const historial = justificantes.filter(j => {
    const etapaTutor = j.workflowInstancia?.etapasInstancia?.find((e: any) => e.orden === 1);
    const asignacion = etapaTutor?.asignaciones?.find((a: any) => a.email === user?.email);
    return asignacion?.estado !== "PENDIENTE";
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Panel del Tutor</h2>
        <p className="text-muted-foreground mt-2">
          Revisa y aprueba los justificantes de tus alumnos tutorados.
        </p>
      </div>

      <Tabs defaultValue="pendientes" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
          <TabsTrigger value="pendientes">Pendientes ({pendientes.length})</TabsTrigger>
          <TabsTrigger value="historial">Historial ({historial.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes">
          <JustificantesList
            justificantes={pendientes}
            isAlumnoView={false}
            title="Justificantes por Revisar"
            description="Justificantes que requieren tu aprobación y asignación a profesores."
            onViewDetails={(j) => setSelectedJustificante(j)}
          />
        </TabsContent>

        <TabsContent value="historial">
          <JustificantesList
            justificantes={historial}
            isAlumnoView={false}
            title="Justificantes Revisados"
            description="Historial de justificantes que ya has aprobado o rechazado."
            onViewDetails={(j) => setSelectedJustificante(j)}
          />
        </TabsContent>
      </Tabs>

      <RevisionModal
        isOpen={!!selectedJustificante}
        onClose={() => setSelectedJustificante(null)}
        justificante={selectedJustificante}
        docentes={docentes}
        onUpdate={updateJustificanteWorkflow}
      />
    </div>
  );
}
