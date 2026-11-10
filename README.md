# M&M Mueblería y Taller en Melamine — Web (Avance 3 y entrega final)

Sistema web para M&M Mueblería (Quilmaná, Cañete): catálogo de productos y
servicios cargado desde base de datos, login con roles, panel de administración
(CRUD) y la página **Nosotros** con el equipo, la empresa, los desarrolladores y
la metodología de trabajo.

Proyecto del curso **Herramientas de Desarrollo** — Ingeniería de Sistemas e
Informática, Universidad Tecnológica del Perú (UTP).

**Tecnologías:** Next.js 16 (React 19, TypeScript) · Tailwind CSS 4 · shadcn/ui ·
Supabase (PostgreSQL + Auth + Storage) · Git y GitHub.

## Equipo

| Integrante | Rol | Rama |
|---|---|---|
| Juan Pablo Castillo Sullón | Coordinador · Frontend y diseño | `juan-pablo` |
| Joseph Salinas Pérez | Backend y base de datos | `joseph` |

Cada integrante trabaja en su rama y el coordinador une los avances a `main`
con Pull Requests.

## Páginas

| Ruta | Qué hace |
|---|---|
| `/` | Inicio: menú, slider de 5 imágenes, categorías, nosotros, destacados desde la BD, testimonios, aliados y footer |
| `/productos` | Catálogo con slider de 4 banners, **búsqueda dinámica** y filtro por categoría |
| `/productos/[id]` | Detalle de cada producto o servicio, con botón de WhatsApp |
| `/nosotros` | Slider de 3 imágenes, mapa organizacional, la empresa (jefe, contacto, finalidad y agradecimiento), desarrolladores con su C.V. y botón al PDF, y metodología Scrum |
| `/admin` | Panel del administrador: **CRUD** con imágenes, **búsqueda estática** y **dinámica**, y pestañas **Activos / Desactivados** |

## Novedades del Avance 3

- **Página Nosotros** con el equipo del proyecto, la empresa y los C.V. en PDF (`public/cv/`).
- **Eliminación lógica:** al eliminar, el producto no se borra; pasa a
  *Desactivados* y se puede **reactivar**. Desde esa pestaña también se puede
  eliminar definitivamente.
- La web pública solo muestra productos **activos** (también lo exige la base de
  datos con una política RLS).
- Metodología **Scrum**: un sprint por cada avance del curso.

## Puesta en marcha

### 1. Base de datos en Supabase
1. Crear un proyecto en <https://supabase.com>.
2. **Authentication → Users → Add user → Create new user**
   - correo: `admin@mymmuebleria.pe` · contraseña: la que elijan · marcar **Auto Confirm User**.
3. **SQL Editor → New query** → pegar `supabase/mym_avance2.sql` → **Run**.
   Crea las tablas, la seguridad (RLS), el bucket de imágenes, carga los 26
   productos/servicios y da el rol `admin` al usuario del paso 2.
4. Si la base de datos se creó antes del Avance 3, ejecutar también
   `supabase/avance3_activar_productos.sql` (agrega la columna `activo`).

### 2. Conectar la web
```bash
cp .env.local.example .env.local
# Pegar en .env.local los datos de Project Settings → API:
#   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
npm install
npm run dev
```
Abrir <http://localhost:3000>. Para entrar al panel: **Ingresar** con el correo del admin.

## Base de datos

```
usuarios (1) ──registra──< (N) productos >──pertenece── (1) categorias
```

- **ID**: entero autoincrementable, uso interno (empieza en 1).
- **Código**: texto visible para el cliente (`PRD-001`, `SRV-001`, `CAT-01`).
- **activo** (BOOLEAN): `false` = producto desactivado (eliminación lógica).
- Las contraseñas no se guardan en `usuarios`: las cifra Supabase Auth (`auth.users`);
  `usuarios.auth_id` enlaza ambas tablas y `usuarios.rol` define los permisos.
- Seguridad: el público solo ve productos activos; solo el rol `admin` puede
  crear, editar, desactivar o eliminar (RLS en la base de datos).

## Búsquedas

| | Dónde | Cómo funciona |
|---|---|---|
| **Estática** | `/admin` | Se elige campo + texto y se pulsa **Buscar**. El formulario se envía (GET `?campo=marca&q=vesto`) y el **servidor** consulta la BD y devuelve la página filtrada. |
| **Dinámica** | `/productos` y `/admin` | Mientras se escribe (sin botón ni recarga) el navegador consulta la BD (`ILIKE`) y repinta la lista al instante. |

## Metodología: Scrum

| Sprint | Avance | Contenido |
|---|---|---|
| 1 | Avance 1 | Entrevista a la empresa, misión, visión, mapa del sitio y wireframes |
| 2 | Avance 2 | Base de datos, catálogo, login con roles y CRUD con búsquedas |
| 3 | Avance 3 | Página Nosotros, C.V. de los desarrolladores y eliminación lógica |
| 4 | Entrega final | Mejoras, pruebas y presentación |

## Estructura

```
src/
  app/
    page.tsx                 Inicio
    productos/page.tsx       Catálogo (búsqueda dinámica)
    productos/[id]/page.tsx  Detalle
    nosotros/page.tsx        Página Nosotros
    admin/page.tsx           Panel admin (búsqueda estática en el servidor)
    admin/actions.ts         Crear, editar, desactivar, reactivar y eliminar
  components/
    site/                    Navbar, hero, catálogo, tarjetas, login…
    nosotros/                Slider, organigrama, empresa, desarrolladores, metodología
    admin/                   Tabla CRUD y formulario con subida de imagen
  data/                      Datos de la empresa, el equipo, los C.V. y la metodología
  lib/
    supabase/                Clientes de Supabase (navegador, servidor, proxy)
    auth.ts                  Usuario actual y su rol
    types.ts                 Tipos de las tablas
  proxy.ts                   Refresca la sesión y protege /admin
public/
  cv/                        C.V. completos en PDF
  images/equipo/             Fotos del equipo
supabase/
  mym_avance2.sql            Script completo de la base de datos
  avance3_activar_productos.sql   Columna activo (eliminación lógica)
```
