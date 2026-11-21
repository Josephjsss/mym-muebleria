-- =====================================================================
--  M&M Mueblería y Taller en Melamine — BASE DE DATOS COMPLETA (entrega final)
--  Motor: PostgreSQL (Supabase)
--
--  Cómo usarlo:
--    1. Supabase > Authentication > Users > "Add user" > "Create new user"
--       correo: admin@mymmuebleria.pe · contraseña: la que elijan
--       (marcar "Auto Confirm User").
--    2. Supabase > SQL Editor > New query > pegar TODO este archivo > Run.
--
--  ¡OJO! Borra y recrea las tablas desde cero (productos, pedidos, etc.).
--  Las cuentas de Supabase Auth NO se borran: al final se vuelven a
--  registrar en la tabla usuarios y el admin recupera su rol.
--
--  Entidades:
--    usuarios   (1) ──registra──< (N) productos
--    categorias (1) ──agrupa────< (N) productos
--    usuarios   (1) ──compra────< (N) pedidos (1) ──< (N) pedido_items
--    mensajes_contacto · opiniones  (formularios de la página Contacto)
--
--  Incluye: catálogo con eliminación lógica (activo), ofertas (descuento
--  mínimo 5 %), stock, carrito → pedidos con boleta, compra segura
--  (registrar_compra), página Contacto (mensajes y opiniones) y
--  seguridad por filas (RLS).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Limpieza (para poder ejecutar el script varias veces)
-- ---------------------------------------------------------------------
drop trigger if exists al_registrarse_usuario on auth.users;
drop function if exists public.crear_usuario_al_registrarse() cascade;
drop function if exists public.es_admin() cascade;
drop function if exists public.registrar_compra(jsonb, text, text, text, text, uuid) cascade;
drop function if exists public.registrar_compra(jsonb, text, text, text, text) cascade;
drop function if exists public.mi_usuario_id() cascade;
drop table if exists public.mensajes_contacto cascade;
drop table if exists public.opiniones         cascade;
drop table if exists public.pedido_items cascade;
drop table if exists public.pedidos      cascade;
drop table if exists public.productos  cascade;
drop table if exists public.categorias cascade;
drop table if exists public.usuarios   cascade;
drop sequence if exists public.boleta_numero_seq;

-- ---------------------------------------------------------------------
-- 1. Tablas
--    El ID es ENTERO autoincrementable (uso interno, empieza en 1).
--    El CÓDIGO es texto y es el que ve el cliente (ej. PRD-001).
-- ---------------------------------------------------------------------

-- 1.1 USUARIOS: perfil y rol de cada cuenta.
--     La contraseña NO se guarda aquí: la guarda Supabase Auth (auth.users)
--     cifrada. auth_id enlaza ambas tablas.
create table public.usuarios (
  id          integer generated always as identity primary key,
  auth_id     uuid        not null unique references auth.users (id) on delete cascade,
  nombre      varchar(100) not null,
  correo      varchar(150) not null unique,
  rol         varchar(20)  not null default 'cliente'
              check (rol in ('admin', 'cliente')),
  creado_en   timestamptz  not null default now()
);

-- 1.2 CATEGORIAS de productos y servicios.
create table public.categorias (
  id          integer generated always as identity primary key,
  codigo      varchar(10)  not null unique,
  nombre      varchar(60)  not null unique,
  descripcion varchar(255)
);

-- 1.3 PRODUCTOS (y servicios).
create table public.productos (
  id              integer generated always as identity primary key,
  codigo          varchar(10)   not null unique,
  nombre          varchar(120)  not null,
  descripcion     text          not null,
  marca           varchar(60)   not null,          -- marca del tablero / fabricante
  tipo            varchar(10)   not null default 'Producto'
                  check (tipo in ('Producto', 'Servicio')),
  duracion        varchar(60),                     -- solo si aplica (servicios / entrega)
  precio          numeric(10,2) not null check (precio >= 0),
  imagen_url      text          not null,
  categoria_id    integer       not null references public.categorias (id),
  registrado_por  integer       references public.usuarios (id) on delete set null,
  activo          boolean       not null default true,           -- false = desactivado (se puede reactivar)
  descuento       smallint      not null default 0               -- % de oferta: 0 = sin oferta
                  constraint productos_descuento_chk check (descuento = 0 or descuento between 5 and 90),
  stock           integer       not null default 0               -- unidades a la venta
                  constraint productos_stock_chk check (stock >= 0),
  creado_en       timestamptz   not null default now(),
  actualizado_en  timestamptz   not null default now()
);

create index productos_categoria_idx on public.productos (categoria_id);
create index productos_nombre_idx    on public.productos (lower(nombre));
create index productos_activo_idx    on public.productos (activo);

-- Mantiene actualizado_en al editar.
create or replace function public.tocar_actualizado_en()
returns trigger language plpgsql as $$
begin
  new.actualizado_en := now();
  return new;
end $$;

create trigger productos_actualizado_en
before update on public.productos
for each row execute function public.tocar_actualizado_en();

-- ---------------------------------------------------------------------
-- 1.4 PEDIDOS (cada uno es una boleta B001-000001) y su detalle
-- ---------------------------------------------------------------------
create sequence public.boleta_numero_seq start 1;

create table public.pedidos (
  id                integer generated always as identity primary key,
  serie             varchar(4)    not null default 'B001',
  numero            integer       not null default nextval('public.boleta_numero_seq'),
  usuario_id        integer       not null references public.usuarios (id),
  cliente_nombre    varchar(120)  not null,
  cliente_dni       varchar(8)    not null check (cliente_dni ~ '^[0-9]{8}$'),
  cliente_telefono  varchar(20),
  direccion         varchar(200),
  subtotal          numeric(10,2) not null default 0,   -- a precio de lista
  descuento         numeric(10,2) not null default 0,   -- ahorro por ofertas
  total             numeric(10,2) not null default 0,   -- lo que paga (IGV incluido)
  estado            varchar(15)   not null default 'Pagado'
                    check (estado in ('Pagado', 'Entregado', 'Anulado')),
  es_demo           boolean       not null default false, -- true = dato de demostración
  clave             uuid          unique,                -- evita pedidos duplicados (doble clic)
  creado_en         timestamptz   not null default now(),
  unique (serie, numero)
);

-- El detalle guarda una COPIA del nombre, categoría y precios del momento de la
-- compra: si luego cambia el precio o se borra el producto, la boleta no cambia.
create table public.pedido_items (
  id               integer generated always as identity primary key,
  pedido_id        integer       not null references public.pedidos (id) on delete cascade,
  producto_id      integer       references public.productos (id) on delete set null,
  codigo           varchar(10)   not null,
  nombre           varchar(120)  not null,
  categoria        varchar(60)   not null,
  cantidad         integer       not null check (cantidad > 0),
  precio_unitario  numeric(10,2) not null,   -- precio de lista
  descuento_pct    smallint      not null default 0,
  precio_final     numeric(10,2) not null,   -- con la oferta aplicada
  importe          numeric(10,2) not null    -- precio_final * cantidad
);

create index pedidos_usuario_idx  on public.pedidos (usuario_id);
create index pedidos_fecha_idx    on public.pedidos (creado_en);
create index pedido_items_ped_idx on public.pedido_items (pedido_id);

-- ---------------------------------------------------------------------
-- 1.5 CONTACTO: mensajes del formulario y opiniones de clientes
-- ---------------------------------------------------------------------
create table public.mensajes_contacto (
  id         integer generated always as identity primary key,
  nombre     varchar(100) not null check (length(trim(nombre)) >= 2),
  correo     varchar(150) not null check (correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  telefono   varchar(20),
  asunto     varchar(30)  not null default 'Consulta'
             check (asunto in ('Cotización', 'Consulta', 'Pedido', 'Reclamo', 'Otro')),
  mensaje    text         not null check (length(trim(mensaje)) between 10 and 2000),
  leido      boolean      not null default false,
  creado_en  timestamptz  not null default now()
);

create table public.opiniones (
  id           integer generated always as identity primary key,
  nombre       varchar(80)  not null check (length(trim(nombre)) >= 2),
  ciudad       varchar(80),
  calificacion smallint     not null check (calificacion between 1 and 5),
  comentario   text         not null check (length(trim(comentario)) between 10 and 600),
  visible      boolean      not null default true,   -- el admin puede ocultarla
  creado_en    timestamptz  not null default now()
);

create index mensajes_contacto_fecha_idx on public.mensajes_contacto (creado_en desc);
create index opiniones_fecha_idx         on public.opiniones (creado_en desc);

-- ---------------------------------------------------------------------
-- 2. Registro automático: cada cuenta nueva de Supabase Auth
--    crea su fila en public.usuarios con rol 'cliente'.
-- ---------------------------------------------------------------------
create or replace function public.crear_usuario_al_registrarse()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.usuarios (auth_id, nombre, correo)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'nombre', ''), split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (auth_id) do nothing;
  return new;
end $$;

create trigger al_registrarse_usuario
after insert on auth.users
for each row execute function public.crear_usuario_al_registrarse();

-- ¿El usuario que hace la consulta es administrador?
create or replace function public.es_admin()
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.usuarios
    where auth_id = auth.uid() and rol = 'admin'
  );
$$;

-- id (tabla usuarios) del usuario que hace la consulta.
create or replace function public.mi_usuario_id()
returns integer
language sql stable
security definer set search_path = public
as $$
  select id from public.usuarios where auth_id = auth.uid();
$$;

-- ---------------------------------------------------------------------
-- 3. COMPRA SEGURA
--    Todo ocurre en UNA transacción. "for update" bloquea la fila de cada
--    producto: si dos clientes compran la última unidad al mismo tiempo, el
--    segundo espera al primero y luego ve stock 0, así nunca se vende de más.
--    Los precios se leen de la BD (no se confía en los que manda el navegador).
--    p_clave: identificador único de ESTE intento de compra. Si llega dos veces
--    (doble clic, reintento de red) se devuelve el mismo pedido, no uno nuevo.
--
--    p_items: [{"producto_id": 3, "cantidad": 2}, ...]
-- ---------------------------------------------------------------------
create or replace function public.registrar_compra(
  p_items     jsonb,
  p_nombre    text,
  p_dni       text,
  p_telefono  text default null,
  p_direccion text default null,
  p_clave     uuid default null
)
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  v_usuario   integer := public.mi_usuario_id();
  v_pedido    integer;
  v_item      record;
  v_prod      record;
  v_final     numeric(10,2);
  v_subtotal  numeric(10,2) := 0;
  v_total     numeric(10,2) := 0;
begin
  if v_usuario is null then
    raise exception 'Debes iniciar sesión para comprar.';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'El carrito está vacío.';
  end if;
  if coalesce(trim(p_nombre), '') = '' then
    raise exception 'Escribe tu nombre completo.';
  end if;
  if p_dni !~ '^[0-9]{8}$' then
    raise exception 'El DNI debe tener 8 dígitos.';
  end if;

  -- ¿Esta misma compra ya se registró? (doble clic / reintento)
  if p_clave is not null then
    select id into v_pedido from public.pedidos where clave = p_clave and usuario_id = v_usuario;
    if found then
      return v_pedido;
    end if;
  end if;

  insert into public.pedidos (usuario_id, cliente_nombre, cliente_dni, cliente_telefono, direccion, clave)
  values (v_usuario, trim(p_nombre), p_dni, nullif(trim(p_telefono), ''), nullif(trim(p_direccion), ''), p_clave)
  on conflict (clave) do nothing
  returning id into v_pedido;

  -- Otro intento con la misma clave terminó justo antes: devolver ese pedido.
  if v_pedido is null then
    select id into v_pedido from public.pedidos where clave = p_clave and usuario_id = v_usuario;
    if v_pedido is null then
      raise exception 'No se pudo registrar el pedido. Inténtalo de nuevo.';
    end if;
    return v_pedido;
  end if;

  -- Se agrupan productos repetidos y se recorren en orden de id
  -- (mismo orden de bloqueo para todos = sin interbloqueos).
  for v_item in
    select (e ->> 'producto_id')::int as producto_id, sum((e ->> 'cantidad')::int)::int as cantidad
    from jsonb_array_elements(p_items) e
    group by 1
    order by 1
  loop
    if v_item.cantidad is null or v_item.cantidad < 1 or v_item.cantidad > 99 then
      raise exception 'Cantidad no válida.';
    end if;

    select p.id, p.codigo, p.nombre, p.tipo, p.precio, p.descuento, p.stock, p.activo,
           c.nombre as categoria
      into v_prod
      from public.productos p
      join public.categorias c on c.id = p.categoria_id
     where p.id = v_item.producto_id
       for update of p;

    if not found or not v_prod.activo then
      raise exception 'Un producto del carrito ya no está disponible.';
    end if;
    if v_prod.tipo <> 'Producto' or v_prod.precio <= 0 then
      raise exception '«%» no se vende en línea; consúltalo por WhatsApp.', v_prod.nombre;
    end if;
    if v_prod.stock < v_item.cantidad then
      raise exception 'Stock insuficiente de «%»: quedan % unidad(es).', v_prod.nombre, v_prod.stock;
    end if;

    v_final := round(v_prod.precio * (100 - v_prod.descuento) / 100.0, 2);

    insert into public.pedido_items
      (pedido_id, producto_id, codigo, nombre, categoria, cantidad,
       precio_unitario, descuento_pct, precio_final, importe)
    values
      (v_pedido, v_prod.id, v_prod.codigo, v_prod.nombre, v_prod.categoria, v_item.cantidad,
       v_prod.precio, v_prod.descuento, v_final, v_final * v_item.cantidad);

    update public.productos set stock = stock - v_item.cantidad where id = v_prod.id;

    v_subtotal := v_subtotal + v_prod.precio * v_item.cantidad;
    v_total    := v_total + v_final * v_item.cantidad;
  end loop;

  update public.pedidos
     set subtotal = v_subtotal, descuento = v_subtotal - v_total, total = v_total
   where id = v_pedido;

  return v_pedido;
end $$;

-- ---------------------------------------------------------------------
-- 4. Seguridad (Row Level Security)
--    - Cualquiera puede VER los productos ACTIVOS y las categorías (el admin ve todos).
--    - Solo el ADMIN puede crear, editar o eliminar.
--    - Cada usuario ve su propio perfil; el admin ve todos.
--    - Cada cliente ve solo SUS pedidos; el admin ve todos y cambia su estado.
--    - Nadie inserta pedidos directamente: solo con registrar_compra().
--    - Cualquiera ENVÍA mensajes de contacto u opiniones; solo el admin lee
--      los mensajes (datos personales). Todos ven las opiniones visibles.
-- ---------------------------------------------------------------------
alter table public.usuarios   enable row level security;
alter table public.categorias enable row level security;
alter table public.productos  enable row level security;

create policy "catalogo publico: ver productos"
  on public.productos for select using (activo or public.es_admin());
create policy "admin: crear productos"
  on public.productos for insert with check (public.es_admin());
create policy "admin: editar productos"
  on public.productos for update using (public.es_admin()) with check (public.es_admin());
create policy "admin: eliminar productos"
  on public.productos for delete using (public.es_admin());

create policy "catalogo publico: ver categorias"
  on public.categorias for select using (true);
create policy "admin: gestionar categorias"
  on public.categorias for all using (public.es_admin()) with check (public.es_admin());

create policy "usuario: ver su perfil"
  on public.usuarios for select using (auth_id = auth.uid() or public.es_admin());

grant usage on schema public to anon, authenticated;
grant select on public.productos, public.categorias to anon, authenticated;
grant insert, update, delete on public.productos, public.categorias to authenticated;
grant select on public.usuarios to authenticated;

-- Pedidos y boletas
alter table public.pedidos      enable row level security;
alter table public.pedido_items enable row level security;

create policy "pedidos: ver los mios"
  on public.pedidos for select using (usuario_id = public.mi_usuario_id() or public.es_admin());
create policy "pedidos: admin edita"
  on public.pedidos for update using (public.es_admin()) with check (public.es_admin());
create policy "detalle: ver los mios"
  on public.pedido_items for select using (
    exists (select 1 from public.pedidos p
            where p.id = pedido_id and (p.usuario_id = public.mi_usuario_id() or public.es_admin()))
  );

grant select on public.pedidos, public.pedido_items to authenticated;
grant update on public.pedidos to authenticated;

revoke all on function public.registrar_compra(jsonb, text, text, text, text, uuid) from public, anon;
grant execute on function public.registrar_compra(jsonb, text, text, text, text, uuid) to authenticated;

-- Contacto
alter table public.mensajes_contacto enable row level security;
alter table public.opiniones         enable row level security;

create policy "contacto: enviar"
  on public.mensajes_contacto for insert with check (not leido);
create policy "contacto: admin lee"
  on public.mensajes_contacto for select using (public.es_admin());
create policy "contacto: admin gestiona"
  on public.mensajes_contacto for update using (public.es_admin()) with check (public.es_admin());

create policy "opiniones: enviar"
  on public.opiniones for insert with check (visible);
create policy "opiniones: ver"
  on public.opiniones for select using (visible or public.es_admin());
create policy "opiniones: admin gestiona"
  on public.opiniones for update using (public.es_admin()) with check (public.es_admin());
create policy "opiniones: admin elimina"
  on public.opiniones for delete using (public.es_admin());

grant insert on public.mensajes_contacto, public.opiniones to anon, authenticated;
grant select on public.opiniones to anon, authenticated;
grant select, update on public.mensajes_contacto to authenticated;
grant update, delete on public.opiniones to authenticated;

-- ---------------------------------------------------------------------
-- 5. Almacenamiento de imágenes (Supabase Storage)
--    Bucket público "productos": todos ven las fotos, solo el admin sube.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do update set public = true;

drop policy if exists "imagenes productos: ver"      on storage.objects;
drop policy if exists "imagenes productos: subir"    on storage.objects;
drop policy if exists "imagenes productos: cambiar"  on storage.objects;
drop policy if exists "imagenes productos: eliminar" on storage.objects;

create policy "imagenes productos: ver"
  on storage.objects for select using (bucket_id = 'productos');
create policy "imagenes productos: subir"
  on storage.objects for insert with check (bucket_id = 'productos' and public.es_admin());
create policy "imagenes productos: cambiar"
  on storage.objects for update using (bucket_id = 'productos' and public.es_admin());
create policy "imagenes productos: eliminar"
  on storage.objects for delete using (bucket_id = 'productos' and public.es_admin());

-- ---------------------------------------------------------------------
-- 6. Datos iniciales
-- ---------------------------------------------------------------------
insert into public.categorias (codigo, nombre, descripcion) values
  ('CAT-01', 'Roperos',     'Roperos de línea y a medida en melamina'),
  ('CAT-02', 'Camas',       'Camas tapizadas, camas box y pies de cama'),
  ('CAT-03', 'Closets',     'Closets empotrados y a medida'),
  ('CAT-04', 'Reposteros',  'Reposteros y alacenas de cocina'),
  ('CAT-05', 'Cocinas',     'Cocinas integrales a medida'),
  ('CAT-06', 'Accesorios',  'Complementos para el hogar'),
  ('CAT-07', 'Servicios',   'Servicios del taller: diseño, corte, canteado, armado');

insert into public.productos
  (codigo, nombre, descripcion, marca, tipo, duracion, precio, imagen_url, categoria_id)
select p.codigo, p.nombre, p.descripcion, p.marca, p.tipo, p.duracion, p.precio, p.imagen_url, c.id
from (values
  -- Roperos
  ('PRD-001', 'Ropero Nórdico 4 puertas con espejo',
   'Ropero en melamina gris nórdico de 4 puertas batientes, espejo central, maletero superior y 3 cajones con correderas.',
   'Pelikano', 'Producto', 'Entrega en 7 días', 1150.00, '/images/ropero-1.png', 'Roperos'),
  ('PRD-002', 'Ropero Nogal con cajonera',
   'Ropero color nogal con puertas de espejo, zona de colgar y cajonera de 6 gavetas. Ideal para dormitorio principal.',
   'Vesto', 'Producto', 'Entrega en 7 días', 1290.00, '/images/ropero-2.png', 'Roperos'),
  ('PRD-003', 'Ropero Blanco Ártico',
   'Ropero blanco de 4 puertas con vitrina lateral, maleteros y 3 cajones amplios. Acabado texturizado.',
   'Pelikano', 'Producto', 'Entrega en 7 días', 1090.00, '/images/ropero-3.png', 'Roperos'),

  -- Camas
  ('PRD-004', 'Cama tapizada Royal 2 plazas',
   'Cama de 2 plazas con cabecera alta tapizada en terciopelo azul con detalle dorado. Base reforzada.',
   'M&M', 'Producto', 'Entrega en 10 días', 1390.00, '/images/cama-1.jpg', 'Camas'),
  ('PRD-005', 'Cama box capitoné 1.5 plazas',
   'Cama box de 1.5 plazas con cabecera capitoné rosa. Incluye base; colchón no incluido.',
   'M&M', 'Producto', 'Entrega en 10 días', 890.00, '/images/cama-2.jpg', 'Camas'),
  ('PRD-006', 'Cama con baúl pie de cama',
   'Cama de 1.5 plazas con cabecera capitoné y baúl tapizado a los pies para guardar frazadas.',
   'M&M', 'Producto', 'Entrega en 10 días', 1180.00, '/images/cama-3.jpg', 'Camas'),

  -- Closets
  ('PRD-007', 'Closet con zapatera extraíble',
   'Closet a medida color roble con puerta corrediza, cajonera y zapatera vertical extraíble.',
   'Vesto', 'Producto', 'Fabricación en 10 días', 2350.00, '/images/closet-1.jpg', 'Closets'),
  ('PRD-008', 'Closet esquinero en L',
   'Closet esquinero que aprovecha toda la esquina del dormitorio, con puertas altas y maleteros.',
   'Tableros Hispanos', 'Producto', 'Fabricación en 12 días', 2890.00, '/images/closet-2.jpg', 'Closets'),
  ('PRD-009', 'Closet juvenil con espejos',
   'Closet de 2 puertas corredizas con espejo, repisas laterales y cajonera. Ideal para habitaciones juveniles.',
   'Pelikano', 'Producto', 'Fabricación en 10 días', 1650.00, '/images/closet-3.jpg', 'Closets'),
  ('PRD-010', 'Closet corredizo con espejo',
   'Closet de piso a techo con puertas corredizas, espejo de cuerpo entero y cajones superiores.',
   'Vesto', 'Producto', 'Fabricación en 10 días', 2490.00, '/images/closet-4.jpg', 'Closets'),

  -- Reposteros
  ('PRD-011', 'Repostero Roble con vitrina',
   'Repostero de cocina con vitrinas de vidrio, espacio para microondas y puertas inferiores.',
   'Pelikano', 'Producto', 'Entrega en 5 días', 690.00, '/images/repostero-1.jpg', 'Reposteros'),
  ('PRD-012', 'Repostero Gris Cristal',
   'Repostero con puertas de vidrio y escurridor, cajón para cubiertos y tablero de trabajo.',
   'Paneles Andinos', 'Producto', 'Entrega en 5 días', 740.00, '/images/repostero-2.jpg', 'Reposteros'),
  ('PRD-013', 'Repostero Wengué con tablero',
   'Repostero color wengué con tablero tipo granito negro, vitrinas y alacena inferior.',
   'Vesto', 'Producto', 'Entrega en 5 días', 820.00, '/images/repostero-3.jpg', 'Reposteros'),
  ('PRD-014', 'Repostero Blanco Clásico',
   'Repostero blanco con vitrinas laterales, nicho para microondas y 3 puertas inferiores.',
   'Pelikano', 'Producto', 'Entrega en 5 días', 650.00, '/images/repostero-4.jpg', 'Reposteros'),

  -- Cocinas
  ('PRD-015', 'Cocina en L con luces LED',
   'Cocina integral en L con alacenas altas, iluminación LED y muebles bajos con tablero.',
   'Pelikano', 'Producto', 'Fabricación en 15 días', 5900.00, '/images/cocina-1.png', 'Cocinas'),
  ('PRD-016', 'Cocina con barra desayunadora',
   'Cocina a medida con barra desayunadora, iluminación colgante y cajoneras de cierre lento.',
   'Pelikano', 'Producto', 'Fabricación en 15 días', 6800.00, '/images/cocina-2.png', 'Cocinas'),
  ('PRD-017', 'Cocina madera y blanco',
   'Cocina en L que combina madera y blanco, alacenas hasta el techo y cajonera vertical.',
   'Vesto', 'Producto', 'Fabricación en 15 días', 5400.00, '/images/cocina-3.jpg', 'Cocinas'),
  ('PRD-018', 'Cocina con isla central',
   'Cocina integral con isla central de trabajo, alacenas aéreas y muebles bajos en gris y madera.',
   'Tableros Hispanos', 'Producto', 'Fabricación en 20 días', 7500.00, '/images/armado-1.jpg', 'Cocinas'),
  ('PRD-019', 'Cocina integral blanca',
   'Cocina en L completamente blanca con cajoneras, alacenas aéreas y espacio para cocina empotrada.',
   'Pelikano', 'Producto', 'Fabricación en 15 días', 4800.00, '/images/armado-2.jpg', 'Cocinas'),
  ('PRD-020', 'Cocina en U con alacenas',
   'Cocina en U de color roble con alacenas aéreas, tablero de cuarzo blanco y lavadero integrado.',
   'Vesto', 'Producto', 'Fabricación en 18 días', 6200.00, '/images/armado-3.jpg', 'Cocinas'),

  -- Accesorios
  ('PRD-021', 'Soporte de TV articulado',
   'Soporte de pared articulado para TV de 32" a 55". Se instala junto con tu mueble de sala.',
   'Genérico', 'Producto', null, 120.00, '/images/cotizacion-1.jpg', 'Accesorios'),

  -- Servicios
  ('SRV-001', 'Armado e instalación a domicilio',
   'Llevamos tu mueble y lo armamos en tu casa: nivelado, ajuste de puertas y limpieza final.',
   'M&M', 'Servicio', '1 a 2 días', 80.00, '/images/comedor-sala-1.jpg', 'Servicios'),
  ('SRV-002', 'Diseño y cotización a medida',
   'Visitamos tu espacio, tomamos medidas y te proponemos un diseño con presupuesto sin compromiso.',
   'M&M', 'Servicio', '24 a 48 horas', 0.00, '/images/servicio-diseno.jpg', 'Servicios'),
  ('SRV-003', 'Corte de tableros de melamina',
   'Cortamos tus planchas de melamina a medida con máquina seccionadora. Precio por plancha.',
   'M&M', 'Servicio', 'Mismo día', 25.00, '/images/servicio-corte.jpg', 'Servicios'),
  ('SRV-004', 'Canteado de piezas',
   'Pegado de tapacanto en las piezas cortadas para un acabado limpio y duradero. Precio por metro lineal.',
   'M&M', 'Servicio', 'Mismo día', 2.50, '/images/servicio-canteado.jpg', 'Servicios'),
  ('SRV-005', 'Mantenimiento y reparación',
   'Cambio de bisagras y correderas, ajuste de puertas y reparación de muebles de melamina.',
   'M&M', 'Servicio', '1 día', 60.00, '/images/servicio-mantenimiento.jpg', 'Servicios')
) as p (codigo, nombre, descripcion, marca, tipo, duracion, precio, imagen_url, categoria)
join public.categorias c on c.nombre = p.categoria
order by p.codigo;

-- Stock inicial: 10 unidades por producto (los servicios no llevan stock).
update public.productos set stock = 10 where tipo = 'Producto';

-- Ofertas iniciales (el admin las cambia desde el panel). Mínimo 5 %.
update public.productos set descuento = 15 where codigo = 'PRD-001';
update public.productos set descuento = 10 where codigo = 'PRD-004';
update public.productos set descuento = 20 where codigo = 'PRD-007';
update public.productos set descuento = 5  where codigo = 'PRD-010';
update public.productos set descuento = 12 where codigo = 'PRD-013';

-- ---------------------------------------------------------------------
-- 7. Usuarios y administrador
--    a) Las cuentas que ya existían en Supabase Auth se vuelven a registrar
--       en public.usuarios (rol 'cliente'), así no pierden su perfil.
--    b) La cuenta admin@mymmuebleria.pe recibe el rol 'admin'.
-- ---------------------------------------------------------------------
insert into public.usuarios (auth_id, nombre, correo)
select id,
       coalesce(nullif(raw_user_meta_data ->> 'nombre', ''), split_part(email, '@', 1)),
       email
from auth.users
where email is not null
on conflict (auth_id) do nothing;

insert into public.usuarios (auth_id, nombre, correo, rol)
select id, 'Administrador M&M', email, 'admin'
from auth.users where email = 'admin@mymmuebleria.pe'
on conflict (auth_id) do update set rol = 'admin', nombre = 'Administrador M&M';

-- Comprobación rápida
select codigo, nombre, tipo, precio, descuento, stock from public.productos order by id;
