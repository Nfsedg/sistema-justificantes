"use client";

import { useState, useMemo } from "react";
import { Justificante } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "date-fns";

interface JustificantesListProps {
  justificantes: Justificante[];
  isAlumnoView?: boolean;
  title?: string;
  description?: string;
  onViewDetails?: (justificante: Justificante) => void;
  userEmail?: string;
  userRole?: string;
}

function EstatusBadge({
  justificante,
  userEmail,
  userRole,
}: {
  justificante: Justificante;
  userEmail?: string;
  userRole?: string;
}) {
  let estado = "";

  if (userRole === "ESTUDIANTE") {
    // Estudiante ve el estado general
    estado = justificante.status || "";
  } else if (userRole === "TUTOR") {
    // Tutor ve su propia asignación en etapa 1
    const etapaTutor = justificante.workflowInstancia?.etapasInstancia?.find(
      (e: any) => e.orden === 1
    );
    const asignacion = etapaTutor?.asignaciones?.find(
      (a: any) => a.email === userEmail
    );
    estado = asignacion?.estado || justificante.status || "";
  } else if (userRole === "DOCENTE") {
    // Docente ve su propia asignación en etapa 2
    const etapaDocente = justificante.workflowInstancia?.etapasInstancia?.find(
      (e: any) => e.orden === 2
    );
    const asignacion = etapaDocente?.asignaciones?.find(
      (a: any) => a.email === userEmail
    );
    estado = asignacion?.estado || justificante.status || "";
  } else {
    estado = justificante.status || "";
  }

  switch (estado) {
    case "FINALIZADO":
    case "APROBADO":
    case "COMPLETADA":
      return <Badge className="text-xs bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Aprobado</Badge>;
    case "RECHAZADO":
      return <Badge className="text-xs bg-red-100 text-red-700 border-red-200 hover:bg-red-100">Declinado</Badge>;
    case "DEVUELTO":
      return <Badge className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">Devuelto</Badge>;
    case "EN_PROCESO":
    case "PENDIENTE":
      return <Badge className="text-xs bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">Pendiente</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">Sin estado</Badge>;
  }
}

export function JustificantesList({
  justificantes,
  isAlumnoView = false,
  title = "Justificantes",
  description = "Historial de justificantes registrados",
  onViewDetails,
  userEmail,
  userRole,
}: JustificantesListProps) {
  const [search, setSearch] = useState("");

  const filteredJustificantes = useMemo(() => {
    return justificantes.filter((j) => {
      return (
        search === "" ||
        j.estudiante?.name?.toLowerCase().includes(search.toLowerCase()) ||
        j.estudiante?.email?.toLowerCase().includes(search.toLowerCase()) ||
        j.motivo?.toLowerCase().includes(search.toLowerCase()) ||
        j.descripcion?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [justificantes, search]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, matrícula o motivo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="hidden md:block rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {!isAlumnoView && <TableHead>Alumno</TableHead>}
                <TableHead>Fecha Ausencia</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Estatus</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJustificantes.length === 0 ? (
                <TableRow>
                  <TableCell className="h-24 text-center text-muted-foreground">
                    No se encontraron justificantes
                  </TableCell>
                </TableRow>
              ) : (
                filteredJustificantes.map((j) => (
                  <TableRow key={j.id}>
                    {!isAlumnoView && (
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-sm">{j.estudiante?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {j.estudiante?.email?.split("@")[0]}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {formatDate(j.fechaInicio, "dd/MM/yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{j.motivo}</p>
                        {j.descripcion && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {j.descripcion}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {j.fileUrl ? (
                        <span className="text-sm text-primary flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {j.fileUrl.split("/").pop()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin archivo</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <EstatusBadge
                        justificante={j}
                        userEmail={userEmail}
                        userRole={userRole}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => onViewDetails?.(j)}>
                        Ver detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground text-center pt-2">
          Mostrando {filteredJustificantes.length} de {justificantes.length} justificantes
        </div>
      </CardContent>
    </Card>
  );
}