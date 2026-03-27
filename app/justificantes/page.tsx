import { DashboardStaff } from "@/components/dashboard-staff";
import { PageContainer } from "@/components/layout/page-container";

export default function page() {
  return (
    <PageContainer 
      title="Gestión de Justificantes" 
      description="Administración y revisión de solicitudes de justificación de faltas."
    >
      <DashboardStaff/>
    </PageContainer>
  )
}
