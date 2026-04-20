import { DashboardCoordinador } from "@/components/coordinador/dashboard-coordinador";
import { WorkflowManager } from "@/components/coordinador/workflow-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Workflow } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";

export default function CoordinadorPage() {
  return (
    <PageContainer 
      title="Panel del Coordinador" 
      description="Administra usuarios y consulta el flujo de aprobación de justificantes."
    >
      <Tabs defaultValue="directorio" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="directorio" className="flex items-center gap-2">
            <Users className="w-4 h-4" /> Directorio
          </TabsTrigger>
          <TabsTrigger value="flujo" className="flex items-center gap-2">
            <Workflow className="w-4 h-4" /> Flujo de justificantes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directorio" className="mt-6">
          <DashboardCoordinador />
        </TabsContent>

        <TabsContent value="flujo" className="mt-6">
          <WorkflowManager />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
