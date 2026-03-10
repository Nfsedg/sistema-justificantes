"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CheckCircle2, ChevronRight, Settings, Trash2 } from "lucide-react";
import type { Workflow, WorkflowEtapa } from "@prisma/client";
import { getWorkflows, setDefaultWorkflow, createWorkflow, EtapaInput } from "@/actions/workflows";
import { useToast } from "@/hooks/use-toast";

export function WorkflowManager() {
  const [workflows, setWorkflows] = useState<(Workflow & { etapas: WorkflowEtapa[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newSteps, setNewSteps] = useState<Omit<EtapaInput, 'orden'>[]>([
    { nombre: "", tipo: "SECUENCIAL" }
  ]);

  const { toast } = useToast();

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const data = await getWorkflows();
      setWorkflows(data);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudieron cargar los workflows.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultWorkflow(id);
      await fetchWorkflows();
      toast({ title: "Éxito", description: "El workflow se ha establecido como predeterminado.", });
    } catch (e) {
      toast({ title: "Error", description: "No se pudo actualizar el workflow predeterminado.", variant: "destructive" });
    }
  };

  const handleCreateWorkflow = async () => {
    if (!newWorkflowName.trim()) {
      toast({ title: "Error", description: "El workflow necesita un nombre.", variant: "destructive" });
      return;
    }
    if (newSteps.some(s => !s.nombre.trim())) {
      toast({ title: "Error", description: "Todas las etapas necesitan un nombre.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const etapasPayload: EtapaInput[] = newSteps.map((s, idx) => ({ ...s, orden: idx + 1 }));
      await createWorkflow(newWorkflowName, etapasPayload);
      setIsDialogOpen(false);
      setNewWorkflowName("");
      setNewSteps([{ nombre: "", tipo: "SECUENCIAL" }]);
      await fetchWorkflows();
      toast({ title: "Éxito", description: "Workflow creado exitosamente." });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear el workflow.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addStep = () => {
    setNewSteps([...newSteps, { nombre: "", tipo: "SECUENCIAL" }]);
  };

  const removeStep = (index: number) => {
    setNewSteps(newSteps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: keyof Omit<EtapaInput, 'orden'>, value: string) => {
    const updated = [...newSteps];
    updated[index] = { ...updated[index], [field]: value } as any;
    setNewSteps(updated);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando workflows...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-medium">Gestión de Workflows</h3>
          <p className="text-sm text-muted-foreground">Configura los flujos de aprobación para los estudiantes.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Workflow</DialogTitle>
              <DialogDescription>
                Define un nuevo flujo de aprobación con sus respectivas etapas.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="wf-name">Nombre del Workflow</Label>
                <Input
                  id="wf-name"
                  placeholder="Ej. Justificantes Especiales 2024"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Etapas del Flujo</Label>
                  <Button variant="outline" size="sm" onClick={addStep}><Plus className="w-4 h-4 mr-2" /> Añadir Etapa</Button>
                </div>

                <div className="space-y-3">
                  {newSteps.map((step, idx) => (
                    <div key={idx} className="flex gap-3 items-start border p-3 rounded-lg bg-muted/20">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                        {idx + 1}
                      </div>
                      <div className="grid grid-cols-2 gap-3 flex-1">
                        <div className="space-y-1">
                          <Label className="text-xs">Nombre del Paso</Label>
                          <Input
                            value={step.nombre}
                            placeholder="Ej. Tutor, Profesores..."
                            onChange={(e) => updateStep(idx, "nombre", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Tipo de Aprobación</Label>
                          <Select
                            value={step.tipo}
                            onValueChange={(val) => updateStep(idx, "tipo", val)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SECUENCIAL">Secuencial</SelectItem>
                              <SelectItem value="PARALELA">Paralela</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0 text-destructive mt-5" onClick={() => removeStep(idx)} disabled={newSteps.length === 1}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateWorkflow} disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Workflow"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((wf) => (
          <Card key={wf.id} className={`flex flex-col ${wf.isDefault ? 'border-primary/50 bg-primary/5' : ''}`}>
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
              <div className="space-y-4">
                <p className="text-sm font-medium">Etapas del flujo:</p>
                <div className="flex flex-col gap-2">
                  {wf.etapas.sort((a, b) => a.orden - b.orden).map((etapa, idx) => (
                    <div key={etapa.id} className="relative">
                      <div className="flex items-center text-sm p-2 rounded-md bg-muted/50 border z-10">
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
            </CardContent>
            <CardFooter className="pt-4 flex justify-between gap-2 border-t">
              <Button variant="outline" size="sm" className="flex-1" disabled>
                <Settings className="w-4 h-4 mr-2" /> Editar
              </Button>
              {!wf.isDefault && (
                <Button variant="default" size="sm" onClick={() => handleSetDefault(wf.id)}>
                  Hacer Original
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
        {workflows.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground border border-dashed rounded-lg">
            <Workflow className="w-12 h-12 mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No hay workflows disponibles</p>
            <p className="text-sm mb-4">Crea uno nuevo para establecer un flujo de aprobaciones.</p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> Crear el primero</Button>
          </div>
        )}
      </div>
    </div>
  );
}
