"use client";

import React from "react";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, CheckCircle2, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import useJustificantes from "@/hooks/useJustificantes";
import { DateRangePicker } from "../datepicker";
import { toast } from "sonner";

const motivos = [
  "Cita médica",
  "Enfermedad",
  "Emergencia familiar",
  "Trámite oficial",
  "Representación deportiva",
  "Representación académica",
  "Otro",
];

export function JustificanteForm() {
  const { user } = useAuth();
  const { uploadJustificante, isLoadingJustificantes, isSuccess } = useJustificantes();
  const [formData, setFormData] = useState({
    fechaInicio: new Date().toISOString(),
    fechaFin: new Date().toISOString(),
    motivo: "",
    descripcion: "",
    tutorEmail: "",
    profesoresEmails: [] as string[],
    file: null as File | null,
  });
  const [profesorEmailInput, setProfesorEmailInput] = useState("");

  const addProfesorEmail = () => {
    if (profesorEmailInput.trim() && !formData.profesoresEmails.includes(profesorEmailInput.trim())) {
      setFormData(prev => ({
        ...prev,
        profesoresEmails: [...prev.profesoresEmails, profesorEmailInput.trim()]
      }));
      setProfesorEmailInput("");
    }
  };

  const removeProfesorEmail = (emailToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      profesoresEmails: prev.profesoresEmails.filter(email => email !== emailToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.file || !formData.fechaInicio || !formData.fechaFin || !formData.tutorEmail) {
      toast.error("Por favor, completa todos los campos obligatorios.");
      return;
    };
    await uploadJustificante(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file: file }));
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-secondary bg-secondary/5">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Justificante enviado
            </h3>
            <p className="text-muted-foreground">
              Tu justificante ha sido registrado exitosamente.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Nuevo Justificante
        </CardTitle>
        <CardDescription>
          Registra tu ausencia y adjunta el documento de respaldo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tutorEmail">Correo electrónico del Tutor*</Label>
                <Input
                  id="tutorEmail"
                  type="email"
                  required
                  placeholder="tutor@upqroo.edu.mx"
                  value={formData.tutorEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tutorEmail: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profesorEmail">Correos de Profesores (Opcional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="profesorEmail"
                    type="email"
                    placeholder="profesor@upqroo.edu.mx"
                    value={profesorEmailInput}
                    onChange={(e) => setProfesorEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addProfesorEmail();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" onClick={addProfesorEmail}>
                    Añadir
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.profesoresEmails.map((email, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {email}
                      <button
                        type="button"
                        onClick={() => removeProfesorEmail(email)}
                        className="rounded-full hover:bg-muted p-0.5"
                      >
                        <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Selecciona las fechas a justificar*</Label>
              <DateRangePicker
                date={{ from: new Date(formData.fechaInicio), to: new Date(formData.fechaFin) }}
                setDate={(date) => {
                  setFormData((prev) => ({ ...prev, fechaInicio: date?.from?.toISOString() || "", fechaFin: date?.to?.toISOString() || "" }));
                }} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo (opcional)</Label>
            <Select
              value={formData.motivo}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, motivo: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un motivo" />
              </SelectTrigger>
              <SelectContent>
                {motivos.map((motivo) => (
                  <SelectItem key={motivo} value={motivo}>
                    {motivo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              placeholder="Proporciona detalles adicionales sobre tu ausencia..."
              value={formData.descripcion}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  descripcion: e.target.value,
                }))
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="archivo">Documento de respaldo*</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                id="archivo"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="archivo"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                {formData.file ? (
                  <div className="text-sm">
                    <span className="font-medium text-primary">
                      {formData.file.name}
                    </span>
                    <p className="text-muted-foreground">
                      Clic para cambiar archivo
                    </p>
                  </div>
                ) : (
                  <div className="text-sm">
                    <span className="font-medium text-primary">
                      Clic para subir archivo
                    </span>
                    <p className="text-muted-foreground">
                      PDF, JPG o PNG (máx. 5MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={isLoadingJustificantes}
          >
            {isLoadingJustificantes ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Justificante"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
