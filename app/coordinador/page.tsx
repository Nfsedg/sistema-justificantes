import { DashboardCoordinador } from "@/components/coordinador/dashboard-coordinador";
import { WorkflowManager } from "@/components/coordinador/workflow-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Workflow } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";

export default function CoordinadorPage() {
  return (
    <PageContainer 
      title="Panel del Coordinador" 
      description="Administra usuarios y diseña el flujo de aprobación de justificantes."
    >
      <Tabs defaultValue="directorio" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="directorio" className="flex items-center gap-2">
            <Users className="w-4 h-4" /> Directorio
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Workflow className="w-4 h-4" /> Workflows
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directorio" className="mt-6">
          <DashboardCoordinador />
        </TabsContent>

        <TabsContent value="workflows" className="mt-6">
          <WorkflowManager />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
