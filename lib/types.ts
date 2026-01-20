export type UserRole = 'alumno' | 'profesor' | 'coordinador';

export type JustificanteStatus = 'pendiente' | 'aprobado' | 'rechazado';

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellidos: string;
  rol: UserRole;
  carrera?: string;
  semestre?: number; // Solo para alumnos (1-9)
  matricula?: string; // Solo para alumnos
  imagen?: string;
  perfilCompleto?: boolean; // Indica si el alumno ya completó su información
}

export interface Carrera {
  id: string;
  nombre: string;
  abreviatura: string;
  coordinadorId?: string;
}

export interface Justificante {
  id: string;
  alumnoId: string;
  alumno?: User;
  fechaInicio: string; // Fecha de inicio de ausencia
  fechaFin: string; // Fecha de fin de ausencia (puede ser igual a fechaInicio)
  fechaCreacion: string;
  motivo: string;
  descripcion?: string;
  archivoUrl?: string;
  archivoNombre?: string;
  status: JustificanteStatus;
  carrera: string;
}
