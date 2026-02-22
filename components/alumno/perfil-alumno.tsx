"use client";

import React from "react"

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { carreras } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, GraduationCap, Hash, BookOpen, CheckCircle2, Loader2 } from "lucide-react";

interface PerfilAlumnoProps {
  onComplete?: () => void;
}

export function PerfilAlumno({ onComplete }: PerfilAlumnoProps) {
  const { user, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    matricula: "",
    carrera: "",
    semestre: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.matricula || !formData.carrera || !formData.semestre) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    updateProfile({
      matricula: formData.matricula,
      carrera: formData.carrera,
      semestre: parseInt(formData.semestre),
    });

    setIsSubmitting(false);
    onComplete?.();
  };

  const semestres = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <CardTitle>Completa tu perfil</CardTitle>
        <CardDescription>
          Necesitamos esta información para que los profesores puedan encontrar tus justificantes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="matricula" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Matrícula
            </Label>
            <Input
              id="matricula"
              placeholder="Ej: 20210001"
              value={formData.matricula}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, matricula: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="carrera" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Carrera
            </Label>
            <Select
              value={formData.carrera}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, carrera: value }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu carrera" />
              </SelectTrigger>
              <SelectContent>
                {carreras.map((carrera) => (
                  <SelectItem key={carrera.id} value={carrera.nombre}>
                    {carrera.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="semestre" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Semestre actual
            </Label>
            <Select
              value={formData.semestre}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, semestre: value }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu semestre" />
              </SelectTrigger>
              <SelectContent>
                {semestres.map((sem) => (
                  <SelectItem key={sem} value={sem.toString()}>
                    {sem}° Semestre
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !formData.matricula || !formData.carrera || !formData.semestre}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Guardar información
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
