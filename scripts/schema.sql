-- =====================================================
-- SIJE - Sistema de Justificantes Estudiantiles
-- Universidad Politécnica de Quintana Roo
-- 
-- Script de creación de tablas para MySQL
-- Ejecutar cuando se conecte la base de datos real
-- =====================================================

-- Tabla de carreras
CREATE TABLE IF NOT EXISTS carreras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    abreviatura VARCHAR(10) NOT NULL,
    coordinador_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    rol ENUM('alumno', 'profesor', 'coordinador') NOT NULL DEFAULT 'alumno',
    carrera_id INT NULL,
    matricula VARCHAR(20) NULL,
    imagen_url VARCHAR(255) NULL,
    google_id VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_matricula (matricula),
    INDEX idx_rol (rol)
);

-- Actualizar referencia de coordinador en carreras
ALTER TABLE carreras
ADD FOREIGN KEY (coordinador_id) REFERENCES usuarios(id) ON DELETE SET NULL;

-- Tabla de justificantes
CREATE TABLE IF NOT EXISTS justificantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumno_id INT NOT NULL,
    fecha_ausencia DATE NOT NULL,
    fecha_creacion DATE NOT NULL,
    motivo VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    archivo_url VARCHAR(255) NULL,
    archivo_nombre VARCHAR(100) NULL,
    status ENUM('pendiente', 'aprobado', 'rechazado') NOT NULL DEFAULT 'pendiente',
    revisado_por INT NULL,
    fecha_revision TIMESTAMP NULL,
    comentario_revision TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (alumno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (revisado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_alumno (alumno_id),
    INDEX idx_fecha_ausencia (fecha_ausencia),
    INDEX idx_status (status),
    INDEX idx_fecha_creacion (fecha_creacion)
);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar carreras de la UPQROO
INSERT INTO carreras (nombre, abreviatura) VALUES
('Ingeniería en Software', 'ISW'),
('Ingeniería en Biotecnología', 'IBT'),
('Ingeniería en Redes y Telecomunicaciones', 'IRT'),
('Licenciatura en Administración y Gestión Empresarial', 'LAGE'),
('Ingeniería Financiera', 'IF'),
('Licenciatura en Terapia Física', 'LTF'),
('Ingeniería en Animación y Efectos Visuales', 'IAEV'),
('Ingeniería en Energía', 'IE');

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de justificantes con información completa
CREATE OR REPLACE VIEW v_justificantes_completos AS
SELECT 
    j.id,
    j.fecha_ausencia,
    j.fecha_creacion,
    j.motivo,
    j.descripcion,
    j.archivo_nombre,
    j.status,
    u.id AS alumno_id,
    u.nombre AS alumno_nombre,
    u.apellidos AS alumno_apellidos,
    u.matricula,
    u.email AS alumno_email,
    c.nombre AS carrera,
    c.abreviatura AS carrera_abrev,
    r.nombre AS revisado_por_nombre,
    j.fecha_revision,
    j.comentario_revision
FROM justificantes j
INNER JOIN usuarios u ON j.alumno_id = u.id
LEFT JOIN carreras c ON u.carrera_id = c.id
LEFT JOIN usuarios r ON j.revisado_por = r.id;

-- Vista de estadísticas por carrera
CREATE OR REPLACE VIEW v_estadisticas_carrera AS
SELECT 
    c.id AS carrera_id,
    c.nombre AS carrera,
    c.abreviatura,
    COUNT(j.id) AS total_justificantes,
    SUM(CASE WHEN j.status = 'pendiente' THEN 1 ELSE 0 END) AS pendientes,
    SUM(CASE WHEN j.status = 'aprobado' THEN 1 ELSE 0 END) AS aprobados,
    SUM(CASE WHEN j.status = 'rechazado' THEN 1 ELSE 0 END) AS rechazados,
    COUNT(DISTINCT j.alumno_id) AS alumnos_con_justificantes
FROM carreras c
LEFT JOIN usuarios u ON u.carrera_id = c.id AND u.rol = 'alumno'
LEFT JOIN justificantes j ON j.alumno_id = u.id
GROUP BY c.id, c.nombre, c.abreviatura;
