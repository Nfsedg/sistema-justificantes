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

1.  **Conectarse al servidor**: Ingresar al servidor de la universidad (Preguntar por las credenciales).
2.  **Moverse a la carpeta**: `cd /var/www/appsupqroo/sistema-justificantes/`
3.  **Actualizar código**: `git pull origin master` (Usar `sudo` si es necesario).
4.  **Variables de entorno**: Validar el archivo `.env`.
5.  **Base de Datos**: `pnpm prisma migrate deploy` (y `pnpm prisma db seed` si es la primera vez).
6.  **Build**: `pnpm run build` (Importante: esto aplica el `basePath` configurado en `next.config.mjs`).
7.  **PM2**: `pm2 restart sistema-justificantes` (o `pm2 start npm --name "sistema-justificantes" -- start`).
8.  **Apache**: Asegurarse de que el VirtualHost esté configurado (ver sección abajo).

### Configuración de Apache (VirtualHost con SSL)

Para que la aplicación sea accesible en `https://apps.upqroo.edu.mx/justificantes`, se debe configurar el VirtualHost de Apache de la siguiente manera:

1.  Habilitar módulos necesarios:
    ```bash
    sudo a2enmod proxy proxy_http
    sudo systemctl restart apache2
    ```

2.  Editar el archivo de configuración del sitio (ej. `/etc/apache2/sites-available/apps-ssl.conf`):

```apache
<VirtualHost *:443>
    ServerName apps.upqroo.edu.mx

    # Configuración SSL (ajustar rutas a tus certificados)
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/upqroo.edu.mx.crt
    SSLCertificateKeyFile /etc/ssl/private/upqroo.edu.mx.key
    SSLCertificateChainFile /etc/ssl/certs/upqroo.edu.mx.ca-bundle

    ProxyRequests Off
    ProxyPreserveHost On

    # Redirección a la aplicación Next.js en el puerto 3100
    <Location /justificantes>
        ProxyPass http://localhost:3100/justificantes
        ProxyPassReverse http://localhost:3100/justificantes
    </Location>

    # Manejo de slash final opcional
    RedirectMatch ^/justificantes$ /justificantes/

    ErrorLog ${APACHE_LOG_DIR}/justificantes_error.log
    CustomLog ${APACHE_LOG_DIR}/justificantes_access.log combined
</VirtualHost>
```

3.  Reiniciar Apache: `sudo systemctl restart apache2`

### Troubleshooting:

- **Error de versión de Node**: Validar con `node -v`. Usar `nvm` si es necesario.
- **Permisos**: Si usas `sudo` para comandos npm/pnpm, asegúrate de que el usuario tenga los permisos correctos sobre la carpeta `.next`.
- **404 en assets**: Asegúrate de haber hecho el `build` después de agregar el `basePath` en `next.config.mjs`.

TODO
-Envio de Mailing cuando se asigna a profesor con redirección a plataforma
-Exportación de datos (Excel/CSV) TBD

FLUJO default de envio de Justificante:
Alumno -> Tutor (Genera Formato justificante) -> Maestros (Visto, Pendiente-Notas si requiere actividad adicional, Aprobado/Rechazado)
