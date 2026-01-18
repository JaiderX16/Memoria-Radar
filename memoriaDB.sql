-- ========================================
-- ECOSISTEMA MEMORIA - BASE DE DATOS UNIFICADA
-- Versión: 2.0 - Red Social Optimizada
-- Soporta: Landing Page, Red Social y Radar
-- Metodología: EAV + Relacional Híbrido
-- ========================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ========================================
-- NÚCLEO: JERARQUÍA GEOGRÁFICA (RADAR)
-- ========================================

CREATE TABLE regiones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  codigo VARCHAR(10) UNIQUE,
  descripcion TEXT,
  INDEX idx_codigo_region (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE paises (
  id INT PRIMARY KEY AUTO_INCREMENT,
  region_id INT,
  nombre VARCHAR(100) NOT NULL,
  codigo_iso VARCHAR(3) UNIQUE NOT NULL,
  codigo_telefono VARCHAR(10),
  moneda VARCHAR(10),
  idioma_principal VARCHAR(50),
  FOREIGN KEY (region_id) REFERENCES regiones(id) ON DELETE SET NULL,
  INDEX idx_codigo_iso (codigo_iso),
  INDEX idx_region (region_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ciudades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pais_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  FOREIGN KEY (pais_id) REFERENCES paises(id) ON DELETE CASCADE,
  INDEX idx_pais_ciudad (pais_id, nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE distritos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ciudad_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  FOREIGN KEY (ciudad_id) REFERENCES ciudades(id) ON DELETE CASCADE,
  INDEX idx_ciudad_distrito (ciudad_id, nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- NÚCLEO: CATEGORÍAS (RADAR + RED SOCIAL)
-- ========================================

CREATE TABLE categorias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  tipo_categoria ENUM('lugar', 'evento', 'contenido', 'general') NOT NULL,
  padre_categoria_id INT,
  nivel_categoria TINYINT NOT NULL,
  icono VARCHAR(50),
  color_hex VARCHAR(7),
  FOREIGN KEY (padre_categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
  INDEX idx_jerarquia_categoria (padre_categoria_id, nivel_categoria),
  INDEX idx_tipo_categoria (tipo_categoria),
  INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- NÚCLEO: SISTEMA DE USUARIOS UNIFICADO
-- ========================================

CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
  nombre_completo VARCHAR(150) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(300),
  portada_url VARCHAR(300),
  biografia TEXT,
  sitio_web VARCHAR(200),
  pais_id INT,
  ciudad_id INT,
  fecha_nacimiento DATE,
  genero ENUM('masculino', 'femenino', 'otro', 'prefiero_no_decir'),
  es_verificado TINYINT(1) DEFAULT 0,
  es_privado TINYINT(1) DEFAULT 0,
  es_activo TINYINT(1) DEFAULT 1,
  total_seguidores INT DEFAULT 0,
  total_seguidos INT DEFAULT 0,
  total_posts INT DEFAULT 0,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso TIMESTAMP NULL,
  FOREIGN KEY (pais_id) REFERENCES paises(id) ON DELETE SET NULL,
  FOREIGN KEY (ciudad_id) REFERENCES ciudades(id) ON DELETE SET NULL,
  INDEX idx_email (email),
  INDEX idx_nombre_usuario (nombre_usuario),
  INDEX idx_pais_usuario (pais_id),
  INDEX idx_ciudad_usuario (ciudad_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- RADAR: LUGARES
-- ========================================

CREATE TABLE lugares (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_creador_id INT,
  distrito_id INT NOT NULL,
  categoria_id INT,
  nombre VARCHAR(200) NOT NULL,
  descripcion_completa TEXT,
  descripcion_corta VARCHAR(300),
  direccion_completa VARCHAR(250),
  ubicacion POINT NOT NULL,
  es_zona_centrica TINYINT(1) DEFAULT 1,
  es_zona_afueras TINYINT(1) DEFAULT 0,
  popularidad_score DECIMAL(4,2) DEFAULT 0.00,
  calificacion_promedio DECIMAL(3,2) DEFAULT 0.00,
  total_resenas INT DEFAULT 0,
  total_visitas INT DEFAULT 0,
  es_verificado TINYINT(1) DEFAULT 0,
  estado ENUM('activo', 'inactivo', 'pendiente', 'eliminado') DEFAULT 'activo',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_creador_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (distrito_id) REFERENCES distritos(id) ON DELETE CASCADE,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
  SPATIAL INDEX idx_ubicacion (ubicacion),
  INDEX idx_distrito_categoria_estado (distrito_id, categoria_id, estado),
  INDEX idx_categoria_estado (categoria_id, estado),
  INDEX idx_popularidad (popularidad_score),
  INDEX idx_calificacion (calificacion_promedio),
  INDEX idx_usuario_creador (usuario_creador_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- RADAR: EVENTOS
-- ========================================

CREATE TABLE eventos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_creador_id INT,
  lugar_id INT,
  categoria_id INT,
  nombre VARCHAR(200) NOT NULL,
  descripcion_completa TEXT,
  descripcion_corta VARCHAR(300),
  ubicacion POINT NOT NULL,
  direccion VARCHAR(250),
  fecha_inicio DATETIME NOT NULL,
  fecha_fin DATETIME,
  es_recurrente TINYINT(1) DEFAULT 0,
  precio_entrada DECIMAL(10,2),
  capacidad_maxima INT,
  asistentes_confirmados INT DEFAULT 0,
  es_publico TINYINT(1) DEFAULT 1,
  estado ENUM('programado', 'en_curso', 'finalizado', 'cancelado') DEFAULT 'programado',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_creador_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (lugar_id) REFERENCES lugares(id) ON DELETE SET NULL,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
  SPATIAL INDEX idx_ubicacion_evento (ubicacion),
  INDEX idx_fecha_inicio (fecha_inicio),
  INDEX idx_estado_evento (estado),
  INDEX idx_usuario_creador_evento (usuario_creador_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- RED SOCIAL: POSTS (Publicaciones en el perfil)
-- ========================================

CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  contenido TEXT,
  lugar_id INT,
  evento_id INT,
  tipo_post ENUM('texto', 'imagen', 'video', 'enlace') DEFAULT 'texto',
  url_enlace VARCHAR(500),
  es_publico TINYINT(1) DEFAULT 1,
  permite_comentarios TINYINT(1) DEFAULT 1,
  total_likes INT DEFAULT 0,
  total_comentarios INT DEFAULT 0,
  total_compartidos INT DEFAULT 0,
  estado ENUM('publicado', 'archivado', 'eliminado') DEFAULT 'publicado',
  fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (lugar_id) REFERENCES lugares(id) ON DELETE SET NULL,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE SET NULL,
  INDEX idx_usuario_post (usuario_id, fecha_publicacion),
  INDEX idx_lugar_post (lugar_id),
  INDEX idx_evento_post (evento_id),
  INDEX idx_estado (estado, fecha_publicacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- RED SOCIAL: HISTORIAS (24 horas)
-- ========================================

CREATE TABLE historias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  tipo_historia ENUM('imagen', 'video', 'texto') NOT NULL,
  contenido_texto VARCHAR(500),
  url_media VARCHAR(500),
  url_thumbnail VARCHAR(500),
  duracion_segundos TINYINT DEFAULT 5,
  lugar_id INT,
  total_vistas INT DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion DATETIME NOT NULL,
  es_activa TINYINT(1) DEFAULT 1,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (lugar_id) REFERENCES lugares(id) ON DELETE SET NULL,
  INDEX idx_usuario_historia (usuario_id, fecha_creacion),
  INDEX idx_activa_expiracion (es_activa, fecha_expiracion),
  INDEX idx_fecha_expiracion (fecha_expiracion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- RED SOCIAL: VISTAS DE HISTORIAS
-- ========================================

CREATE TABLE vistas_historias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  historia_id INT NOT NULL,
  usuario_id INT NOT NULL,
  fecha_vista TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (historia_id) REFERENCES historias(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE KEY unique_vista (historia_id, usuario_id),
  INDEX idx_historia (historia_id),
  INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- RED SOCIAL: COMENTARIOS
-- ========================================

CREATE TABLE comentarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  post_id INT NOT NULL,
  comentario_padre_id INT,
  contenido TEXT NOT NULL,
  total_likes INT DEFAULT 0,
  fecha_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (comentario_padre_id) REFERENCES comentarios(id) ON DELETE CASCADE,
  INDEX idx_post_comentario (post_id, fecha_comentario),
  INDEX idx_usuario_comentario (usuario_id),
  INDEX idx_comentario_padre (comentario_padre_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- RED SOCIAL: LIKES
-- ========================================

CREATE TABLE likes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  post_id INT,
  comentario_id INT,
  historia_id INT,
  fecha_like TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (comentario_id) REFERENCES comentarios(id) ON DELETE CASCADE,
  FOREIGN KEY (historia_id) REFERENCES historias(id) ON DELETE CASCADE,
  UNIQUE KEY unique_like_post (usuario_id, post_id),
  UNIQUE KEY unique_like_comentario (usuario_id, comentario_id),
  UNIQUE KEY unique_like_historia (usuario_id, historia_id),
  INDEX idx_usuario_like (usuario_id),
  INDEX idx_post_like (post_id),
  INDEX idx_comentario_like (comentario_id),
  INDEX idx_historia_like (historia_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- RED SOCIAL: SEGUIDORES
-- ========================================

CREATE TABLE seguidores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_seguidor_id INT NOT NULL,
  usuario_seguido_id INT NOT NULL,
  estado_solicitud ENUM('aceptada', 'pendiente', 'rechazada') DEFAULT 'aceptada',
  fecha_seguimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_seguidor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_seguido_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE KEY unique_seguimiento (usuario_seguidor_id, usuario_seguido_id),
  INDEX idx_seguidor (usuario_seguidor_id),
  INDEX idx_seguido (usuario_seguido_id),
  INDEX idx_estado (estado_solicitud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- RED SOCIAL: GUARDADOS
-- ========================================

CREATE TABLE guardados (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  post_id INT,
  lugar_id INT,
  evento_id INT,
  coleccion VARCHAR(100) DEFAULT 'general',
  fecha_guardado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (lugar_id) REFERENCES lugares(id) ON DELETE CASCADE,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
  INDEX idx_usuario_guardado (usuario_id, fecha_guardado),
  INDEX idx_post_guardado (post_id),
  INDEX idx_lugar_guardado (lugar_id),
  INDEX idx_evento_guardado (evento_id),
  INDEX idx_coleccion (usuario_id, coleccion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- RADAR: RESEÑAS Y CALIFICACIONES
-- ========================================

CREATE TABLE resenas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  lugar_id INT,
  evento_id INT,
  comentario TEXT,
  calificacion TINYINT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
  aspectos_calificados JSON,
  fecha_visita DATE,
  fecha_resena TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  es_verificada TINYINT(1) DEFAULT 0,
  likes_count INT DEFAULT 0,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (lugar_id) REFERENCES lugares(id) ON DELETE CASCADE,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
  INDEX idx_lugar_calificacion_fecha (lugar_id, calificacion, fecha_resena),
  INDEX idx_evento_calificacion (evento_id, calificacion),
  INDEX idx_usuario_resenas (usuario_id, fecha_resena),
  INDEX idx_verificada_calificacion (es_verificada, calificacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- MULTIMEDIA: IMÁGENES Y ARCHIVOS
-- ========================================

CREATE TABLE imagenes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  post_id INT,
  historia_id INT,
  lugar_id INT,
  evento_id INT,
  url_original VARCHAR(300) NOT NULL,
  url_thumbnail VARCHAR(300),
  url_medium VARCHAR(300),
  descripcion_alt VARCHAR(200),
  es_imagen_principal TINYINT(1) DEFAULT 0,
  orden_visualizacion TINYINT DEFAULT 1,
  tipo_imagen ENUM('exterior', 'interior', 'menu', 'ambiente', 'perfil', 'portada', 'otro') DEFAULT 'otro',
  ancho_px INT,
  alto_px INT,
  fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (historia_id) REFERENCES historias(id) ON DELETE CASCADE,
  FOREIGN KEY (lugar_id) REFERENCES lugares(id) ON DELETE CASCADE,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
  INDEX idx_post_imagen (post_id, orden_visualizacion),
  INDEX idx_historia_imagen (historia_id),
  INDEX idx_lugar_imagen_principal (lugar_id, es_imagen_principal),
  INDEX idx_evento_imagen (evento_id),
  INDEX idx_usuario_imagen (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- FASE 1: CONTENIDO PROFESIONAL 360/3D
-- ========================================

CREATE TABLE tipos_contenido_profesional (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  descripcion TEXT,
  requiere_archivo TINYINT(1) DEFAULT 0,
  extension_permitida VARCHAR(100),
  INDEX idx_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar tipos profesionales
INSERT INTO tipos_contenido_profesional (nombre, codigo, descripcion, requiere_archivo, extension_permitida) VALUES
('Foto 360°', 'FOTO_360', 'Fotografía panorámica de 360 grados', 1, '.jpg,.jpeg,.png'),
('Modelo 3D', 'MODELO_3D', 'Modelado tridimensional interactivo', 1, '.glb,.gltf,.obj,.fbx'),
('Recorrido Virtual', 'RECORRIDO_VIRTUAL', 'Tour virtual con múltiples puntos 360°', 0, NULL);

CREATE TABLE contenido_profesional (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tipo_contenido_id INT NOT NULL,
  lugar_id INT,
  evento_id INT,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  url_contenido VARCHAR(500),
  url_thumbnail VARCHAR(500),
  metadata JSON,
  es_destacado TINYINT(1) DEFAULT 0,
  total_vistas INT DEFAULT 0,
  estado ENUM('publicado', 'borrador', 'archivado') DEFAULT 'publicado',
  fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tipo_contenido_id) REFERENCES tipos_contenido_profesional(id) ON DELETE RESTRICT,
  FOREIGN KEY (lugar_id) REFERENCES lugares(id) ON DELETE SET NULL,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE SET NULL,
  INDEX idx_tipo_contenido (tipo_contenido_id),
  INDEX idx_destacado (es_destacado, fecha_publicacion),
  INDEX idx_lugar_contenido (lugar_id),
  INDEX idx_evento_contenido (evento_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE recorridos_virtuales (
  id INT PRIMARY KEY AUTO_INCREMENT,
  contenido_profesional_id INT,
  lugar_id INT,
  evento_id INT,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  url_thumbnail VARCHAR(300),
  total_puntos INT DEFAULT 0,
  duracion_estimada_minutos INT,
  total_vistas INT DEFAULT 0,
  estado ENUM('activo', 'inactivo', 'borrador') DEFAULT 'activo',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (contenido_profesional_id) REFERENCES contenido_profesional(id) ON DELETE CASCADE,
  FOREIGN KEY (lugar_id) REFERENCES lugares(id) ON DELETE SET NULL,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE SET NULL,
  INDEX idx_lugar_recorrido (lugar_id),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE puntos_recorrido (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recorrido_id INT NOT NULL,
  nombre VARCHAR(150),
  descripcion TEXT,
  url_imagen_360 VARCHAR(500) NOT NULL,
  orden INT NOT NULL,
  ubicacion POINT NOT NULL,
  metadata JSON,
  FOREIGN KEY (recorrido_id) REFERENCES recorridos_virtuales(id) ON DELETE CASCADE,
  SPATIAL INDEX idx_ubicacion_punto (ubicacion),
  INDEX idx_recorrido_orden (recorrido_id, orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- SISTEMA EAV: ATRIBUTOS DINÁMICOS
-- ========================================

CREATE TABLE dependency_info (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dependency_variables (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  tipo_dato ENUM('text', 'number', 'boolean', 'date', 'json', 'url') DEFAULT 'text',
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dependency_info_detail (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dependency_info_id INT NOT NULL,
  dependency_variable_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  valor TEXT,
  FOREIGN KEY (dependency_info_id) REFERENCES dependency_info(id) ON DELETE CASCADE,
  FOREIGN KEY (dependency_variable_id) REFERENCES dependency_variables(id) ON DELETE CASCADE,
  INDEX idx_dependency_info (dependency_info_id),
  INDEX idx_dependency_variable (dependency_variable_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- ATRIBUTOS DINÁMICOS PARA ENTIDADES
-- ========================================

CREATE TABLE atributos_usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  dependency_variable_id INT NOT NULL,
  valor TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (dependency_variable_id) REFERENCES dependency_variables(id) ON DELETE CASCADE,
  INDEX idx_usuario_atributo (usuario_id),
  INDEX idx_variable (dependency_variable_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE atributos_lugares (
  id INT PRIMARY KEY AUTO_INCREMENT,
  lugar_id INT NOT NULL,
  dependency_variable_id INT NOT NULL,
  valor TEXT,
  FOREIGN KEY (lugar_id) REFERENCES lugares(id) ON DELETE CASCADE,
  FOREIGN KEY (dependency_variable_id) REFERENCES dependency_variables(id) ON DELETE CASCADE,
  INDEX idx_lugar_atributo (lugar_id),
  INDEX idx_variable (dependency_variable_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE atributos_eventos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  evento_id INT NOT NULL,
  dependency_variable_id INT NOT NULL,
  valor TEXT,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
  FOREIGN KEY (dependency_variable_id) REFERENCES dependency_variables(id) ON DELETE CASCADE,
  INDEX idx_evento_atributo (evento_id),
  INDEX idx_variable (dependency_variable_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- CONTENIDO DESTACADO (LANDING PAGE)
-- ========================================

CREATE TABLE contenido_destacado (
  id INT PRIMARY KEY AUTO_INCREMENT,
  contenido_profesional_id INT,
  lugar_id INT,
  evento_id INT,
  recorrido_virtual_id INT,
  tipo_destacado ENUM('hero', 'featured', 'trending', 'recommended') NOT NULL,
  prioridad INT DEFAULT 0,
  fecha_inicio DATETIME,
  fecha_fin DATETIME,
  es_activo TINYINT(1) DEFAULT 1,
  FOREIGN KEY (contenido_profesional_id) REFERENCES contenido_profesional(id) ON DELETE CASCADE,
  FOREIGN KEY (lugar_id) REFERENCES lugares(id) ON DELETE CASCADE,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
  FOREIGN KEY (recorrido_virtual_id) REFERENCES recorridos_virtuales(id) ON DELETE CASCADE,
  INDEX idx_tipo_prioridad (tipo_destacado, prioridad),
  INDEX idx_activo_fechas (es_activo, fecha_inicio, fecha_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- NOTIFICACIONES
-- ========================================

CREATE TABLE notificaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  tipo_notificacion ENUM('like', 'comentario', 'seguidor', 'mencion', 'evento', 'sistema') NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  mensaje TEXT,
  entidad_relacionada_tipo VARCHAR(50),
  entidad_relacionada_id INT,
  url_destino VARCHAR(300),
  es_leida TINYINT(1) DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario_leida (usuario_id, es_leida, fecha_creacion),
  INDEX idx_tipo (tipo_notificacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- SESIONES Y AUTENTICACIÓN
-- ========================================

CREATE TABLE sesiones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  refresh_token VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion DATETIME NOT NULL,
  es_activa TINYINT(1) DEFAULT 1,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_usuario_activa (usuario_id, es_activa),
  INDEX idx_expiracion (fecha_expiracion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;