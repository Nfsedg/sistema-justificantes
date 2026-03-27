import { PerfilAlumno } from "@/components/alumno/perfil-alumno";
import { PageContainer } from "@/components/layout/page-container";

export default function page() {
  return (
    <PageContainer 
      title="Mi Perfil" 
      description="Mantén tu información académica actualizada para facilitar la gestión de tus justificantes."
    >
      <PerfilAlumno/>
    </PageContainer>
  )
}
