export type UserRole = 'alumno' | 'profesor' | 'coordinador';

export type JustificanteStatus = 'pendiente' | 'aprobado' | 'rechazado';

export interface User {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  role: UserRole;
}

export interface Carrera {
  id: string;
  nombre: string;
  coordinadorId?: string;
}

export interface Justificante {
  id: number;
  estudianteId: string;
  estudiante?: User; // optional to avoid forcing joins everywhere
  fechaInicio: Date;
  fechaFin: Date;
  motivo?: string | null;
  descripcion?: string | null;
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
