# Sistema de Justificantes – Documentación Funcional y Técnica

## 1. Descripción General

El sistema de justificantes permite a los estudiantes subir documentos oficiales (PDF) que deben pasar por un flujo de aprobación institucional estructurado.

El flujo está diseñado bajo una arquitectura empresarial extensible basada en un **motor de workflow por etapas**, lo que permite:

- Aprobaciones secuenciales y paralelas.
- Usuarios que pueden no estar registrados al momento de la asignación.
- Auditoría completa del proceso.
- Escalabilidad futura sin cambios estructurales.

---

# 2. Actores del Sistema

## 2.1 Estudiante

- Crea el justificante.
- Sube archivo PDF.
- Define fechas.
- Especifica tutor.
- Especifica profesores.
- Consulta estado del proceso.

## 2.2 Tutor

- Revisa primero el justificante.
- Puede aprobar o rechazar.
- Puede agregar comentarios.

## 2.3 Profesores

- Solo pueden ver el justificante después de que el tutor lo apruebe.
- Cada profesor puede aprobar o rechazar individualmente.
- Pueden agregar comentarios.

## 2.4 Coordinador (opcional futuro)

- Puede agregarse como etapa adicional sin modificar estructura.

---

# 3. Flujo Funcional Completo

## 3.1 Creación del Justificante

1. El estudiante accede a la vista "Crear Justificante".
2. Completa:
   - Fecha inicio
   - Fecha fin
   - Motivo
   - Descripción
   - Tutor (correo electrónico)
   - Profesores (lista de correos)
   - Archivo PDF

3. Se envía `multipart/form-data` al backend.
4. El servidor:
   - Valida sesión (NextAuth).
   - Verifica que el rol sea `ESTUDIANTE`.
   - Valida archivo PDF.
   - Guarda archivo en `/uploads/justificantes/`.
   - Crea el justificante en base de datos.
   - Genera instancia del workflow.
   - Crea etapas instanciadas.
   - Crea asignaciones por correo.

Resultado:

- Justificante en estado `EN_PROCESO`.
- Etapa 1 (Tutor) en `EN_PROCESO`.
- Etapas siguientes en `PENDIENTE`.

---

## 3.2 Validación del Tutor

1. El tutor inicia sesión.
2. El sistema:
   - Busca asignaciones donde `email = tutor.email`.
   - Verifica que la etapa esté en `EN_PROCESO`.

3. El tutor puede:
   - Aprobar
   - Rechazar
   - Agregar comentario

### Si el tutor rechaza:

- Se marca la etapa como `COMPLETADA`.
- El justificante pasa a estado `RECHAZADO`.
- El flujo finaliza.

### Si el tutor aprueba:

- Se marca etapa 1 como `COMPLETADA`.
- Se activa etapa 2 (`EN_PROCESO`).
- Profesores pueden visualizar el justificante.

---

## 3.3 Validación de Profesores

1. Cada profesor ve solo sus asignaciones.
2. Cada uno puede:
   - Aprobar
   - Rechazar
   - Comentar

### Lógica de resolución:

- Si algún profesor rechaza → Justificante = `RECHAZADO`.
- Si todos aprueban → Justificante = `APROBADO`.

La etapa se marca como `COMPLETADA` cuando se cumple la condición según su tipo:

- `SECUENCIAL`
- `PARALELA`

---

# 4. Estados del Sistema

## 4.1 Estados del Justificante

- BORRADOR
- EN_PROCESO
- FINALIZADO
- CON_OBSERVACIONES
- CANCELADO

---

## 4.2 Estados de Etapa

- PENDIENTE
- EN_PROCESO
- COMPLETADA

---

## 4.3 Estados de Revisión Individual

- PENDIENTE
- APROBADO
- RECHAZADO

---

# 5. Casos Especiales

## 5.1 Usuario no registrado

Si el estudiante asigna un correo que aún no existe:

- Se guarda solo el email.
- Cuando el usuario se registre:
  - Se vincula automáticamente mediante actualización por email.
  - Podrá ver sus justificantes pendientes.

---

## 5.2 Tutor también es Profesor

El sistema permite:

- Que participe en múltiples etapas.
- O filtrar para evitar doble aprobación.

Recomendación institucional:
Si el tutor es también profesor, evitar duplicar su asignación en etapa 2.

---

# 6. Seguridad

- Validación de sesión con NextAuth.
- Validación estricta de rol.
- Archivos solo PDF.
- Validación por etapa antes de permitir revisión.
- Restricción de acceso por asignación.

---

# 7. Arquitectura Técnica

## 7.1 Componentes Principales

- Justificantes (documento base)
- Workflow (plantilla)
- WorkflowEtapa (definición)
- WorkflowInstancia (runtime)
- WorkflowEtapaInstancia (etapa activa)
- WorkflowAsignacion (usuario/email)

---

## 7.2 Transaccionalidad

La creación del justificante utiliza:

```
prisma.$transaction()
```

Garantiza que:

- Documento
- Instancia
- Etapas
- Asignaciones

Se creen de forma atómica.

---

# 8. Escalabilidad Futura

El modelo soporta:

- Agregar coordinador como tercera etapa.
- Flujos distintos por tipo de justificante.
- Panel administrativo para configurar workflows.
- Versionamiento de workflows.
- Historial completo de decisiones.
- Reportes institucionales.

No se requieren cambios estructurales para evolucionar.

---

# 9. Vista del Estudiante

El estudiante puede:

- Crear justificante.
- Ver estado global.
- Ver comentarios.
- Ver avance por etapa.
- Cancelar si está en proceso.
- Descargar archivo.

---

# 10. Vista del Tutor y Profesor

Pueden:

- Ver justificantes asignados.
- Aprobar o rechazar.
- Agregar comentarios.
- Ver historial del proceso.
- Descargar PDF.

---

# 11. Flujo Visual Simplificado

```
Estudiante
   ↓
Crea Justificante
   ↓
Etapa 1 – Tutor (Secuencial)
   ↓
Si aprueba
   ↓
Etapa 2 – Profesores (Paralela)
   ↓
Resolución individual
   ↓
Estado agregado:
   - FINALIZADO
   - CON_OBSERVACIONES
```

---

# 12. Consideraciones Técnicas de Archivos

Actualmente:

- Los archivos se almacenan en el servidor.
- Ruta: `/uploads/justificantes/`.

Limitaciones:

- No apto para serverless.
- No persistente en despliegues sin volumen.

Futuro recomendado:

- S3
- Azure Blob
- Supabase Storage

---

# 13. Nivel Arquitectónico

Este sistema no es solo "subir un PDF".

Es un:

> Motor institucional de aprobación por etapas configurable.

El diseño permite crecimiento sin refactorizaciones estructurales.
