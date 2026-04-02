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

## DEPLOYMENT

El proyecto se encuentra desplegado en los servidores de la UPQROO y con conexión a MySQL local dentro del mismo servidor.
Para desplegar el proyecto se debe seguir los siguientes pasos:

- Ingresar al servidor de la universidad (Preguntar por las credenciales para ingresar)
- Conectarse al servidor y moverse a la carpeta del proyecto `cd /var/www/appsupqroo/sistema-justificantes/`
- Hacer pull de los últimos cambios `git pull origin master` (utilizar `sudo git pull origin master` si surge un error similar: `fatal: detected dubious ownership in repository at '/var/www/appsupqroo/sistema-justificantes'`)
- Crear, editar o validar las variables de entorno `.env`.
- Actualizar la base de datos `pnpm prisma migrate deploy`
- Si es el PRIMER despliegue, hacer seed a la base de datos `pnpm prisma db seed`
- Hacer build del proyecto `pnpm run build`
- Crear o reiniciar la instancia de pm2 `pm2 start npm --name "sistema-justificantes" -- start` o `pm2 restart sistema-justificantes`
- Validar que la página se encuentre funcionando y actualizado

### Troubleshooting:

- Si tienes algún error al instalar o correr el proyecto en el servidor, validar que la versión de node sea la correcta. Puedes utilizar `nvm` para manejar las versiones de node con tu usuario del servidor.
- Si usas `sudo` al ejecutar algún comando `npm` `pnpm` o relacionado con node, se puede user otra versión de node distinta a la instalada en el usuario del servidor.

TODO
-Envio de Mailing cuando se asigna a profesor con redirección a plataforma
-Exportación de datos (Excel/CSV) TBD

FLUJO default de envio de Justificante:
Alumno -> Tutor (Genera Formato justificante) -> Maestros (Visto, Pendiente-Notas si requiere actividad adicional, Aprobado/Rechazado)
