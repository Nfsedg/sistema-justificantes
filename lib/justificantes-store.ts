import { Justificante } from './types';
import { mockJustificantes, mockUsers } from './mock-data';

// Store en memoria (en producción sería la base de datos)
let justificantes: Justificante[] = [...mockJustificantes];
let nextId = justificantes.length + 1;

export function getJustificantes(): Justificante[] {
  return justificantes;
}

export function getJustificantesByAlumno(alumnoId: string): Justificante[] {
  return justificantes.filter(j => j.alumnoId === alumnoId);
}

export function getJustificantesByCarrera(carrera: string): Justificante[] {
  return justificantes.filter(j => j.carrera === carrera);
}

export function getJustificanteById(id: string): Justificante | undefined {
  return justificantes.find(j => j.id === id);
}

export function searchJustificantes(query: string, carrera?: string): Justificante[] {
  const lowerQuery = query.toLowerCase();
  return justificantes.filter(j => {
    const matchesQuery = 
      j.alumno?.nombre.toLowerCase().includes(lowerQuery) ||
      j.alumno?.apellidos.toLowerCase().includes(lowerQuery) ||
      j.alumno?.matricula?.toLowerCase().includes(lowerQuery) ||
      j.motivo.toLowerCase().includes(lowerQuery);
    
    const matchesCarrera = !carrera || carrera === 'todas' || j.carrera === carrera;
    
    return matchesQuery && matchesCarrera;
  });
}

export function addJustificante(data: {
  alumnoId: string;
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
  descripcion?: string;
  archivoNombre?: string;
  carrera: string;
}): Justificante {
  const alumno = mockUsers.find(u => u.id === data.alumnoId);
  
  const newJustificante: Justificante = {
    id: String(nextId++),
    alumnoId: data.alumnoId,
    alumno,
    fechaInicio: data.fechaInicio,
    fechaFin: data.fechaFin,
    fechaCreacion: new Date().toISOString().split('T')[0],
    motivo: data.motivo,
    descripcion: data.descripcion,
    archivoNombre: data.archivoNombre,
    status: 'pendiente',
    carrera: data.carrera,
  };

  justificantes = [newJustificante, ...justificantes];
  return newJustificante;
}

export function updateJustificanteStatus(id: string, status: 'aprobado' | 'rechazado'): boolean {
  const index = justificantes.findIndex(j => j.id === id);
  if (index !== -1) {
    justificantes[index] = { ...justificantes[index], status };
    return true;
  }
  return false;
}
