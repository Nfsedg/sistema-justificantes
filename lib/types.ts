export type UserRole = 'ESTUDIANTE' | 'DOCENTE' | 'COORDINADOR' | 'TUTOR';

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
  status?: string;
  workflowInstancia?: any;
  fechaInicio: Date | string;
  fechaFin: Date | string;
  motivo?: string | null;
  descripcion?: string | null;
  fileUrl: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
