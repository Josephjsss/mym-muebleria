# M&M Mueblería y Taller en Melamine — Proyecto web (Entrega final)

Sistema web para **M&M Mueblería** (Quilmaná, Cañete): sitio público con catálogo
y ofertas, **tienda en línea con carrito y boleta**, página de **Contacto** y un
**sistema interno** para el administrador con CRUD de productos y **6 reportes
con gráficos** descargables en Word, Excel y PDF.

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

## Requisitos de la entrega final

| Requisito | Dónde | Responsable |
|---|---|---|
| **Contactos:** menú, slider de 3 a 6 imágenes, formulario, mapa del sitio / sucursal, opiniones de clientes y footer | `/contacto` | Juan Pablo |
| **Productos – Ofertas** con descuento de **5 % como mínimo** | `/productos` (sección Ofertas) y CRUD del admin | Joseph |
| **Carrito de compras → boleta o comprobante** | `/carrito`, `/pedidos/[id]` | Joseph |
| **Sistema interno (administrador) – 6 reportes** con gráficos estadísticos | `/admin/reportes` | Joseph |
| **Descripción del resultado** de cada reporte | Debajo de cada gráfico | Joseph |
| **Descarga del informe** en **Word, Excel y PDF** | Botones de `/admin/reportes` | Joseph |

## Páginas

| Ruta | Qué hace |
|---|---|
| `/` | Inicio: menú, slider de 5 imágenes, categorías, nosotros, destacados desde la BD, testimonios, aliados y footer |
| `/productos` | Catálogo con slider de 4 banners, sección **Ofertas**, **búsqueda dinámica** y filtro por categoría |
| `/productos/[id]` | Detalle con precio de oferta, stock, **Agregar al carrito** y botón de WhatsApp |
| `/carrito` | **Carrito de compras**: cantidades, descuentos, IGV y pago (requiere iniciar sesión) |
| `/pedidos` · `/pedidos/[id]` | Mis pedidos y la **boleta** de cada compra (imprimir o descargar en PDF) |
| `/contacto` | Slider, formulario de contacto, mapa de la tienda y opiniones de clientes |
| `/nosotros` | Slider, mapa organizacional, la empresa, desarrolladores con su C.V. en PDF y metodología Scrum |
| `/admin` | Sistema interno: **CRUD** con imágenes, ofertas y stock, **búsqueda estática** y **dinámica**, pestañas **Activos / Desactivados** |
| `/admin/reportes` | Sistema interno: **6 reportes** con gráfico, descripción del resultado y **descarga en Word, Excel y PDF** |

## Funcionalidades

### Tienda en línea
- **Ofertas:** cada producto puede tener un % de descuento; si hay oferta, es de
  **5 % como mínimo** (lo exige la BD con un `CHECK`). Se muestra el precio
  tachado, el precio final y la etiqueta *Oferta*. El admin lo define en el CRUD.
- **Stock** por producto; con 0 unidades aparece *Agotado* y no se puede comprar.
- **Carrito** guardado en el navegador. Antes de pagar, los precios y el stock se
  vuelven a leer de la BD.
- **Compra segura:** la función `registrar_compra()` de la BD calcula precios y
  descuentos, descuenta el stock y crea el pedido en **una sola transacción**:
  - bloquea cada producto (`SELECT … FOR UPDATE`), así dos clientes no pueden
    comprar la misma última unidad;
  - cada intento de pago lleva una **clave única**, así un doble clic no crea dos pedidos.
- **Boleta de venta** (serie `B001-000001`) con subtotal, descuentos, op.
  gravada, IGV 18 % y total. Se imprime o se descarga en PDF. El pago es simulado
  (proyecto académico, sin validez tributaria).

### Sistema interno (administrador)
- **CRUD** de productos y servicios con subida de imagen, ofertas y stock.
- **Eliminación lógica:** al eliminar, el producto pasa a *Desactivados* y se puede
  reactivar; desde esa pestaña también se elimina definitivamente.
- **Reportes** (`/admin/reportes`), filtrables por 3, 6 o 12 meses:

  | # | Reporte | Gráfico |
  |---|---|---|
  | 1 | Ventas por mes | Columnas |
  | 2 | Productos más vendidos (top 5) | Barras |
  | 3 | Ventas por categoría | Barras |
  | 4 | Pedidos por día de la semana | Columnas |
  | 5 | Ahorro entregado por ofertas | Columnas |
  | 6 | Productos con menor stock | Barras |

  Cada reporte tiene una **descripción del resultado** que se redacta a partir de
  los datos (mejor mes, variación, porcentajes y recomendaciones) y una tabla con
  los valores exactos. **Descargar informe** genera el documento en
  **Word (.docx)**, **Excel (.xlsx)** o **PDF** con los gráficos incluidos.

### Contacto
- Formulario que guarda los mensajes en la tabla `mensajes_contacto`.
- Mapa de Google Maps con botón *Cómo llegar*, datos de contacto y redes sociales.
- Opiniones de clientes con calificación de 1 a 5 estrellas (tabla `opiniones`).

## Puesta en marcha

### 1. Base de datos en Supabase
1. Crear un proyecto en <https://supabase.com>.
2. **Authentication → Users → Add user → Create new user**
   - correo: `admin@mymmuebleria.pe` · contraseña: la que elijan · marcar **Auto Confirm User**.
3. En **SQL Editor → New query**, ejecutar:

   | # | Script | Qué hace |
   |---|---|---|
   | 1 | `supabase/mym_muebleria.sql` | **Base de datos completa:** tablas, ofertas, stock, pedidos y boletas, compra segura, seguridad (RLS), bucket de imágenes, los 26 productos/servicios y rol `admin` al usuario del paso 2 |
   | 2 | `supabase/final_contacto.sql` | Mensajes de contacto y opiniones (página Contacto) |
   | 3 | `supabase/mym_datos_demo.sql` *(opcional)* | ~80 ventas de demostración de los últimos 6 meses para los reportes |

   - `mym_muebleria.sql` **borra y recrea las tablas desde cero** (productos y
     pedidos vuelven a los datos iniciales). Las cuentas de Supabase Auth no se
     borran: se vuelven a registrar en `usuarios` y el admin recupera su rol.
     Después de ejecutarlo, ejecutar otra vez `final_contacto.sql`.
   - Las ventas de demostración quedan marcadas con `es_demo` y se borran con
     `delete from pedidos where es_demo;`.

### 2. Conectar la web
```bash
cp .env.local.example .env.local
# Pegar en .env.local los datos de Project Settings → API:
#   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
npm install
npm run dev
```
Abrir <http://localhost:3000>.

### 3. Probar la entrega
1. **Ofertas:** en `/productos` aparece la sección *Ofertas* con los precios rebajados.
2. **Compra:** crear una cuenta con **Registrarse**, agregar productos al carrito,
   ir a `/carrito`, completar nombre y DNI y pulsar **Pagar** → se muestra la
   boleta (descargar en PDF). El stock baja en el panel.
3. **Contacto:** en `/contacto` enviar un mensaje y publicar una opinión.
4. **Reportes:** **Ingresar** con el correo del admin → **Reportes** → cambiar el
   periodo y descargar el informe en Word, Excel y PDF.

## Base de datos

```
usuarios (1) ──registra──< (N) productos >──pertenece── (1) categorias
usuarios (1) ──compra────< (N) pedidos (1) ──< (N) pedido_items >── (1) productos
mensajes_contacto · opiniones   (formularios de la página Contacto)
```

- **ID**: entero autoincrementable, uso interno (empieza en 1).
- **Código**: texto visible para el cliente (`PRD-001`, `SRV-001`, `CAT-01`).
- **activo**: `false` = producto desactivado (eliminación lógica).
- **descuento** (%): `0` = sin oferta; con oferta, entre 5 y 90. **stock**: unidades a la venta.
- **pedido_items** guarda una copia del nombre, la categoría y los precios del
  momento de la compra: si luego cambia el producto, la boleta no cambia.
- Las contraseñas no se guardan en `usuarios`: las cifra Supabase Auth (`auth.users`);
  `usuarios.auth_id` enlaza ambas tablas y `usuarios.rol` define los permisos.

**Seguridad (RLS en la base de datos):**
- El público solo ve productos activos; solo el rol `admin` crea, edita, desactiva o elimina.
- Cada cliente ve solo sus pedidos y el admin ve todos. Nadie inserta pedidos
  directamente: solo mediante `registrar_compra()`.
- Cualquiera puede enviar un mensaje de contacto u opinión, pero solo el admin lee
  los mensajes (tienen datos personales).

## Búsquedas

| | Dónde | Cómo funciona |
|---|---|---|
| **Estática** | `/admin` | Se elige campo + texto y se pulsa **Buscar**. El formulario se envía (GET `?campo=marca&q=vesto`) y el **servidor** consulta la BD y devuelve la página filtrada. |
| **Dinámica** | `/productos` y `/admin` | Mientras se escribe (sin botón ni recarga) el navegador consulta la BD (`ILIKE`) y repinta la lista al instante. |

## Metodología: Scrum

Un sprint por cada avance del curso:

| Sprint | Avance | Contenido |
|---|---|---|
| 1 | Avance 1 | Entrevista a la empresa, misión, visión, mapa del sitio y wireframes |
| 2 | Avance 2 | Base de datos, catálogo, login con roles y CRUD con búsquedas |
| 3 | Avance 3 | Página Nosotros, C.V. de los desarrolladores y eliminación lógica |
| 4 | Entrega final | Página Contacto, ofertas, carrito y boleta, reportes con gráficos y exportación |

## Estructura

```
src/
  app/
    page.tsx                 Inicio
    productos/               Catálogo (búsqueda dinámica, ofertas) y detalle
    carrito/                 Carrito y acción de pagar (llama a registrar_compra)
    pedidos/                 Mis pedidos y boleta
    contacto/                Página Contacto y envío de formularios
    nosotros/page.tsx        Página Nosotros
    admin/page.tsx           CRUD (búsqueda estática en el servidor)
    admin/actions.ts         Crear, editar, desactivar, reactivar y eliminar
    admin/reportes/page.tsx  6 reportes con gráficos y descarga Word/Excel/PDF
  components/
    site/                    Navbar, catálogo, tarjetas, precio, carrito, login…
    tienda/                  Vista del carrito y acciones de la boleta
    contacto/                Slider, formulario, mapa y opiniones
    nosotros/                Slider, organigrama, empresa, desarrolladores, metodología
    admin/                   Cabecera, tabla CRUD, formulario, reportes y gráficos
  data/                      Datos de la empresa, el equipo, los C.V. y la metodología
  lib/
    supabase/                Clientes de Supabase (navegador, servidor, proxy)
    auth.ts                  Usuario actual y su rol
    types.ts                 Tipos de las tablas, precio con oferta, IGV
    carrito.ts               Carrito (localStorage)
    reportes.ts              Cálculo de los 6 reportes y su descripción
    exportar-reportes.ts     Informe en Word (docx), Excel (ExcelJS) y PDF (jsPDF)
    boleta-pdf.ts            Boleta en PDF
  proxy.ts                   Refresca la sesión y protege /admin
public/
  cv/                        C.V. completos en PDF
  images/equipo/             Fotos del equipo
supabase/
  mym_muebleria.sql      Base de datos completa (un solo script)
  final_contacto.sql     Mensajes de contacto y opiniones de clientes
  mym_datos_demo.sql     (Opcional) ventas de demostración para los reportes
```
