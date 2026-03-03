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
  const { justificantes, getJustificantes } = useJustificantes()
  const [selectedJustificante, setSelectedJustificante] = useState<Justificante | null>(null);
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);

  useEffect(() => {
    getJustificantes();
  }, []);

  const pendientes = justificantes.filter((j) => j.status === "EN_PROCESO");

  const handleViewDetails = (j: Justificante) => {
    setSelectedJustificante(j);
    setIsDetalleOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xl">
          Gestiona tus justificantes de ausencia
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="en-proceso" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="nuevo">Nuevo Justificante</TabsTrigger>
          <TabsTrigger value="en-proceso">En Proceso ({pendientes.length})</TabsTrigger>
          <TabsTrigger value="historial">Mi Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="nuevo" className="mt-6">
          <div className="max-w-2xl">
            <JustificanteForm />
          </div>
        </TabsContent>

        <TabsContent value="en-proceso" className="mt-6">
          <JustificantesList
            justificantes={pendientes}
            isAlumnoView={true}
            title="Justificantes en Proceso"
            description="Seguimiento de tus justificantes que están siendo evaluados."
            onViewDetails={handleViewDetails}
          />
        </TabsContent>

        <TabsContent value="historial" className="mt-6">
          <JustificantesList
            justificantes={justificantes}
            isAlumnoView={true}
            title="Mis Justificantes"
            description="Historial completo de tus justificantes enviados."
            onViewDetails={handleViewDetails}
          />
        </TabsContent>
      </Tabs>

      {/* Modal Detalles y Seguimiento */}
      {selectedJustificante && (
        <JustificanteDetalle
          justificante={selectedJustificante}
          isOpen={isDetalleOpen}
          setIsOpen={setIsDetalleOpen}
        />
      )}
    </div>
  );
}
