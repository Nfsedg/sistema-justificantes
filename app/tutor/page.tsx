"use client";

import { useState } from "react";
import { DashboardTutor } from "@/components/tutor/dashboard-tutor";
import { DashboardStaff } from "@/components/dashboard-staff";
import { PageContainer } from "@/components/layout/page-container";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Briefcase, GraduationCap } from "lucide-react";

export default function TutorPage() {
  const [showDocentePanel, setShowDocentePanel] = useState(false);

  const headerAction = (
    <div className="flex items-center gap-3 bg-card border rounded-full px-4 py-2 shadow-sm transition-all hover:shadow-md">
      <div className={`flex items-center gap-2 text-sm font-medium transition-colors ${!showDocentePanel ? "text-primary" : "text-muted-foreground"}`}>
        <GraduationCap className="w-4 h-4" />
        <span className="hidden sm:inline">Tutor</span>
      </div>
      <Switch 
        id="panel-toggle" 
        checked={showDocentePanel}
        onCheckedChange={setShowDocentePanel}
        className="data-[state=checked]:bg-primary"
      />
      <div className={`flex items-center gap-2 text-sm font-medium transition-colors ${showDocentePanel ? "text-primary" : "text-muted-foreground"}`}>
        <Briefcase className="w-4 h-4" />
        <span className="hidden sm:inline">Docente</span>
      </div>
    </div>
  );

  return (
    <PageContainer 
      title={showDocentePanel ? "Panel de Docente" : "Panel del Tutor"} 
      description={showDocentePanel 
        ? "Consulta y evalúa los justificantes que te han sido asignados como profesor de asignatura." 
        : "Seguimiento y validación de justificantes de tus alumnos tutorados."
      }
      headerAction={headerAction}
    >
      {showDocentePanel ? (
        <DashboardStaff />
      ) : (
        <DashboardTutor />
      )}
    </PageContainer>
  );
}
