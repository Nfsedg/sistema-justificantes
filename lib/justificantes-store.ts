import { Justificante } from './types';
import { mockJustificantes, mockUsers } from './mock-data';

// Store en memoria (en producción sería la base de datos)
let justificantes: Justificante[] = [...mockJustificantes];
let nextId = justificantes.length + 1;

export function getJustificantes(): Justificante[] {
  return justificantes;
}

export function getJustificantesByAlumno(estudianteId: string): Justificante[] {
  return justificantes.filter(j => j.estudianteId === estudianteId);
}

export function getJustificantesByCarrera(carrera: string): Justificante[] {
  return justificantes;
}

export function getJustificanteById(id: number): Justificante | undefined {
  return justificantes.find(j => j.id === id);
}

export function searchJustificantes(query: string, carrera?: string): Justificante[] {
  const lowerQuery = query.toLowerCase();
  return justificantes.filter(j => {
    const matchesQuery = 
      j.estudiante?.name?.toLowerCase().includes(lowerQuery) ||
      j.estudiante?.username?.toLowerCase().includes(lowerQuery) ||
      j.motivo?.toLowerCase().includes(lowerQuery);
    
    return matchesQuery;
  });
}

export function addJustificante(data: {
  estudianteId: string;
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
  descripcion?: string;
  archivoNombre?: string;
  carrera: string;
}): Justificante {
  const estudiante = mockUsers.find(u => u.id === data.estudianteId);
  
  const newJustificante: Justificante = {
    id: nextId++,
    estudianteId: data.estudianteId,
    estudiante,
    fechaInicio: new Date(data.fechaInicio),
    fechaFin: new Date(data.fechaFin),
    createdAt: new Date(),
    updatedAt: new Date(),
    motivo: data.motivo,
    descripcion: data.descripcion,
    fileUrl: data.archivoNombre || "",
  };

  justificantes = [newJustificante, ...justificantes];
  return newJustificante;
}

export function updateJustificanteStatus(id: number, status: 'aprobado' | 'rechazado'): boolean {
  return false;
}
