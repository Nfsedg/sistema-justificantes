---
title: Stack Tecnológico
order: 1
---

# Stack Tecnológico – SIJE UPQROO

Esta página detalla las tecnologías, frameworks y librerías utilizadas en el desarrollo del **Sistema de Justificantes (SIJE)** de la Universidad Politécnica de Quintana Roo.

---

## 1. Núcleo del Sistema (Core)

| Tecnología | Propósito | Versión |
| :--- | :--- | :--- |
| **Node.js** | Entorno de ejecución de JavaScript. | `v22.12.0` |
| **Next.js** | Framework principal (App Router). | `v15+` |
| **React** | Biblioteca para interfaces de usuario. | `v19` |
| **TypeScript** | Lenguaje de programación con tipado estático. | `v5+` |
| **pnpm** | Gestor de paquetes eficiente y rápido. | `-` |

---

## 2. Base de Datos y Persistencia

El sistema utiliza un enfoque moderno de acceso a datos, garantizando integridad y facilidad de migración.

- **Motor**: MySQL / MariaDB (Consistente con los servidores institucionales).
- **ORM**: **Prisma**. Facilita el modelado de datos, migraciones controladas y un cliente con tipado fuerte.
- **Adaptador**: `@prisma/adapter-mariadb`.

---

## 3. Autenticación y Seguridad

- **NextAuth.js (Auth.js)**: Utilizado para la gestión de sesiones y autenticación.
- **Prisma Adapter**: Vincula NextAuth directamente con la base de datos para persistir usuarios y sesiones.
- **Seguridad**:
  - Validación de roles (Estudiante, Tutor, Profesor, Coordinador).
  - Protección de rutas mediante Middleware y Server Actions.
  - Almacenamiento seguro de archivos.

---

## 4. Interfaz de Usuario (UI/UX)

La interfaz se basa en un diseño limpio, responsivo y accesible.

- **Estilos**: **Tailwind CSS v4**. Utilizado para un diseño rápido y mantenible sin salir del HTML.
- **Componentes**: 
  - **Radix UI**: Componentes "headless" (sin estilos) para accesibilidad (Modales, Selects, Dropdowns).
  - **Shadcn UI**: Colección de componentes reutilizables construidos sobre Radix y Tailwind.
- **Iconografía**: **Lucide React**.
- **Notificaciones**: **Sonner**. Toasts elegantes para feedback inmediato.
- **Temas**: **Next Themes** (Soporte para modo claro/oscuro).

---

## 5. Gestión de Formularios y Validación

- **React Hook Form**: Gestión eficiente de estados de formularios sin re-renders innecesarios.
- **Zod**: Declaración de esquemas y validación de datos tanto en cliente como en servidor.
- **Resolvers**: `@hookform/resolvers` para integrar Zod con React Hook Form.

---

## 6. Otras Librerías Clave

- **Recharts**: Para la visualización de datos y estadísticas en el panel de control.
- **Date-fns**: Manipulación y formateo de fechas.
- **Embla Carousel**: Para slides y galerías si se requieren en el futuro.
- **React Markdown**: Motor para procesar y mostrar esta documentación.

---

## 7. Infraestructura y Despliegue

- **Servidor**: Hosting institucional UPQROO (Linux).
- **Procesos**: **PM2** para mantener la aplicación activa, reinicios automáticos y monitoreo.
- **Servidor Web**: Acceso configurado en el puerto `3100`.
- **Almacenamiento**: Sistema de archivos local (`/uploads/justificantes/`).

---

> [!NOTE]
> Para más detalles sobre el flujo de trabajo y la arquitectura lógica, consulta la [Documentación de Workflow](file:///Users/edgarprincipal/student-absence-justification/docs/justificantes-workflow.md).
