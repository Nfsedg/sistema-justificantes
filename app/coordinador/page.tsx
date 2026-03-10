import { DashboardCoordinador } from "@/components/coordinador/dashboard-coordinador";
import { WorkflowManager } from "@/components/coordinador/workflow-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Workflow } from "lucide-react";

export default function CoordinadorPage() {
  return (
    <div className="p-8 pb-20 sm:p-20 pt-10 font-[family-name:var(--font-geist-sans)] max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Panel del Coordinador</h2>
        <p className="text-muted-foreground mt-2">
          Administra usuarios y diseña el flujo de aprobación de justificantes.
        </p>
      </div>

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
    </div>
  );
}
