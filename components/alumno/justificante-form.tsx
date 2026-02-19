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
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";
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
    file: null as File | null,
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.file || !formData.fechaInicio || !formData.fechaFin) {
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
