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
import { Check, X, FileText, FileSearch } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth-context"
import { JustificanteOficio } from "../justificante-oficio"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

        <Tabs defaultValue="detalles" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="detalles">Detalles del Trámite</TabsTrigger>
            <TabsTrigger value="oficio">Vista Previa Oficio</TabsTrigger>
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
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t mt-4 bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800 p-4 rounded-md">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                  <Check className="w-5 h-5" />
                  <p className="text-sm font-bold uppercase tracking-tight">Trámite Gestionado</p>
                </div>
                <p className="text-sm text-green-600 dark:text-green-500">Este justificante ya ha sido procesado por tu parte. Puedes ver el oficio generado en la pestaña correspondiente.</p>
              </div>
            )}
          </TabsContent>

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
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
