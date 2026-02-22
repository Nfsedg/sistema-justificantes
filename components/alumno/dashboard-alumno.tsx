"use client";

import { useAuth } from "@/lib/auth-context";
import { JustificanteForm } from "./justificante-form";
import { JustificantesList } from "../justificantes-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useJustificantes from "@/hooks/useJustificantes";
import { useEffect } from "react";

export function DashboardAlumno() {
  const { justificantes, getJustificantes } = useJustificantes()

  useEffect(() => {
    getJustificantes();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xl">
          Gestiona tus justificantes de ausencia
        </p>
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
            isAlumnoView={true}
            title="Mis Justificantes"
            description="Historial de tus justificantes enviados"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
