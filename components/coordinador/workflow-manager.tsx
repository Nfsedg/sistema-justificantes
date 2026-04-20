"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ChevronRight, Workflow, User, Upload, Info } from "lucide-react";
import type { Workflow as WorkflowType, WorkflowEtapa } from "@prisma/client";
import { getWorkflows } from "@/actions/workflows";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export function WorkflowManager() {
  const [workflows, setWorkflows] = useState<(WorkflowType & { etapas: WorkflowEtapa[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const data = await getWorkflows();
      setWorkflows(data);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudieron cargar los flujos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8">Cargando flujos de justificantes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-medium">Flujos de justificantes</h3>
          <p className="text-sm text-muted-foreground">Consulta los flujos de aprobación configurados para los estudiantes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((wf) => (
          <Card key={wf.id} className={`flex flex-col ${wf.isDefault ? 'border-primary/50 bg-primary/5 lg:col-span-2' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{wf.nombre}</CardTitle>
                  <CardDescription>Creado el {new Date(wf.createdAt).toLocaleDateString()}</CardDescription>
                </div>
                {wf.isDefault ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Activo
                  </Badge>
                ) : (
                  <Badge variant="secondary">Inactivo</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <p className="text-sm font-medium">Trayectoria del flujo:</p>
                  <div className="flex flex-col gap-2">
                    {/* Paso Inicial del Estudiante (Solo para el flujo activo) */}
                    {wf.isDefault && (
                      <div className="relative">
                        <div className="flex items-center text-sm p-3 rounded-md bg-primary/10 border-primary/20 border-2 z-10 shadow-sm">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-xs mr-3">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <span className="font-bold">Estudiante</span>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Upload className="w-3 h-3" /> Carga de evidencia y solicitud
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-center -my-1">
                          <ChevronRight className="w-4 h-4 text-primary rotate-90" />
                        </div>
                      </div>
                    )}

                    {wf.etapas.sort((a, b) => a.orden - b.orden).map((etapa, idx) => (
                      <div key={etapa.id} className="relative">
                        <div className={`flex items-center text-sm p-2 rounded-md border z-10 ${wf.isDefault ? 'bg-background shadow-sm' : 'bg-muted/50'}`}>
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs mr-3">
                            {etapa.orden}
                          </div>
                          <div className="flex-1">
                            <span className="font-medium">{etapa.nombre}</span>
                            <div className="text-xs text-muted-foreground">Tipo: {etapa.tipo}</div>
                          </div>
                        </div>
                        {idx < wf.etapas.length - 1 && (
                          <div className="flex justify-center -my-1">
                            <ChevronRight className="w-4 h-4 text-muted-foreground rotate-90" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explicación Detallada (Solo para el flujo activo) */}
                {wf.isDefault && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-xl bg-muted/30 border border-muted space-y-4">
                      <div className="flex items-center gap-2 font-semibold text-primary">
                        <Info className="w-5 h-5" />
                        Proceso de Aceptación
                      </div>
                      <Separator />
                      <div className="space-y-4 text-sm">
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                          <p className="text-muted-foreground">El **Estudiante** inicia el proceso cargando su evidencia médica o justificante externo.</p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                          <p className="text-muted-foreground">El **Tutor** asignado revisa la solicitud, valida la autenticidad y firma el formato institucional.</p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                          <p className="text-muted-foreground">Los **Profesores** correspondientes visualizan el documento firmado y proceden a justificar las faltas en sus listas.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {workflows.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground border border-dashed rounded-lg">
            <Workflow className="w-12 h-12 mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No hay flujos disponibles</p>
            <p className="text-sm">Actualmente no se han configurado flujos de aprobación.</p>
          </div>
        )}
      </div>
    </div>
  );
}
