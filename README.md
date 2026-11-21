# M&M Mueblería y Taller en Melamine — Web (entrega final)

Sistema web para M&M Mueblería (Quilmaná, Cañete): catálogo de productos y
servicios cargado desde base de datos, **ofertas**, **carrito de compras con
boleta**, login con roles, panel de administración (CRUD y **6 reportes con
gráficos** descargables en Word, Excel y PDF), la página **Nosotros** y la página
**Contacto**.

Proyecto del curso **Herramientas de Desarrollo** — Ingeniería de Sistemas e
Informática, Universidad Tecnológica del Perú (UTP).

**Tecnologías:** Next.js 16 (React 19, TypeScript) · Tailwind CSS 4 · shadcn/ui ·
Supabase (PostgreSQL + Auth + Storage) · Recharts (gráficos) · docx, ExcelJS y
jsPDF (informes) · Git y GitHub.

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
| `/productos` | Catálogo con slider de 4 banners, sección **Ofertas**, **búsqueda dinámica** y filtro por categoría |
| `/productos/[id]` | Detalle con precio de oferta, stock, **Agregar al carrito** y botón de WhatsApp |
| `/carrito` | **Carrito de compras**: cantidades, descuentos, IGV y pago (requiere iniciar sesión) |
| `/pedidos` · `/pedidos/[id]` | Mis pedidos y la **boleta** de cada compra (imprimir o descargar en PDF) |
| `/contacto` | Slider, formulario de contacto, mapa de la tienda y opiniones de clientes |
| `/nosotros` | Slider de 3 imágenes, mapa organizacional, la empresa (jefe, contacto, finalidad y agradecimiento), desarrolladores con su C.V. y botón al PDF, y metodología Scrum |
| `/admin` | Panel del administrador: **CRUD** con imágenes, **búsqueda estática** y **dinámica**, y pestañas **Activos / Desactivados** |
| `/admin/reportes` | **Sistema interno:** 6 reportes con gráfico estadístico, descripción del resultado y **descarga del informe en Word, Excel y PDF** |

## Novedades de la entrega final

- **Ofertas:** cada producto puede tener un % de descuento (mínimo **5 %**, lo
  exige la BD con un `CHECK`). Se muestra el precio tachado, el precio final y la
  etiqueta *Oferta*; el admin lo define en el formulario del CRUD.
- **Stock:** unidades disponibles por producto; con 0 aparece *Agotado*.
- **Carrito de compras** guardado en el navegador. Los precios y el stock se
  vuelven a leer de la BD antes de pagar.
- **Compra segura:** la función `registrar_compra()` de la BD calcula precios y
  descuentos, descuenta el stock y crea el pedido en **una sola transacción**,
  bloqueando cada producto (`SELECT … FOR UPDATE`): dos clientes no pueden
  comprar la misma última unidad.
- **Boleta** de venta (serie `B001-000001`) con subtotal, descuentos, op.
  gravada, IGV 18 % y total; se imprime o descarga en PDF.
- **Reportes** (`/admin/reportes`), filtrables por 3, 6 o 12 meses:
  1. Ventas por mes · 2. Productos más vendidos · 3. Ventas por categoría ·
  4. Pedidos por día de la semana · 5. Ahorro por ofertas · 6. Productos con menor stock.
  Cada uno tiene su gráfico, una **descripción del resultado** redactada a partir
  de los datos y su tabla. El botón **Descargar informe** genera el documento en
  **Word (.docx)**, **Excel (.xlsx)** o **PDF** con los gráficos incluidos.
- **Contacto:** formulario que guarda los mensajes en la BD, mapa de Google
  Maps y opiniones de clientes.

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
5. **Entrega final:** ejecutar `supabase/final_ofertas_compras.sql` (ofertas,
   stock, pedidos y la función de compra) y `supabase/final_contacto.sql`
   (mensajes de contacto y opiniones).
6. *(Opcional, para la presentación)* `supabase/final_datos_demo.sql` crea ~80
   ventas de demostración de los últimos 6 meses para que los reportes tengan
   datos. Quedan marcadas como `es_demo` y se borran con
   `delete from pedidos where es_demo;`.

> Si se vuelve a ejecutar `mym_avance2.sql` (que recrea todo desde cero), hay que
> ejecutar de nuevo los scripts de los pasos 4 y 5.

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
usuarios (1) ──compra────< (N) pedidos (1) ──< (N) pedido_items >── (1) productos
mensajes_contacto · opiniones   (formularios de la página Contacto)
```

- **ID**: entero autoincrementable, uso interno (empieza en 1).
- **Código**: texto visible para el cliente (`PRD-001`, `SRV-001`, `CAT-01`).
- **activo** (BOOLEAN): `false` = producto desactivado (eliminación lógica).
- **descuento** (%): `0` = sin oferta; con oferta, entre 5 y 90. **stock**: unidades a la venta.
- **pedido_items** guarda una copia del nombre, la categoría y los precios del
  momento de la compra: si luego cambia el producto, la boleta no cambia.
- Las contraseñas no se guardan en `usuarios`: las cifra Supabase Auth (`auth.users`);
  `usuarios.auth_id` enlaza ambas tablas y `usuarios.rol` define los permisos.
- Seguridad: el público solo ve productos activos; solo el rol `admin` puede
  crear, editar, desactivar o eliminar (RLS en la base de datos).
- Pedidos: cada cliente ve solo los suyos y el admin ve todos (RLS). Nadie puede
  insertar pedidos directamente; solo mediante `registrar_compra()`.

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
| 4 | Entrega final | Ofertas, carrito y boleta, página Contacto, reportes con gráficos y exportación |

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
    admin/reportes/page.tsx  6 reportes con gráficos y descarga Word/Excel/PDF
    carrito/                 Carrito y acción de pagar (llama a registrar_compra)
    pedidos/                 Mis pedidos y boleta
    contacto/                Página Contacto
  components/
    site/                    Navbar, hero, catálogo, tarjetas, login…
    nosotros/                Slider, organigrama, empresa, desarrolladores, metodología
    admin/                   Tabla CRUD, formulario, reportes y gráficos
    tienda/                  Carrito y boleta
    contacto/                Slider, formulario, mapa y opiniones
  data/                      Datos de la empresa, el equipo, los C.V. y la metodología
  lib/
    supabase/                Clientes de Supabase (navegador, servidor, proxy)
    auth.ts                  Usuario actual y su rol
    types.ts                 Tipos de las tablas, precio con oferta, IGV
    carrito.ts               Carrito (localStorage)
    reportes.ts              Cálculo de los 6 reportes y su descripción
    exportar-reportes.ts     Informe en Word (docx), Excel (exceljs) y PDF (jsPDF)
    boleta-pdf.ts            Boleta en PDF
  proxy.ts                   Refresca la sesión y protege /admin
public/
  cv/                        C.V. completos en PDF
  images/equipo/             Fotos del equipo
supabase/
  mym_avance2.sql            Script completo de la base de datos
  avance3_activar_productos.sql   Columna activo (eliminación lógica)
  final_ofertas_compras.sql       Ofertas, stock, pedidos, boletas y compra segura
  final_contacto.sql              Mensajes de contacto y opiniones de clientes
  final_datos_demo.sql            (Opcional) ventas de demostración para los reportes
```
