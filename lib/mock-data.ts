import { User, Carrera, Justificante } from './types';

export const carreras: Carrera[] = [
  { id: '1', nombre: 'Ingeniería en Software' },
  { id: '2', nombre: 'Ingeniería en Biotecnología' },
  { id: '3', nombre: 'Ingeniería en Redes y Telecomunicaciones' },
  { id: '4', nombre: 'Licenciatura en Administración y Gestión Empresarial' },
  { id: '5', nombre: 'Ingeniería Financiera' },
  { id: '6', nombre: 'Licenciatura en Terapia Física' },
  { id: '7', nombre: 'Ingeniería en Animación y Efectos Visuales' },
  { id: '8', nombre: 'Ingeniería en Energía' },
];

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'juan.perez@upqroo.edu.mx',
    name: 'Juan Carlos',
    username: 'Pérez López',
    role: 'alumno',
  },
  {
    id: '2',
    email: 'maria.garcia@upqroo.edu.mx',
    name: 'María Fernanda',
    username: 'García Hernández',
    role: 'alumno',
  },
  {
    id: '3',
    email: 'carlos.mendez@upqroo.edu.mx',
    name: 'Carlos Alberto',
    username: 'Méndez Ruiz',
    role: 'alumno',
  },
  {
    id: '4',
    email: 'ana.rodriguez@upqroo.edu.mx',
    name: 'Ana Sofía',
    username: 'Rodríguez Castillo',
    role: 'profesor',
  },
  {
    id: '5',
    email: 'roberto.sanchez@upqroo.edu.mx',
    name: 'Roberto',
    username: 'Sánchez Mora',
    role: 'coordinador',
  },
  {
    id: '6',
    email: 'laura.martinez@upqroo.edu.mx',
    name: 'Laura Elena',
    username: 'Martínez Vega',
    role: 'coordinador',
  },
];

export const mockJustificantes: Justificante[] = [
  {
    id: 1,
    estudianteId: '1',
    estudiante: mockUsers[0],
    fechaInicio: new Date('2026-01-15'),
    fechaFin: new Date('2026-01-15'),
    createdAt: new Date('2026-01-16'),
    updatedAt: new Date('2026-01-16'),
    motivo: 'Cita médica',
    descripcion: 'Cita de seguimiento con especialista en el Hospital General.',
    fileUrl: 'constancia_medica.pdf',
  },
  {
    id: 2,
    estudianteId: '1',
    estudiante: mockUsers[0],
    fechaInicio: new Date('2026-01-10'),
    fechaFin: new Date('2026-01-12'),
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-10'),
    motivo: 'Enfermedad',
    descripcion: 'Cuadro gripal con fiebre alta.',
    fileUrl: 'receta_medica.pdf',
  },
  {
    id: 3,
    estudianteId: '2',
    estudiante: mockUsers[1],
    fechaInicio: new Date('2026-01-18'),
    fechaFin: new Date('2026-01-18'),
    createdAt: new Date('2026-01-18'),
    updatedAt: new Date('2026-01-18'),
    motivo: 'Trámite oficial',
    descripcion: 'Renovación de pasaporte en oficinas de SRE.',
    fileUrl: 'comprobante_cita.pdf',
  },
  {
    id: 4,
    estudianteId: '3',
    estudiante: mockUsers[2],
    fechaInicio: new Date('2026-01-12'),
    fechaFin: new Date('2026-01-14'),
    createdAt: new Date('2026-01-13'),
    updatedAt: new Date('2026-01-13'),
    motivo: 'Emergencia familiar',
    descripcion: 'Fallecimiento de familiar cercano.',
    fileUrl: 'acta_defuncion.pdf',
  },
  {
    id: 5,
    estudianteId: '2',
    estudiante: mockUsers[1],
    fechaInicio: new Date('2026-01-05'),
    fechaFin: new Date('2026-01-07'),
    createdAt: new Date('2026-01-06'),
    updatedAt: new Date('2026-01-06'),
    motivo: 'Representación deportiva',
    descripcion: 'Participación en torneo universitario estatal de voleibol.',
    fileUrl: 'oficio_deportes.pdf',
  },
];

// Simula el usuario actual (cambiar para probar diferentes roles)
export const currentUser: User = mockUsers[0]; // Alumno por defecto

// Función para cambiar el usuario mock (útil para testing)
export function getMockUserByRole(role: 'alumno' | 'profesor' | 'coordinador'): User {
  return mockUsers.find(u => u.role === role) || mockUsers[0];
}
