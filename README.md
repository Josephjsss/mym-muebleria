# M&M Mueblería y Taller en Melamine — Web (Avance 2)

Catálogo web de M&M Mueblería (Quilmaná, Cañete) con productos cargados desde
base de datos, login y panel de administración (CRUD).

**Tecnologías:** Next.js 16 (React 19, TypeScript) · Tailwind CSS 4 · shadcn/ui ·
Supabase (PostgreSQL + Auth + Storage).

## Páginas

| Ruta | Qué hace |
|---|---|
| `/` | Inicio: menú, logo, slider de 5 imágenes, destacados desde la BD y enlaces a productos |
| `/productos` | Catálogo completo desde la BD con **búsqueda dinámica** y filtro por categoría |
| `/productos/[id]` | Detalle de cada producto o servicio |
| `/admin` | Panel del administrador: **CRUD** (registrar, ver, editar, eliminar) con imágenes, **búsqueda estática** y **búsqueda dinámica** |

## Puesta en marcha

### 1. Crear la base de datos en Supabase
1. Crear un proyecto en <https://supabase.com>.
2. **Authentication → Users → Add user → Create new user**
   - correo: `admin@mymmuebleria.pe` · contraseña: la que elijan · marcar **Auto Confirm User**.
3. **SQL Editor → New query** → pegar todo `supabase/mym_avance2.sql` → **Run**.
   Crea las tablas `usuarios`, `categorias` y `productos`, la seguridad (RLS), el
   bucket de imágenes `productos`, carga los 26 productos/servicios y le da el rol
   `admin` al usuario del paso 2.
4. (Opcional) **Authentication → Sign In / Providers → Email**: desactivar
   *Confirm email* para que los clientes que se registren entren sin confirmar el correo.

### 2. Conectar la web
```bash
cp .env.local.example .env.local
# Pegar en .env.local los datos de Project Settings → API:
#   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
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
- Las contraseñas no se guardan en `usuarios`: las cifra Supabase Auth (`auth.users`);
  `usuarios.auth_id` enlaza ambas tablas y `usuarios.rol` define los permisos.
- Seguridad: cualquiera puede **ver** el catálogo; solo el rol `admin` puede
  crear, editar o eliminar (lo exige la propia base de datos con RLS).

## Búsquedas

| | Dónde | Cómo funciona |
|---|---|---|
| **Estática** | `/admin` | Se elige campo + texto y se pulsa **Buscar**. El formulario se envía (GET `?campo=marca&q=vesto`) y el **servidor** consulta la BD y devuelve la página filtrada. |
| **Dinámica** | `/productos` y `/admin` | Mientras se escribe (sin botón ni recarga) el navegador consulta la BD (`ILIKE`) y repinta la lista al instante. |

## Estructura

```
src/
  app/
    page.tsx                 Inicio
    productos/page.tsx       Catálogo (búsqueda dinámica)
    productos/[id]/page.tsx  Detalle
    admin/page.tsx           Panel admin (búsqueda estática en el servidor)
    admin/actions.ts         Crear / editar / eliminar (Server Actions)
  components/
    site/                    Navbar, hero, catálogo, tarjetas, login…
    admin/                   Tabla CRUD y formulario con subida de imagen
  lib/
    supabase/                Clientes de Supabase (navegador, servidor, proxy)
    auth.ts                  Usuario actual y su rol
    types.ts                 Tipos de las tablas
  proxy.ts                   Refresca la sesión y protege /admin
supabase/mym_avance2.sql     Script completo de la base de datos
```
