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
  coordinadorId?: string;
}

export interface Justificante {
  id: number;
  userId: string;
  user?: User; // optional to avoid forcing joins everywhere
  fechaInicio: Date;
  fechaFin: Date;
  motivo?: string | null;
  descripcion?: string | null;
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
