"use client";

import { useAuth } from "@/lib/auth-context";
import { JustificanteForm } from "./justificante-form";
import { JustificantesList } from "../justificantes-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useJustificantes from "@/hooks/useJustificantes";
import { useEffect, useState } from "react";
import { JustificanteDetalle } from "./justificante-detalle";
import { Justificante } from "@/lib/types";

export function DashboardAlumno() {
  const { user } = useAuth();
  const { justificantes, getJustificantes } = useJustificantes();
  const [selectedJustificante, setSelectedJustificante] = useState<Justificante | null>(null);
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);

  useEffect(() => {
    getJustificantes();
  }, []);

  const pendientes = justificantes.filter((j) => j.status === "EN_PROCESO");
  const rechazados = justificantes.filter((j) => j.status === "RECHAZADO");
  const aprobados = justificantes.filter((j) => j.status === "FINALIZADO");

  const handleViewDetails = (j: Justificante) => {
    setSelectedJustificante(j);
    setIsDetalleOpen(true);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="en-proceso" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 max-w-4xl">
          <TabsTrigger value="nuevo">Nuevo Justificante</TabsTrigger>
          <TabsTrigger value="en-proceso">En Proceso ({pendientes.length})</TabsTrigger>
          <TabsTrigger value="aprobados">Aprobados ({aprobados.length})</TabsTrigger>
          <TabsTrigger value="rechazados">Rechazados ({rechazados.length})</TabsTrigger>
          <TabsTrigger value="historial">Mi Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="nuevo" className="mt-6">
          <div className="max-w-2xl">
            <JustificanteForm onSuccess={getJustificantes} />
          </div>
        </TabsContent>

        <TabsContent value="en-proceso" className="mt-6">
          <JustificantesList
            justificantes={pendientes}
            isAlumnoView={true}
            title="Justificantes en Proceso"
            description="Seguimiento de tus justificantes que están siendo evaluados."
            onViewDetails={handleViewDetails}
            userEmail={user?.email ?? ""}
            userRole="ESTUDIANTE"
          />
        </TabsContent>

        <TabsContent value="aprobados" className="mt-6">
          <JustificantesList
            justificantes={aprobados}
            isAlumnoView={true}
            title="Justificantes Aprobados"
            description="Justificantes que han completado todas las etapas de validación."
            onViewDetails={handleViewDetails}
            userEmail={user?.email ?? ""}
            userRole="ESTUDIANTE"
          />
        </TabsContent>

        <TabsContent value="rechazados" className="mt-6">
          <JustificantesList
            justificantes={rechazados}
            isAlumnoView={true}
            title="Justificantes Rechazados"
            description="Justificantes que han sido rechazados por tu tutor o docentes."
            onViewDetails={handleViewDetails}
            userEmail={user?.email ?? ""}
            userRole="ESTUDIANTE"
          />
        </TabsContent>

        <TabsContent value="historial" className="mt-6">
          <JustificantesList
            justificantes={justificantes}
            isAlumnoView={true}
            title="Mis Justificantes"
            description="Historial completo de tus justificantes enviados."
            onViewDetails={handleViewDetails}
            userEmail={user?.email ?? ""}
            userRole="ESTUDIANTE"
          />
        </TabsContent>
      </Tabs>

      {selectedJustificante && (
        <JustificanteDetalle
          justificante={selectedJustificante}
          isOpen={isDetalleOpen}
          setIsOpen={setIsDetalleOpen}
          onRefresh={getJustificantes}
        />
      )}
    </div>
  );
}