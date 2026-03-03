import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatDate } from "date-fns";
import { FileText, Calendar, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner"; // asumiendo que usan sonner según package.json

interface JustificanteEvaluarProps {
  justificante: Justificante;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSuccess?: () => void;
}

export function JustificanteEvaluar({
  justificante,
  isOpen,
  setIsOpen,
  onSuccess,
}: JustificanteEvaluarProps) {
  const { user } = useAuth();
  const [observaciones, setObservaciones] = useState("");
  const [loadingAction, setLoadingAction] = useState<"APROBAR" | "RECHAZAR" | null>(null);

  // Consideramos si esta asignación ya está completada o si sigue en proceso
  // En base a la etapa actual
  const { workflowInstancia } = justificante;
  const etapaActiva = workflowInstancia?.etapasInstancia?.find(
    (e: any) => e.estado === "EN_PROCESO"
  );

  const asignacionUsuario = etapaActiva?.asignaciones?.find(
    (a: any) => a.email === user?.email
  );

  const canEvaluate = !!asignacionUsuario && asignacionUsuario.estado === "PENDIENTE";

  const handleEvaluate = async (action: "APROBAR" | "RECHAZAR") => {
    try {
      setLoadingAction(action);
      const res = await fetch(`/api/justificantes/${justificante.id}/workflow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          observaciones,
        }),
      });

      if (res.ok) {
        toast.success(`Justificante ${action === "APROBAR" ? "aprobado" : "rechazado"} correctamente`);
        if (onSuccess) onSuccess();
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.error || 'No se pudo completar la acción'}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado al evaluar el justificante.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalle del Justificante</DialogTitle>
          <DialogDescription>
            Información enviada por el estudiante para justificar su inasistencia.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex gap-4 p-3 bg-muted/50 rounded-lg">
            <div className="space-y-1 w-full">
              <Label className="text-xs text-muted-foreground uppercase">Estudiante</Label>
              <p className="font-medium">{justificante.estudiante?.name}</p>
              <p className="text-sm text-muted-foreground">{justificante.estudiante?.email}</p>
            </div>
          </div>

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
              href={justificante.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 p-2 border rounded-md text-sm text-primary hover:bg-muted/50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Ver Documento PDF
            </a>
          </div>

          {canEvaluate ? (
            <div className="space-y-2 mt-2">
              <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
              <Textarea
                id="observaciones"
                placeholder="Escribe algún comentario o justificación de tu decisión..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
          ) : (
            <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-md text-sm mt-2 border border-blue-100 dark:border-blue-800">
              <p className="font-medium mb-1">Estado de evaluación</p>
              {!etapaActiva
                ? "Este justificante no tiene ninguna etapa de evaluación activa."
                : !asignacionUsuario
                  ? "No estás asignado para evaluar en esta etapa."
                  : `Ya has evaluado este justificante (${asignacionUsuario.estado}).`}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cerrar
          </Button>

          {canEvaluate && (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                disabled={loadingAction !== null}
                onClick={() => handleEvaluate("RECHAZAR")}
              >
                {loadingAction === "RECHAZAR" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <X className="w-4 h-4 mr-2" />
                )}
                Rechazar
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={loadingAction !== null}
                onClick={() => handleEvaluate("APROBAR")}
              >
                {loadingAction === "APROBAR" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Aprobar
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
