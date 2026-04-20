"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Justificante } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Check, X, FileText, FileSearch } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth-context"
import { JustificanteOficio } from "../justificante-oficio"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface RevisionModalProps {
  isOpen: boolean
  onClose: () => void
  justificante: Justificante | null
  docentes: any[]
  onUpdate: (id: number, data: any) => Promise<boolean>
}

export function RevisionModal({ isOpen, onClose, justificante, docentes, onUpdate }: RevisionModalProps) {
  const [observaciones, setObservaciones] = useState("")
  const [selectedDocentes, setSelectedDocentes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const { user: currentUser } = useAuth()

  // Initialization when modal opens
  useEffect(() => {
    if (justificante && isOpen) {
      setObservaciones("")
      // Auto-select the teachers that the student suggested originally
      // These are in workflowInstancia.etapasInstancia[orden=2].asignaciones
      try {
        const etapaProfesores = justificante.workflowInstancia?.etapasInstancia?.find((e: any) => e.orden === 2)
        if (etapaProfesores && etapaProfesores.asignaciones) {
          const suggestedEmails = etapaProfesores.asignaciones.map((a: any) => a.email)
          setSelectedDocentes(suggestedEmails)
        } else {
          setSelectedDocentes([])
        }
      } catch (e) {
        setSelectedDocentes([])
      }
    }
  }, [justificante, isOpen])


  const handleAction = async (action: "APROBAR" | "RECHAZAR") => {
    if (!justificante) return

    if (action === "APROBAR" && selectedDocentes.length === 0) {
      // You could add validation here, but we'll let it pass or require it depending on business rules.
      // Often at least 1 must be selected.
    }

    setIsLoading(true)
    const success = await onUpdate(justificante.id, {
      action,
      observaciones: action === "RECHAZAR" ? observaciones : undefined,
      profesoresEmails: action === "APROBAR" ? selectedDocentes : undefined
    })
    setIsLoading(false)

    if (success) {
      onClose()
    }
  }

  if (!justificante) return null

  // Format dates manually to avoid hydration errors or complex libraries if not needed
  const fInicio = new Date(justificante.fechaInicio).toLocaleDateString()
  const fFin = new Date(justificante.fechaFin).toLocaleDateString()

  // Determine current status of tutor
  const etapaTutor = justificante.workflowInstancia?.etapasInstancia?.find((e: any) => e.orden === 1)
  const asignacionTutor = etapaTutor?.asignaciones?.find((a: any) => a.email === currentUser?.email)

  const isCompleted = etapaTutor?.estado === "COMPLETADA"
  const isRejected = asignacionTutor?.estado === "RECHAZADO"
  const isApproved = asignacionTutor?.estado === "APROBADO" || (isCompleted && !isRejected)
  const canEvaluate = !isCompleted && asignacionTutor?.estado === "PENDIENTE"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Revisión de Justificante</DialogTitle>
          <DialogDescription>
            Revisa los detalles y asigna los profesores correspondientes.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="detalles" className="w-full">
          <TabsList className={cn("grid w-full", isApproved ? "grid-cols-2" : "grid-cols-1")}>
            <TabsTrigger value="detalles">Detalles</TabsTrigger>
            {isApproved && <TabsTrigger value="oficio">Vista Previa Oficio</TabsTrigger>}
          </TabsList>

          <TabsContent value="detalles" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Alumno</Label>
                <p className="font-medium text-base">{justificante.estudiante?.name}</p>
                <p className="text-sm text-muted-foreground">{justificante.estudiante?.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Fechas</Label>
                <p className="font-medium">{fInicio} - {fFin}</p>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground">Motivo</Label>
              <p className="font-medium">{justificante.motivo}</p>
            </div>

            {justificante.descripcion && (
              <div>
                <Label className="text-muted-foreground">Descripción detallada</Label>
                <p className="text-sm bg-muted p-3 rounded-md mt-1">{justificante.descripcion}</p>
              </div>
            )}

            <div>
              <Label className="text-muted-foreground">Evidencia (Archivo del Alumno)</Label>
              <div className="mt-1">
                <a
                  href={`/justificantes/api/justificantes/${justificante.id}/file`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline bg-primary/10 px-3 py-2 rounded-md"
                >
                  <FileText className="w-4 h-4" />
                  Ver Documento Adjunto
                </a>
              </div>
            </div>

            {!isCompleted && (
              <div className="space-y-4 pt-4 border-t mt-4">
                <h4 className="font-medium">1. Profesores Asignados</h4>
                <p className="text-sm text-muted-foreground">
                  Los siguientes profesores han sido <strong>asignados directamente por el estudiante</strong> y recibirán la notificación de este justificante una vez sea aprobado.
                </p>

                <div className="flex flex-wrap gap-2 py-2">
                  {selectedDocentes.length > 0 ? (
                    selectedDocentes.map(email => {
                      const docente = docentes.find(d => d.email === email);
                      return (
                        <Badge key={email} variant="secondary" className="px-3 py-1 text-sm font-normal">
                          {docente ? docente.name : email}
                          {docente && <span className="ml-2 text-xs opacity-70">{docente.email}</span>}
                        </Badge>
                      );
                    })
                  ) : (
                    <p className="text-sm text-destructive">No hay profesores asignados.</p>
                  )}
                </div>

                <div className="pt-2">
                  <h4 className="font-medium mb-2">2. Resolución</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="obs">Observaciones (Opcional)</Label>
                      <Textarea
                        id="obs"
                        placeholder="Agrega comentarios o razones de rechazo..."
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                      <Button
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleAction("RECHAZAR")}
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Rechazar
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleAction("APROBAR")}
                        disabled={isLoading || selectedDocentes.length === 0}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Aprobar y Asignar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isRejected && (
              <div className="pt-4 border-t mt-4">
                <div className="flex justify-end">
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setIsConfirmOpen(true)}
                    disabled={isLoading}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Cambiar a Aprobado
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {isApproved && (
            <TabsContent value="oficio" className="py-4">
              <div className="bg-muted/30 p-4 rounded-lg border border-dashed text-center mb-6">
                <p className="text-sm text-muted-foreground italic">
                  A continuación se muestra el formato oficial que recibirán los docentes asignados.
                </p>
              </div>
              <JustificanteOficio
                justificante={justificante}
                tutorName={useAuth().user?.name || undefined}
              />
            </TabsContent>
          )}
        </Tabs>

        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Confirmar cambio de decisión?</AlertDialogTitle>
              <AlertDialogDescription>
                Estás a punto de cambiar tu decisión de <strong>Rechazado</strong> a <strong>Aprobado</strong>.
                Esta acción reactivará el proceso para el estudiante y permitirá asignar a los docentes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleAction("APROBAR");
                  setIsConfirmOpen(false);
                }}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Procesando..." : "Sí, Cambiar a Aprobado"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  )
}
