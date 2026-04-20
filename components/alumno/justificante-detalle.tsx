import { useState } from "react";
import { Justificante } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatDate } from "date-fns";
import { FileText, Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";
import { JustificanteForm } from "./justificante-form";
import { cn } from "@/lib/utils";

interface JustificanteDetalleProps {
  justificante: Justificante;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onRefresh?: () => void;
}

export function JustificanteDetalle({
  justificante,
  isOpen,
  setIsOpen,
  onRefresh,
}: JustificanteDetalleProps) {
  const [isEditing, setIsEditing] = useState(false);

  const workflowInstancia = justificante.workflowInstancia;
  const etapasInstancia = workflowInstancia?.etapasInstancia || [];

  // Sort stages by order to show them sequentially
  const etapasOrdenadas = [...etapasInstancia].sort((a: any, b: any) => a.orden - b.orden);

  // Can edit if Stage 1 (Tutor) is not yet completed
  const etapaTutor = etapasOrdenadas.find((e: any) => e.orden === 1);
  const canEdit = etapaTutor && etapaTutor.estado !== "COMPLETADA";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APROBADO":
      case "COMPLETADA":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "RECHAZADO":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "PENDIENTE":
      case "EN_PROCESO":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const traducirStatus = (status: string) => {
    switch (status) {
      case "APROBADO": return "Aprobado";
      case "RECHAZADO": return "Rechazado";
      case "PENDIENTE": return "Pendiente";
      case "EN_PROCESO": return "En Proceso";
      case "COMPLETADA": return "Completada";
      default: return status;
    }
  };

  return (
    <>
      <Dialog open={isOpen && !isEditing} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seguimiento de Justificante</DialogTitle>
            <DialogDescription>
              Detalles de tu solicitud y el estado de revisión por parte de tu tutor y profesores.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Detalles Generales */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Fecha Inicio
                </Label>
                <p className="font-medium">{formatDate(new Date(justificante.fechaInicio), "dd MMM yyyy")}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Fecha Fin
                </Label>
                <p className="font-medium">{formatDate(new Date(justificante.fechaFin), "dd MMM yyyy")}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase">Motivo y Descripción</Label>
              <div className="p-3 border rounded-md bg-background">
                <p className="font-medium mb-1">{justificante.motivo}</p>
                <p className="text-sm text-muted-foreground">{justificante.descripcion || "Sin descripción adicional"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                <FileText className="w-3 h-3" /> Documento Adjunto
              </Label>
              <a
                href={`/justificantes/api/justificantes/${justificante.id}/file`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 border rounded-md text-sm text-primary hover:bg-muted/50 transition-colors w-fit"
              >
                <FileText className="w-4 h-4" />
                Ver Documento PDF
              </a>
            </div>

            {/* Workflow Timeline */}
            <div className="space-y-4">
              <Label className="text-xs text-muted-foreground uppercase">Estado de Revisión</Label>

              {etapasOrdenadas.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay información de seguimiento disponible.</p>
              ) : (
                <div className="relative border-l-2 border-muted ml-3 space-y-6 pb-2">
                  {etapasOrdenadas.map((etapa: any) => {
                    const isEtapa2 = etapa.orden === 2;
                    const etapa1NoCompletada = etapasOrdenadas.find((e: any) => e.orden === 1)?.estado !== "COMPLETADA";
                    const isBloqueada = isEtapa2 && etapa1NoCompletada;

                    return (
                      <div key={etapa.id} className={cn(
                        "relative pl-6 transition-all duration-300",
                        isBloqueada && "opacity-40 grayscale pointer-events-none select-none"
                      )}>
                        <div className="absolute -left-[11px] top-1 bg-background rounded-full">
                          {isBloqueada ? <Clock className="w-5 h-5 text-muted-foreground" /> : getStatusIcon(etapa.estado)}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold">
                                {etapa.workflowEtapa?.nombre || `Etapa ${etapa.orden} ${etapa.orden === 1 ? "(Tutor)" : "(Profesores)"}`}
                              </h4>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${etapa.estado === "COMPLETADA" ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50" :
                              etapa.estado === "EN_PROCESO" ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50" :
                                "bg-muted text-muted-foreground"
                              }`}>
                              {isBloqueada ? "Pendiente" : traducirStatus(etapa.estado)}
                            </span>
                          </div>

                          {/* Asignaciones de esta etapa */}
                          {etapa.asignaciones && etapa.asignaciones.length > 0 ? (
                            <div className="space-y-3 mt-3">
                              {etapa.asignaciones.map((asignacion: any) => (
                                <div key={asignacion.id} className="p-3 bg-muted/30 rounded-lg border text-sm space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-muted-foreground">{asignacion.email}</span>
                                    <span className="flex items-center gap-1">
                                      {getStatusIcon(isBloqueada ? "PENDIENTE" : asignacion.estado)}
                                      <span>{isBloqueada ? "Pendiente" : traducirStatus(asignacion.estado)}</span>
                                    </span>
                                  </div>

                                  {asignacion.comentario && !isBloqueada && (
                                    <div className="mt-2 text-muted-foreground bg-background p-2 rounded border">
                                      <p className="text-xs font-semibold mb-1">Notas:</p>
                                      <p>{asignacion.comentario}</p>
                                    </div>
                                  )}

                                  {asignacion.revisadoEn && !isBloqueada && (
                                    <p className="text-xs text-muted-foreground text-right">
                                      Revisado el {formatDate(new Date(asignacion.revisadoEn), "dd/MM/yyyy HH:mm")}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Sin asignaciones</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            {canEdit && (
              <Button variant="default" onClick={() => setIsEditing(true)}>
                Editar Justificante
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editing Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
          <JustificanteForm
            initialData={justificante}
            onSuccess={() => {
              setIsEditing(false);
              setIsOpen(false);
              if (onRefresh) onRefresh();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
