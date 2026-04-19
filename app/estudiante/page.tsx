import { DashboardAlumno } from "@/components/alumno/dashboard-alumno";
import { PageContainer } from "@/components/layout/page-container";

export default function page() {
  return (
    <PageContainer 
      title="Mi Panel de Estudiante" 
      description="Gestiona tus solicitudes de justificantes y consulta su estado."
    >
      <DashboardAlumno/>
    </PageContainer>
  )
}
