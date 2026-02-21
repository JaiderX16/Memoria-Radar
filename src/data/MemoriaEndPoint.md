
### 14. Crear Nuevo Lugar

- **Método:** `POST`
- **URL:** `{{base_url}}/lugares`
- **Headers:**

  ```
  Content-Type: application/json
  Authorization: Bearer {{token}}
  ```

- **Body (raw JSON):**

  ```json
  {
    "nombre": "Restaurante El Sabor",
    "distrito_id": 1,
    "categoria_id": 5,
    "descripcion_corta": "El mejor restaurante de comida ecuatoriana",
    "descripcion_completa": "Restaurante especializado en comida ecuatoriana con más de 20 años de experiencia...",
    "direccion_completa": "Av. Principal 123, esquina",
    "latitud": -0.1807,
    "longitud": -78.4678,
    "es_zona_centrica": 1,
    "es_zona_afueras": 0
  }
  ```

- **Respuesta esperada:** 201 Created

  ```json
  {
    "success": true,
    "message": "Lugar creado exitosamente. Está pendiente de aprobación.",
    "data": {
      "lugar": {
        "id": "1",
        "nombre": "Restaurante El Sabor"
      }
    }
  }
  ```



## 4. Lugares (Spots)
**Base Path:** `/api/lugares`

### GET `/:id`
- **Descripción:** Perfil detallado de un Spot.
- **Mejoras (Contexto Social):**
    - `es_guardado`: Booleano indicando si el usuario lo tiene en favoritos.
    - `mi_resena`: Datos de la calificación previa del usuario (si existe).
    - `resumen_calificaciones`: Desglose de estrellas (1-5).
    - `eventos_proximos`: Lista de eventos que ocurrirán próximamente en este lugar.

### GET `/tags`
- **Descripción:** Obtiene etiquetas del sistema.
- **Mejora:** Parámetro `tipo` para filtrar por etiquetas de `lugar` o `evento`.

---

## 3. Eventos (Events)
**Base Path:** `/api/eventos`

### GET `/`
- **Descripción:** Listado de eventos.
- **Novedades:**
    - **Búsqueda Geográfica:** Envía `lat`, `lng` y `radius` para buscar eventos cercanos.
    - **Tags dinámicos:** Filtra por `tag` (IDs de etiquetas como Fiesta, Rave, etc.).
    - **Cuenta Regresiva:** La respuesta incluye un objeto `cuenta_regresiva` calculado.
- **Query Params:** `categoria`, `tag`, `ciudad`, `search`, `fecha_inicio`.

### POST `/`
- **Descripción:** Registro de eventos.
- **Novedades:**
    - Registro de **Ubicación opcional** (sin error de SQL).
    - Soporte para **Precio**, **Capacidad** y **Notificaciones Push**.
    - Carga de **Video Promocional** (archivo o enlace).
    - Guardado dinámico de **Etiquetas de Evento**.

---




## 3. Lugares (`/api/lugares`)
Gestión de lugares turísticos, spots y sitios de interés.

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/` | Lista lugares con filtros, búsqueda y paginación. | Opcional |
| `POST` | `/` | Crea un nuevo lugar (permite subir imágenes y reportar spot). | Sí |
| `GET` | `/tags` | Obtiene lista de etiquetas disponibles para lugares. | No |
| `GET` | `/nearby` | Busca lugares cercanos a una coordenada (lat/lng). | Opcional |
| `GET` | `/:id` | Obtiene detalles completos de un lugar específico. | Opcional |

## 4. Eventos (`/api/eventos`)
Gestión de eventos, fiestas y reuniones.

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/` | Lista eventos (próximos, pasados, búsqueda). | Opcional |
| `POST` | `/` | Crea un nuevo evento con multimedia. | Sí |
| `GET` | `/:id` | Detalle de evento (incluye cuenta regresiva y asistentes). | Opcional |
| `POST` | `/:id/asistir` | Marcar o desmarcar asistencia a un evento. | Sí |






