# 🏛️ MUIC - Backend API (Sistema de Gestión de Accesos)

Backend del Sistema de Gestión de Accesos para el Museo Interactivo de Ciencias (MUIC), desarrollado como parte del Trabajo Práctico 4 de la materia Comunicación de Datos (UTN FRSFCO).

Expone una API REST para administrar integrantes, proyectos, eventos, plantillas horarias, niveles de acceso (permisos), recursos/items de inventario y registros de asistencia/acceso.

## 🛠️ Tecnologías Utilizadas

* **Entorno:** Node.js
* **Framework:** Express.js
* **Base de Datos:** SQLite
* **ORM:** Sequelize
* **Autenticación:** JWT (JSON Web Tokens) y bcryptjs
* **Validaciones:** express-validator

## ⚙️ Instalación y Configuración Local

1. **Clonar el repositorio y entrar a la carpeta:**
   ```bash
   git clone <url-de-tu-repo>
   cd backend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**

   Creá un archivo `.env` en la raíz del proyecto con el siguiente contenido (ver `.env.example`):

   ```env
   # Clave secreta para firmar los tokens JWT (cambiar en producción)
   JWT_SECRET=una_clave_larga_y_secreta

   # Entorno de ejecución (development, production o test)
   NODE_ENV=development
   ```

   > En `NODE_ENV=test` la base de datos SQLite se levanta en memoria (`:memory:`); en cualquier otro caso se persiste en `database.sqlite` en la raíz del proyecto.

4. **Iniciar el servidor:**
   ```bash
   npm run dev
   ```

   El servidor estará corriendo en `http://localhost:3000` (puerto fijo, definido en `app.js`).

   Al arrancar, `app.js` sincroniza la base de datos, activa el cron de generación de eventos a partir de plantillas (`iniciarCronEventos`) y crea datos de prueba si no existen: un usuario administrador (`admin@museo.com`), un integrante, un evento, un registro y una plantilla de ejemplo.

## 🗂️ Modelo de Datos

Entidades principales y sus relaciones (definidas en `models/index.js`):

| Entidad | Relación | Detalle |
|---|---|---|
| Integrante ↔ Proyecto | N:M | tabla intermedia `IntegranteProyecto` |
| Integrante ↔ Permiso | N:M | tabla intermedia `IntegrantePermiso` |
| Integrante → Registro | 1:N | un integrante tiene muchos registros de acceso |
| Evento → Registro | 1:N | un evento tiene muchos registros de asistencia |
| Plantilla → Evento | 1:N | una plantilla horaria genera muchos eventos |
| Recurso → Item | 1:N | un recurso agrupa varios items |
| Proyecto → Item | 1:N | un proyecto puede tener items asociados |

Campos principales por modelo (según validadores y modelos revisados):

* **Integrante**: `id`, `nombre`, `legajo` (único), `token`, `carrera`, `esActivo`
* **Proyecto**: `id`, `nombre`, `descripcion`, `fechaInicio`, `fechaFin`, `estado`
* **Evento**: `id`, `nombre`, `descripcion`, `tipo`, `fechaInicio`, `fechaFin`, `plantillaId`
* **Plantilla**: `id`, `nombre`, `descripcion`, `tipo`, `diaSemana` (0-6), `horaInicio`, `horaFin`, `frecuencia` (`semanal`/`quincenal`/`mensual`), `activo`
* **Permiso**: `id`, `descripcion`, `diasSemana` (array), `horaInicio`, `horaFin`
* **Recurso**: `id`, `nombre`, `descripcion`, `categoria`, `stock`
* **Item**: `id`, `recursoId`, `cantidad`, `estado`
* **Registro**: `id`, `integranteId`, `eventoId`, `tokenLeido`, `fecha`, `esAsistencia`, `esApertura`, `mensajeError`
* **Usuario**: `email`, `password` (hasheado con bcrypt), usado para autenticación


## 🔐 Autenticación

* `POST /api/auth/login` recibe `email` y `password`, valida contra el modelo `Usuario` y devuelve un JWT firmado con `JWT_SECRET`, válido por 8 horas.
* El token debe enviarse en cada request protegida como header `Authorization: Bearer <token>`.
* `middlewares/auth.js` verifica el token: si falta, responde 401; si es inválido o expiró, responde 400.
* **Todas las rutas están protegidas excepto `/api/auth`**, que es pública (es la que emite el token). El middleware se aplica de forma global por recurso en `app.js`:

  ```js
  app.use('/api/auth', authRouter);                              // pública
  app.use('/api/integrantes', authMiddleware, integrantesRouter); // protegida
  app.use('/api/recursos', authMiddleware, recursosRouter);       // protegida
  app.use('/api/registros', authMiddleware, registroRouter);      // protegida
  app.use('/api/items', authMiddleware, itemsRouter);             // protegida
  app.use('/api/eventos', authMiddleware, eventosRouter);         // protegida
  app.use('/api/plantillas', authMiddleware, plantillasRouter);   // protegida
  app.use('/api/permisos', authMiddleware, permisosRouter);       // protegida
  app.use('/api/proyectos', authMiddleware, proyectosRouter);     // protegida
  ```

* Usuario administrador semilla (se crea automáticamente al levantar el servidor si no existe): `admin@museo.com` / `passwordSegura123`.

## 📌 Endpoints

Prefijo base: `/api` (montado en `app.js`). Todas las rutas listadas abajo requieren el header `Authorization: Bearer <token>`, excepto las de `/api/auth`.

### Auth — `/api/auth`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/login` | Autentica un usuario por `email` y `password` y devuelve un JWT |

### Integrantes — `/api/integrantes`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista integrantes paginada. Filtros opcionales: `nombre` (like), `carrera` |
| GET | `/:id` | Obtiene un integrante por ID |
| GET | `/:id/proyectos` | Lista los proyectos asignados a un integrante |
| POST | `/:id/proyectos` | Asigna un proyecto al integrante (body: `{ proyectoId }`) |
| DELETE | `/:id/proyectos/:proyectoId` | Desvincula al integrante de un proyecto |
| GET | `/:id/permisos` | Lista los niveles de acceso (permisos) del integrante |
| POST | `/:id/permisos` | Asigna un permiso al integrante (body: `{ permisoId }`) |
| DELETE | `/:id/permisos/:permisoId` | Revoca un permiso del integrante |
| GET | `/:id/registros` | Historial paginado de registros de acceso del integrante |
| POST | `/` | Crea un integrante (`nombre`, `legajo` obligatorios; `token`, `carrera`, `esActivo` opcionales) |
| PUT | `/:id` | Actualiza un integrante |
| DELETE | `/:id` | Elimina un integrante (falla con 409 si tiene proyectos o registros asociados) |
| PATCH | `/:id/toggle` | Activa/desactiva un integrante (invierte `esActivo`) |

### Proyectos — `/api/proyectos`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista proyectos paginada. Filtros opcionales: `nombre` (like), `estado` |
| GET | `/:id` | Obtiene un proyecto por ID |
| GET | `/:id/integrantes` | Lista los integrantes asignados a un proyecto (`id`, `nombre`, `legajo`, `carrera`) |
| POST | `/` | Crea un proyecto (`nombre` y `estado` obligatorios; `descripcion`, `fechaInicio`, `fechaFin` opcionales) |
| PUT | `/:id` | Actualiza un proyecto |
| DELETE | `/:id` | Elimina un proyecto |

> La asignación/desvinculación de integrantes a un proyecto se hace desde el recurso **Integrantes** (`POST /api/integrantes/:id/proyectos`), no desde `/api/proyectos`.

### Eventos — `/api/eventos`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista eventos. Filtros opcionales por rango de fecha: `fechaInicio`, `fechaFin` |
| GET | `/hoy` | Lista los eventos cuya `fechaInicio` cae dentro del día actual |
| GET | `/:id` | Obtiene un evento por ID |
| GET | `/:id/registros` | Historial paginado de registros de asistencia del evento |
| POST | `/` | Crea un evento (`nombre`, `fechaInicio`, `fechaFin` obligatorios; `descripcion`, `tipo`, `plantillaId` opcionales; `fechaFin` debe ser posterior a `fechaInicio`) |
| PUT | `/:id` | Actualiza un evento |
| DELETE | `/:id` | Elimina un evento (falla con 409 si tiene registros asociados) |

### Plantillas de horario — `/api/plantillas`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista todas las plantillas, ordenadas por día y hora |
| GET | `/:id` | Obtiene una plantilla por ID |
| GET | `/:id/eventos` | Lista los eventos generados a partir de una plantilla |
| POST | `/` | Crea una plantilla (`nombre`, `diaSemana` 0-6, `horaInicio`, `horaFin`, `frecuencia` obligatorios) |
| PUT | `/:id` | Actualiza una plantilla |
| PATCH | `/:id/toggle` | Activa/desactiva una plantilla (invierte `activo`) |
| DELETE | `/:id` | Elimina una plantilla (falla con 409 si tiene eventos asociados) |

### Permisos (niveles de acceso) — `/api/permisos`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista niveles de acceso paginada. Filtro opcional: `diaSemana` |
| GET | `/:id` | Obtiene un nivel de acceso por ID |
| GET | `/:id/integrantes` | Lista los integrantes que tienen asignado ese nivel de acceso |
| POST | `/` | Crea un nivel de acceso (`descripcion`, `diasSemana` (array), `horaInicio`, `horaFin` obligatorios, formato `HH:mm`) |
| PUT | `/:id` | Actualiza un nivel de acceso |
| DELETE | `/:id` | Elimina un nivel de acceso |

> La asignación/revocación de permisos a integrantes se hace desde el recurso **Integrantes** (`POST /api/integrantes/:id/permisos`), no desde `/api/permisos`.

### Recursos — `/api/recursos`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista recursos de inventario paginada. Filtros opcionales: `nombre` (like), `categoria` |
| GET | `/:id` | Obtiene un recurso por ID |
| POST | `/` | Crea un recurso (`nombre`, `descripcion`, `categoria`, `stock` obligatorios) |
| PUT | `/:id` | Actualiza un recurso |
| DELETE | `/:id` | Elimina un recurso |

### Items — `/api/items`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista items. Filtro opcional: `estado` |
| GET | `/recursos/:recursoId` | Lista los items pertenecientes a un recurso |
| GET | `/:id` | Obtiene un item por ID, incluyendo su recurso asociado |
| POST | `/` | Crea un item (`recursoId`, `cantidad`, `estado` obligatorios; el `recursoId` debe existir) |
| PUT | `/:id` | Actualiza un item |
| DELETE | `/:id` | Elimina un item |

### Registros — `/api/registros`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista registros paginada. Filtros opcionales: `fechaInicio`, `fechaFin`, `esApertura`, `esAsistencia`. Incluye el integrante asociado |
| GET | `/:id` | Obtiene un registro por ID, incluyendo su integrante asociado |
| POST | `/` | Crea un registro de acceso/asistencia (`tokenLeido`, `fecha` obligatorios; `integranteId`, `eventoId`, `esAsistencia`, `esApertura` opcionales). Pensado para ser consumido por el lector físico (escaner) |
| DELETE | `/:id` | Elimina un registro |

## 📁 Estructura del Proyecto

```
backend/
├── constants/          # Listas de valores válidos (estados, carreras, tipos de evento, etc.)
├── middlewares/         # Middlewares de Express (ej. auth.js: verificación de JWT)
├── models/              # Definiciones de modelos Sequelize y asociaciones (index.js)
├── routes/               # Routers de Express por recurso
├── services/             # Lógica de negocio auxiliar (ej. cronService.js: generación de eventos)
├── utils/                 # Utilidades compartidas (paginacion.js)
├── database.sqlite    # Base de datos SQLite (se genera automáticamente)
└── .env                  # Variables de entorno (no versionado)
```

## 📄 Formato de Respuestas

Los endpoints de listado paginado (`getAllX`) devuelven un objeto con la forma exacta que arma `formatearDatosPaginados` (`utils/paginacion.js`):

```json
{
  "totalElementos": 42,
  "totalPaginas": 5,
  "paginaActual": 1,
  "<recurso>": [ /* array de resultados */ ]
}
```

(la clave del array varía según el recurso: `proyectos`, `integrantes`, `permisos`, `recursos`, `registros`, `historial`).

La paginación acepta `pagina` (o `page`) y `limite` (o `limit`) como query params; por defecto `pagina=1` y `limite=10`.

> ⚠️ **Dos endpoints no siguen este formato plano** — devuelven la respuesta paginada **anidada** bajo una subclave, en vez de en el nivel superior:
> - `GET /api/eventos/:id/registros` → `{ evento, registrosPaginados: { totalElementos, totalPaginas, paginaActual, registros } }`
> - `GET /api/integrantes/:id/registros` → `{ integrante, registrosPaginados: { totalElementos, totalPaginas, paginaActual, historial } }`
>
> No es un error a corregir, es simplemente cómo se implementaron esos dos endpoints — pero el frontend que los consuma tiene que leer `data.registrosPaginados` en vez de `data` directamente.

Los errores de validación (400) devuelven:

```json
{
  "errors": [ { "msg": "Mensaje de error", "path": "campo", "..." } ]
}
```
