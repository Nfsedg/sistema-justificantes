"use client";

import { useState, useMemo } from "react";
import { Justificante } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { carreras } from "@/lib/mock-data";
import {
  Search,
  FileText,
  Calendar,
  Download,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface JustificantesListProps {
  justificantes: Justificante[];
  showAlumnoInfo?: boolean;
  title?: string;
  description?: string;
}

export function JustificantesList({
  justificantes,
  showAlumnoInfo = true,
  title = "Justificantes",
  description = "Historial de justificantes registrados",
}: JustificantesListProps) {
  const [search, setSearch] = useState("");
  const [filterCarrera, setFilterCarrera] = useState("todas");
  const [filterStatus, setFilterStatus] = useState("todos");

  const filteredJustificantes = useMemo(() => {
    return justificantes.filter((j) => {
      const matchesSearch =
        search === "" ||
        j.alumno?.nombre.toLowerCase().includes(search.toLowerCase()) ||
        j.alumno?.apellidos.toLowerCase().includes(search.toLowerCase()) ||
        j.alumno?.matricula?.toLowerCase().includes(search.toLowerCase()) ||
        j.motivo.toLowerCase().includes(search.toLowerCase());

      const matchesCarrera =
        filterCarrera === "todas" || j.carrera === filterCarrera;

      const matchesStatus =
        filterStatus === "todos" || j.status === filterStatus;

      return matchesSearch && matchesCarrera && matchesStatus;
    });
  }, [justificantes, search, filterCarrera, filterStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aprobado":
        return (
          <Badge className="bg-secondary text-secondary-foreground">
            Aprobado
          </Badge>
        );
      case "rechazado":
        return (
          <Badge variant="destructive">Rechazado</Badge>
        );
      case "pendiente":
        return (
          <Badge variant="outline" className="border-chart-3 text-chart-3">
            Pendiente
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateRange = (fechaInicio: string, fechaFin: string) => {
    if (fechaInicio === fechaFin) {
      return formatDate(fechaInicio);
    }
    return `${formatDate(fechaInicio)} - ${formatDate(fechaFin)}`;
  };

  const getInitials = (nombre?: string, apellidos?: string) => {
    if (!nombre || !apellidos) return "??";
    return `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
  };

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
        {/* Filtros */}
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

          {showAlumnoInfo && (
            <Select value={filterCarrera} onValueChange={setFilterCarrera}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Carrera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las carreras</SelectItem>
                {carreras.map((carrera) => (
                  <SelectItem key={carrera.id} value={carrera.nombre}>
                    {carrera.abreviatura}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="aprobado">Aprobado</SelectItem>
              <SelectItem value="rechazado">Rechazado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabla para pantallas grandes */}
        <div className="hidden md:block rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {showAlumnoInfo && (
                  <TableHead>Alumno</TableHead>
                )}
                <TableHead>Fecha Ausencia</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJustificantes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={showAlumnoInfo ? 6 : 5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No se encontraron justificantes
                  </TableCell>
                </TableRow>
              ) : (
                filteredJustificantes.map((j) => (
                  <TableRow key={j.id}>
                    {showAlumnoInfo && (
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={j.alumno?.imagen || "/placeholder.svg"} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(j.alumno?.nombre, j.alumno?.apellidos)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {j.alumno?.nombre} {j.alumno?.apellidos}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {j.alumno?.matricula}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {formatDate(j.fechaAusencia)}
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
                    <TableCell>{getStatusBadge(j.status)}</TableCell>
                    <TableCell>
                      {j.archivoNombre ? (
                        <span className="text-sm text-primary flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {j.archivoNombre}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Sin archivo
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Ver detalles
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Detalles del Justificante</DialogTitle>
                            <DialogDescription>
                              Información completa del justificante
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            {showAlumnoInfo && j.alumno && (
                              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <Avatar>
                                  <AvatarImage src={j.alumno.imagen || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {getInitials(j.alumno.nombre, j.alumno.apellidos)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {j.alumno.nombre} {j.alumno.apellidos}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {j.alumno.matricula} - {j.carrera}
                                  </p>
                                </div>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Fecha de ausencia
                                </p>
                                <p className="font-medium">
                                  {formatDate(j.fechaAusencia)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Fecha de registro
                                </p>
                                <p className="font-medium">
                                  {formatDate(j.fechaCreacion)}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Motivo
                              </p>
                              <p className="font-medium">{j.motivo}</p>
                            </div>
                            {j.descripcion && (
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Descripción
                                </p>
                                <p>{j.descripcion}</p>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Estado
                                </p>
                                {getStatusBadge(j.status)}
                              </div>
                              {j.archivoNombre && (
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4 mr-2" />
                                  Descargar archivo
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Cards para móvil */}
        <div className="md:hidden space-y-3">
          {filteredJustificantes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron justificantes
            </div>
          ) : (
            filteredJustificantes.map((j) => (
              <Card key={j.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    {showAlumnoInfo && j.alumno && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={j.alumno.imagen || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {getInitials(j.alumno.nombre, j.alumno.apellidos)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {j.alumno.nombre} {j.alumno.apellidos}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {j.alumno.matricula}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatDate(j.fechaAusencia)}
                    </div>
                    <p className="font-medium">{j.motivo}</p>
                    {j.descripcion && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {j.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(j.status)}
                    {j.archivoNombre && (
                      <FileText className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Contador */}
        <div className="text-sm text-muted-foreground text-center pt-2">
          Mostrando {filteredJustificantes.length} de {justificantes.length}{" "}
          justificantes
        </div>
      </CardContent>
    </Card>
  );
}
