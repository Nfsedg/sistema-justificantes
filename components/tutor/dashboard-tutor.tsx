"use client";

import { useAuth } from "@/lib/auth-context";
import { JustificantesList } from "../justificantes-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { RevisionModal } from "./revision-modal";
import { Justificante } from "@/lib/types";
import { toast } from "sonner";

export function DashboardTutor() {
  const { user } = useAuth();
  const [justificantes, setJustificantes] = useState<Justificante[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [selectedJustificante, setSelectedJustificante] = useState<Justificante | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchJustificantes = async () => {
    try {
      const res = await fetch("/api/justificantes");
      if (res.ok) {
        const data = await res.json();
        setJustificantes(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDocentes = async () => {
    try {
      // Necesitamos un endpoint que nos de los usuarios con rol DOCENTE.
      // Usaremos el endpoint específico /api/users/docentes
      const res = await fetch("/api/users/docentes");
      if (res.ok) {
        const allUsers = await res.json();
        // El endpoint /api/users/docentes ya devuelve filtrados por DOCENTE
        setDocentes(allUsers);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchJustificantes(), fetchDocentes()]);
      setLoading(false);
    };
    initData();
  }, [user]);

  const updateJustificanteWorkflow = async (id: number, data: any) => {
    try {
      const res = await fetch(`/api/justificantes/${id}/workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("Justificante actualizado exitosamente");
        fetchJustificantes();
        return true;
      }
      const errorData = await res.json();
      toast.error(errorData.error || "Ocurrió un error");
      return false;
    } catch (e) {
      toast.error("Ocurrió un error de conexión");
      return false;
    }
  };

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

  if (loading) return <div className="text-center py-10">Cargando panel del tutor...</div>;

  return (
    <div className="space-y-6">
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
