# Project Context & Guidelines (AGENT)

This document provides essential context and rules for AI assistants (Agents) working on the SIJE project.

## 🚀 Core Configuration

### Base Path
- **Value**: `/justificantes`
- **Critical Rule**: All internal navigation and API calls MUST account for this base path.
  - When using `next/link`, `href="/login"` automatically resolves to `/justificantes/login`.
  - When using manual redirects (e.g., `window.location.href`) or absolute paths in CSS/static files, always prefix with `/justificantes`.

### Technical Stack
- **Node.js**: `v22.12.0`
- **Package Manager**: `pnpm`
- **Database**: MySQL (via Prisma ORM)
- **Framework**: Next.js (App Router)
- **Port**: `3100`

## 🌐 Deployment Details

- **URL**: [https://apps.upqroo.edu.mx/justificantes](https://apps.upqroo.edu.mx/justificantes)
- **Server Path**: `/var/www/appsupqroo/sistema-justificantes/`
- **PM2 Process Name**: `sistema-justificantes`
- **Apache Proxy**: Configured via VirtualHost to transparently proxy `/justificantes` to `localhost:3100`.

## 🏗️ Application Architecture

### Business Logic (The "Flow")
1. **Alumno**: Initiates the request.
2. **Tutor**: Generates the justification format.
3. **Maestros**: Review (Seen, Pending, Approved/Rejected).
4. **Coordinador**: Overall administration and role management.

### Authentication (NextAuth)
- **Provider**: Google OAuth (Institutional accounts only).
- **Restriction**: Only emails ending in `@upqroo.edu.mx` are allowed (rejection leads to `/justificantes/auth/error?error=AccessDenied`).
- **Custom Pages**:
  - Sign In: `/login` (resolves to `/justificantes/login`)
  - Error: `/auth/error` (resolves to `/justificantes/auth/error`)

## 🎨 Design System
- **Theme**: Premium Dark / Orange
- **UI Components**: Shadcn/ui (Radix + Tailwind)
- **Primary Colors**: Dark brown/black backgrounds, vivid orange accents/gradients.

## 🛠️ Development Rules
- **Prisma**: Always run `pnpm prisma generate` after schema changes.
- **Seeding**: Use `pnpm prisma db seed` for initial workflow when start the project from scratch.
- **Assets**: Static assets in `public/` should be accessed with the `/justificantes/` prefix if not using Next.js Image component optimization correctly.

---
*Last updated: April 19, 2026*
