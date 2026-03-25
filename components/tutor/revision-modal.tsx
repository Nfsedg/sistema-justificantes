"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Justificante } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Check, X, FileText } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

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

  const handleToggleDocente = (email: string) => {
    setSelectedDocentes(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    )
  }

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
  const isCompleted = etapaTutor?.estado === "COMPLETADA"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Revisión de Justificante</DialogTitle>
          <DialogDescription>
            Revisa los detalles y asigna los profesores correspondientes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
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
            <Label className="text-muted-foreground">Documento Adjunto</Label>
            <div className="mt-1">
              <a
                href={`/api/justificantes/${justificante.id}/file`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline bg-primary/10 px-3 py-2 rounded-md"
              >
                <FileText className="w-4 h-4" />
                Ver Documento (PDF)
              </a>
            </div>
          </div>

          {!isCompleted ? (
            <div className="space-y-4 pt-4 border-t mt-4">
              <h4 className="font-medium">1. Selección de Profesores (Docentes)</h4>
              <p className="text-sm text-muted-foreground">
                Selecciona a los profesores que deben ser notificados. Los profesores sugeridos por el alumno están pre-seleccionados.
              </p>

              <ScrollArea className="h-[200px] border rounded-md p-4">
                <div className="flex flex-col gap-3">
                  {docentes.map(docente => (
                    <div key={docente.email} className="flex items-start space-x-3">
                      <Checkbox
                        id={docente.email}
                        checked={selectedDocentes.includes(docente.email)}
                        onCheckedChange={() => handleToggleDocente(docente.email)}
                      />
                      <label
                        htmlFor={docente.email}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {docente.name}
                        <span className="block text-xs text-muted-foreground mt-0.5">{docente.email}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="pt-2">
                <h4 className="font-medium mb-2">2. Resolución</h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="obs">Observaciones (Opcional si se aprueba)</Label>
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
                  {selectedDocentes.length === 0 && (
                    <p className="text-xs text-destructive text-right mt-1">
                      Debes seleccionar al menos un profesor para aprobar.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-4 border-t mt-4 bg-muted p-4 rounded-md">
              <p className="text-sm font-medium text-center">Este justificante ya fue revisado por ti.</p>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  )
}
