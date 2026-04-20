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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatDate } from "date-fns";
import { FileText, Calendar, Check, X, Loader2, FileSearch } from "lucide-react";
import { toast } from "sonner"; // asumiendo que usan sonner según package.json
import { JustificanteOficio } from "./justificante-oficio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  let etapaActiva = workflowInstancia?.etapasInstancia?.find(
    (e: any) => e.estado === "EN_PROCESO"
  );

  // Si no hay etapa en proceso, buscamos si el usuario tiene un rechazo en una etapa ya completada (debido a su rechazo)
  if (!etapaActiva) {
    etapaActiva = workflowInstancia?.etapasInstancia?.find((e: any) =>
      e.asignaciones?.some((a: any) => a.email === user?.email && a.estado === "RECHAZADO")
    );
  }

  const asignacionUsuario = etapaActiva?.asignaciones?.find(
    (a: any) => a.email === user?.email
  );

  const canEvaluate = !!asignacionUsuario && asignacionUsuario.estado === "PENDIENTE";
  const isRejected = !!asignacionUsuario && asignacionUsuario.estado === "RECHAZADO";
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleEvaluate = async (action: "APROBAR" | "RECHAZAR") => {
    try {
      setLoadingAction(action);
      const res = await fetch(`/justificantes/api/justificantes/${justificante.id}/workflow`, {
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

  // Obtener el nombre del tutor de la primera etapa del workflow
  const etapaTutor = workflowInstancia?.etapasInstancia?.find((e: any) => e.orden === 1);
  const tutorName = etapaTutor?.asignaciones?.[0]?.user?.name || "Tutor de grupo";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle del Justificante</DialogTitle>
          <DialogDescription>
            Información enviada por el estudiante y avalada por su tutor.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="detalles" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="detalles">Información General</TabsTrigger>
            <TabsTrigger value="oficio">Oficio del Tutor</TabsTrigger>
          </TabsList>

          <TabsContent value="detalles" className="grid gap-4 py-4">
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
                <FileText className="w-3 h-3" /> Evidencia Original
              </Label>
              <a
                href={`/justificantes/api/justificantes/${justificante.id}/file`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2 border rounded-md text-sm text-primary hover:bg-muted/50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Ver Documento PDF del Alumno
              </a>
            </div>

            {canEvaluate && (
              <div className="space-y-2 mt-2">
                <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Escribe algún comentario o justificación de tu decisión..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="oficio" className="py-4">
            <JustificanteOficio
              justificante={justificante}
              tutorName={tutorName}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0">

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

          {isRejected && (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={loadingAction !== null}
              onClick={() => setIsConfirmOpen(true)}
            >
              <Check className="w-4 h-4 mr-2" />
              Cambiar a Aprobado
            </Button>
          )}
        </DialogFooter>

        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Confirmar cambio de decisión?</AlertDialogTitle>
              <AlertDialogDescription>
                Estás a punto de cambiar tu decisión de <strong>Rechazado</strong> a <strong>Aprobado</strong>.
                Esta acción reactivará el proceso de validación para el estudiante.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loadingAction !== null}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleEvaluate("APROBAR");
                  setIsConfirmOpen(false);
                }}
                disabled={loadingAction !== null}
                className="bg-green-600 hover:bg-green-700"
              >
                {loadingAction ? "Procesando..." : "Sí, Cambiar a Aprobado"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
