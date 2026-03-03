# SIJE Sistema de Justificantes UPQROO

## SETUP

This project was created with nodejs version 22.12.0

Package managed with `pnpm`

Requires MySQL to connect to database and can run the app (Check the .env.example to setup your MySQL url)

Uses PRISMA ORM

- Download repo from Github
- Create and add the `.env` enviroment variables
- Install dependencies with `pnpm install`
- Update your database `pnpm prisma migrate deploy`(recommended) or `pnpm prisma db push`
- Generate prisma client `pnpm prisma generate`
- Seed roles in database `pnpm prisma db seed`
- Run the project `pnpm run dev`

TODOS:
-Justificante
Fecha de creación
Ultima modificación
Aprobado por
Rechazado por
Comentario de Tutor
Comentario de Maestro
Formato Creado

-Formato Justificante (Validar con Jhonatan)

-Creación de justificantes
Agregar correos para enviar el justificante (opcional).
Info de validación, "status" M:M

-Sistema de envio de correos
Correo estructurado a enviar
Redirección a plataforma

-Tutor
Ver justificantes "asignados" por estudiantes
Aprobar
Generar Formato
Reenviar

-Profesores
Ver justificantes "asignados" por estudiantes/tutores
Cambiar de estatus el justificante
Agregar notas
Ver todos los justificantes
Filtrado de justificantes

-Envio de Mailing cuando se asigna a profesor
-Exportación de datos (Excel/CSV)

FLUJO de envio de Justificante:
Alumno -> Tutor (Genera Formato justificante) -> Maestros (Visto, Pendiente-Notas si requiere actividad adicional, Aprovado)
