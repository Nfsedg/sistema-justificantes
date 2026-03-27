# SIJE Sistema de Justificantes UPQROO

## SETUP

This project was created with nodejs version `22.12.0`

Package managed with `pnpm`

Requires MySQL to connect to database and can run the app (Check the `.env.example` to setup your MySQL url)

Uses PRISMA ORM

- Download repo from Github
- Create and add the `.env` enviroment variables (ask for it with the team)
- Install dependencies with `pnpm install`
- Update your database `pnpm prisma migrate deploy`(recommended) or `pnpm prisma db push`
- Generate prisma client `pnpm prisma generate`
- Seed the database `pnpm prisma db seed`
- Run the project `pnpm run dev`

TODO
-Envio de Mailing cuando se asigna a profesor con redirección a plataforma
-Exportación de datos (Excel/CSV) TBD

FLUJO default de envio de Justificante:
Alumno -> Tutor (Genera Formato justificante) -> Maestros (Visto, Pendiente-Notas si requiere actividad adicional, Aprobado/Rechazado)
