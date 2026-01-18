# Documentación de API - MEMORIA Backend (Node.js)

## Base URL
```
http://localhost:3000/api
```

---

## 🔐 Autenticación

Todos los endpoints protegidos requieren el header:
```
Authorization: Bearer {token}
```

---

## Endpoints Disponibles

### 1. AUTENTICACIÓN

#### POST /api/auth/register
Registrar un nuevo usuario

**Request Body:**
```json
{
  "nombre_usuario": "johndoe",
  "nombre_completo": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Validaciones:**
- `nombre_usuario`: 3-50 caracteres, solo letras, números y guiones bajos
- `nombre_completo`: 2-150 caracteres
- `email`: Formato de email válido
- `password`: Mínimo 8 caracteres, debe contener mayúscula, minúscula y número

**Response (201):**
```json
{
  "status": "success",
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "nombre_usuario": "johndoe",
      "nombre_completo": "John Doe",
      "email": "john@example.com",
      "avatar_url": null,
      "es_verificado": false,
      "fecha_registro": "2024-12-08T20:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### POST /api/auth/login
Iniciar sesión

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "id": 1,
      "nombre_usuario": "johndoe",
      "nombre_completo": "John Doe",
      "email": "john@example.com",
      "avatar_url": null,
      "es_verificado": false,
      "es_privado": false,
      "fecha_registro": "2024-12-08T20:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### POST /api/auth/logout
Cerrar sesión (requiere autenticación)

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Sesión cerrada exitosamente"
}
```

---

#### POST /api/auth/logout-all
Cerrar todas las sesiones del usuario (requiere autenticación)

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Todas las sesiones han sido cerradas"
}
```

---

#### POST /api/auth/refresh-token
Renovar token de acceso

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Token renovado exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### GET /api/auth/me
Obtener perfil del usuario autenticado (requiere autenticación)

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Perfil obtenido exitosamente",
  "data": {
    "user": {
      "id": 1,
      "nombre_usuario": "johndoe",
      "nombre_completo": "John Doe",
      "email": "john@example.com",
      "avatar_url": null,
      "portada_url": null,
      "biografia": null,
      "sitio_web": null,
      "pais_id": null,
      "ciudad_id": null,
      "fecha_nacimiento": null,
      "genero": null,
      "es_verificado": false,
      "es_privado": false,
      "es_activo": true,
      "total_seguidores": 0,
      "total_seguidos": 0,
      "total_posts": 0,
      "fecha_registro": "2024-12-08T20:00:00.000Z",
      "ultimo_acceso": "2024-12-08T22:00:00.000Z"
    }
  }
}
```

---

### 2. USUARIOS

#### GET /api/usuarios/:nombre_usuario
Obtener perfil público de un usuario

**Ejemplo:** `GET /api/usuarios/johndoe`

**Response (200):**
```json
{
  "status": "success",
  "message": "Perfil obtenido exitosamente",
  "data": {
    "usuario": {
      "id": 1,
      "nombre_usuario": "johndoe",
      "nombre_completo": "John Doe",
      "avatar_url": null,
      "portada_url": null,
      "biografia": "Amante de la tecnología",
      "sitio_web": "https://johndoe.com",
      "es_verificado": false,
      "es_privado": false,
      "total_seguidores": 150,
      "total_seguidos": 200,
      "total_posts": 45,
      "fecha_registro": "2024-12-08T20:00:00.000Z"
    }
  }
}
```

---

#### PUT /api/usuarios/perfil
Actualizar perfil del usuario autenticado (requiere autenticación)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "nombre_completo": "John Doe Updated",
  "biografia": "Nueva biografía",
  "sitio_web": "https://newsite.com",
  "pais_id": 1,
  "ciudad_id": 5,
  "fecha_nacimiento": "1990-01-15",
  "genero": "masculino",
  "es_privado": false
}
```

**Validaciones:**
- `nombre_completo`: 2-150 caracteres (opcional)
- `biografia`: Máximo 500 caracteres (opcional)
- `sitio_web`: URL válida (opcional)
- `genero`: masculino, femenino, otro, prefiero_no_decir (opcional)
- `es_privado`: boolean (opcional)

**Response (200):**
```json
{
  "status": "success",
  "message": "Perfil actualizado exitosamente",
  "data": {
    "usuario": {
      "id": 1,
      "nombre_usuario": "johndoe",
      "nombre_completo": "John Doe Updated",
      "biografia": "Nueva biografía",
      ...
    }
  }
}
```

---

#### PUT /api/usuarios/avatar
Actualizar avatar del usuario (requiere autenticación)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Avatar actualizado exitosamente",
  "data": {
    "usuario": { ... }
  }
}
```

---

#### PUT /api/usuarios/portada
Actualizar imagen de portada del usuario (requiere autenticación)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "portada_url": "https://example.com/cover.jpg"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Portada actualizada exitosamente",
  "data": {
    "usuario": { ... }
  }
}
```

---

### 3. POSTS

#### GET /api/posts
Listar posts del feed con paginación

**Query Parameters:**
- `page`: Número de página (default: 1)
- `limit`: Posts por página (default: 20, max: 100)
- `usuario_id`: Filtrar por ID de usuario (opcional)
- `tipo_post`: Filtrar por tipo (texto, imagen, video, enlace) (opcional)

**Ejemplo:** `GET /api/posts?page=1&limit=10&usuario_id=1`

**Response (200):**
```json
{
  "status": "success",
  "message": "Posts obtenidos exitosamente",
  "data": [
    {
      "id": 1,
      "usuario_id": 1,
      "contenido": "Mi primer post!",
      "lugar_id": null,
      "evento_id": null,
      "tipo_post": "texto",
      "url_enlace": null,
      "es_publico": true,
      "permite_comentarios": true,
      "total_likes": 15,
      "total_comentarios": 3,
      "total_compartidos": 0,
      "estado": "publicado",
      "fecha_publicacion": "2024-12-08T20:00:00.000Z",
      "nombre_usuario": "johndoe",
      "nombre_completo": "John Doe",
      "avatar_url": null,
      "usuario_verificado": false,
      "lugar_nombre": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### GET /api/posts/:id
Obtener un post por ID

**Ejemplo:** `GET /api/posts/1`

**Response (200):**
```json
{
  "status": "success",
  "message": "Post obtenido exitosamente",
  "data": {
    "post": {
      "id": 1,
      "usuario_id": 1,
      "contenido": "Mi primer post!",
      ...
    }
  }
}
```

---

#### POST /api/posts
Crear un nuevo post (requiere autenticación)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "contenido": "Este es mi nuevo post sobre Node.js",
  "tipo_post": "texto",
  "lugar_id": 5,
  "evento_id": null,
  "url_enlace": null,
  "es_publico": true,
  "permite_comentarios": true
}
```

**Validaciones:**
- `contenido`: Requerido, 1-5000 caracteres
- `tipo_post`: texto, imagen, video, enlace (opcional, default: texto)
- `lugar_id`: Número entero (opcional)
- `evento_id`: Número entero (opcional)
- `es_publico`: boolean (opcional, default: true)
- `permite_comentarios`: boolean (opcional, default: true)

**Response (201):**
```json
{
  "status": "success",
  "message": "Post creado exitosamente",
  "data": {
    "post": {
      "id": 2,
      "usuario_id": 1,
      "contenido": "Este es mi nuevo post sobre Node.js",
      ...
    }
  }
}
```

---

#### PUT /api/posts/:id
Actualizar un post (requiere autenticación y ser el autor)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "contenido": "Contenido actualizado",
  "lugar_id": 10,
  "es_publico": false,
  "permite_comentarios": true
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Post actualizado exitosamente",
  "data": {
    "post": { ... }
  }
}
```

---

#### DELETE /api/posts/:id
Eliminar un post (requiere autenticación y ser el autor)

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Post eliminado exitosamente"
}
```

---

#### POST /api/posts/:id/like
Dar like a un post (requiere autenticación)

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Like agregado exitosamente"
}
```

---

#### DELETE /api/posts/:id/like
Quitar like de un post (requiere autenticación)

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Like removido exitosamente"
}
```

---

### 4. LUGARES

#### GET /api/lugares
Listar lugares con filtros y paginación

**Query Parameters:**
- `page`: Número de página (default: 1)
- `limit`: Lugares por página (default: 20)
- `categoria_id`: Filtrar por categoría (opcional)
- `distrito_id`: Filtrar por distrito (opcional)
- `busqueda`: Búsqueda por nombre o descripción (opcional)
- `es_zona_centrica`: true para filtrar solo zona céntrica (opcional)

**Ejemplo:** `GET /api/lugares?page=1&categoria_id=3&busqueda=restaurante`

**Response (200):**
```json
{
  "status": "success",
  "message": "Lugares obtenidos exitosamente",
  "data": [
    {
      "id": 1,
      "usuario_creador_id": 1,
      "distrito_id": 5,
      "categoria_id": 3,
      "nombre": "Restaurante El Buen Sabor",
      "descripcion_completa": "Restaurante de comida tradicional...",
      "descripcion_corta": "Comida tradicional",
      "direccion_completa": "Calle Principal 123",
      "latitud": -2.1234567,
      "longitud": -79.1234567,
      "es_zona_centrica": true,
      "es_zona_afueras": false,
      "popularidad_score": 85,
      "calificacion_promedio": 4.5,
      "total_resenas": 120,
      "total_visitas": 1500,
      "es_verificado": true,
      "estado": "activo",
      "categoria_nombre": "Restaurantes",
      "distrito_nombre": "Centro"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### GET /api/lugares/cercanos
Buscar lugares cercanos por coordenadas

**Query Parameters:**
- `latitud`: Latitud (requerido, -90 a 90)
- `longitud`: Longitud (requerido, -180 a 180)
- `radio`: Radio de búsqueda en km (opcional, default: 5, max: 100)
- `limit`: Número máximo de resultados (opcional, default: 20)

**Ejemplo:** `GET /api/lugares/cercanos?latitud=-2.1234&longitud=-79.5678&radio=10&limit=10`

**Response (200):**
```json
{
  "status": "success",
  "message": "Lugares cercanos obtenidos exitosamente",
  "data": {
    "lugares": [
      {
        "id": 1,
        "nombre": "Restaurante El Buen Sabor",
        "latitud": -2.1235,
        "longitud": -79.5679,
        "distancia_km": 0.15,
        ...
      }
    ],
    "total": 10
  }
}
```

---

#### GET /api/lugares/:id
Obtener un lugar por ID

**Ejemplo:** `GET /api/lugares/1`

**Response (200):**
```json
{
  "status": "success",
  "message": "Lugar obtenido exitosamente",
  "data": {
    "lugar": {
      "id": 1,
      "nombre": "Restaurante El Buen Sabor",
      "descripcion_completa": "...",
      "latitud": -2.1234567,
      "longitud": -79.1234567,
      "categoria_nombre": "Restaurantes",
      "distrito_nombre": "Centro",
      "ciudad_nombre": "Guayaquil",
      "pais_nombre": "Ecuador",
      "creador_nombre_usuario": "johndoe",
      ...
    }
  }
}
```

---

#### POST /api/lugares
Crear un nuevo lugar (requiere autenticación)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "nombre": "Nuevo Café Moderno",
  "descripcion_completa": "Un café acogedor con excelente ambiente",
  "descripcion_corta": "Café moderno y acogedor",
  "direccion_completa": "Av. Principal 456",
  "latitud": -2.1456789,
  "longitud": -79.8765432,
  "categoria_id": 5,
  "distrito_id": 3,
  "es_zona_centrica": true,
  "es_zona_afueras": false
}
```

**Validaciones:**
- `nombre`: Requerido, 2-200 caracteres
- `latitud`: Requerido, -90 a 90
- `longitud`: Requerido, -180 a 180
- `descripcion_completa`: Máximo 2000 caracteres (opcional)
- `descripcion_corta`: Máximo 200 caracteres (opcional)
- `direccion_completa`: Máximo 300 caracteres (opcional)

**Response (201):**
```json
{
  "status": "success",
  "message": "Lugar creado exitosamente. Pendiente de aprobación.",
  "data": {
    "lugar": {
      "id": 2,
      "nombre": "Nuevo Café Moderno",
      "estado": "pendiente",
      ...
    }
  }
}
```

---

#### PUT /api/lugares/:id
Actualizar un lugar (requiere autenticación y ser el creador)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "nombre": "Café Moderno Actualizado",
  "descripcion_completa": "Nueva descripción",
  "latitud": -2.1456789,
  "longitud": -79.8765432
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Lugar actualizado exitosamente",
  "data": {
    "lugar": { ... }
  }
}
```

---

#### DELETE /api/lugares/:id
Eliminar un lugar (requiere autenticación y ser el creador)

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Lugar eliminado exitosamente"
}
```

---

## Códigos de Estado HTTP

- `200 OK`: Solicitud exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Error en la solicitud (validación)
- `401 Unauthorized`: No autenticado o token inválido
- `403 Forbidden`: No autorizado (sin permisos)
- `404 Not Found`: Recurso no encontrado
- `422 Unprocessable Entity`: Error de validación
- `429 Too Many Requests`: Demasiadas solicitudes (rate limit)
- `500 Internal Server Error`: Error del servidor

---

## Formato de Respuestas de Error

```json
{
  "status": "fail",
  "message": "Mensaje de error descriptivo",
  "errors": {
    "campo1": "Error específico del campo",
    "campo2": "Error específico del campo"
  }
}
```

**Ejemplo de error de validación:**
```json
{
  "status": "fail",
  "message": "Error de validación",
  "errors": {
    "email": "Por favor proporciona un email válido",
    "password": "La contraseña debe tener al menos 8 caracteres"
  }
}
```

---

## Rate Limiting

### Límites Generales
- **Ventana**: 15 minutos
- **Máximo**: 100 peticiones

### Límites de Autenticación
- **Ventana**: 15 minutos
- **Máximo**: 5 peticiones (para login/register)

Cuando se excede el límite, se recibe:
```json
{
  "status": "error",
  "message": "Demasiadas peticiones, por favor intenta más tarde"
}
```

---

## Notas Importantes

1. **Tokens JWT**: Los tokens de acceso expiran en 7 días (desarrollo). En producción se recomienda 15 minutos a 1 hora.

2. **Refresh Tokens**: Los refresh tokens expiran en 30 días y deben usarse para obtener nuevos access tokens.

3. **Paginación**: Por defecto se devuelven 20 items por página. Máximo 100 items por página.

4. **Coordenadas**: Las coordenadas deben estar en formato decimal (ej: -2.1234567, -79.8765432).

5. **Seguridad**:
   - Todas las contraseñas son hasheadas con bcrypt (12 salt rounds)
   - Los tokens JWT están firmados con secretos seguros
   - Validación estricta en todos los endpoints
   - Rate limiting para prevenir abusos

6. **CORS**: Configurado para aceptar peticiones de cualquier origen en desarrollo. Cambiar en producción.

---

**Fecha de Documentación**: 8 de diciembre de 2025
**Versión de API**: 2.0.0
**Backend**: Node.js + Express + MySQL2
