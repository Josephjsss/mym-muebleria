-- =====================================================================
--  M&M Mueblería — Entrega final: OFERTAS, STOCK, CARRITO y BOLETAS
--
--  Cómo usarlo: Supabase > SQL Editor > New query > pegar este archivo > Run.
--  Requiere haber ejecutado antes mym_avance2.sql (y avance3_activar_productos.sql).
--  Se puede ejecutar más de una vez sin perder datos.
--
--  Nuevo:
--    productos.descuento  -> % de oferta (0 = sin oferta; si hay oferta, mínimo 5 %)
--    productos.stock      -> unidades disponibles para la venta
--    pedidos (1) ──< (N) pedido_items      (cada pedido es una boleta B001-000001)
--    registrar_compra()   -> compra segura: bloquea el stock mientras compra
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Ofertas y stock en productos
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'productos' and column_name = 'stock') then
    alter table public.productos add column stock integer not null default 0;
    -- Stock inicial solo la primera vez: 10 unidades por producto (los servicios no llevan stock).
    update public.productos set stock = 10 where tipo = 'Producto';
  end if;

  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'productos' and column_name = 'descuento') then
    alter table public.productos add column descuento smallint not null default 0;
    -- Ofertas iniciales de ejemplo (el admin las cambia desde el panel).
    update public.productos set descuento = 15 where codigo = 'PRD-001';
    update public.productos set descuento = 10 where codigo = 'PRD-004';
    update public.productos set descuento = 20 where codigo = 'PRD-007';
    update public.productos set descuento = 5  where codigo = 'PRD-010';
    update public.productos set descuento = 12 where codigo = 'PRD-013';
  end if;
end $$;

alter table public.productos drop constraint if exists productos_stock_chk;
alter table public.productos add constraint productos_stock_chk check (stock >= 0);

-- Regla del curso: una oferta es de 5 % como mínimo.
alter table public.productos drop constraint if exists productos_descuento_chk;
alter table public.productos add constraint productos_descuento_chk
  check (descuento = 0 or descuento between 5 and 90);

-- ---------------------------------------------------------------------
-- 2. Pedidos (boletas) y su detalle
-- ---------------------------------------------------------------------
create sequence if not exists public.boleta_numero_seq start 1;

create table if not exists public.pedidos (
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
create table if not exists public.pedido_items (
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

-- Por si la tabla se creó con una versión anterior de este script.
alter table public.pedidos add column if not exists clave uuid unique;

create index if not exists pedidos_usuario_idx  on public.pedidos (usuario_id);
create index if not exists pedidos_fecha_idx    on public.pedidos (creado_en);
create index if not exists pedido_items_ped_idx on public.pedido_items (pedido_id);

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
drop function if exists public.registrar_compra(jsonb, text, text, text, text);

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
-- 4. Seguridad (RLS)
--    - Cada cliente ve solo SUS pedidos; el admin ve todos.
--    - Nadie inserta pedidos directamente: solo con registrar_compra().
--    - El admin puede cambiar el estado (Entregado / Anulado).
-- ---------------------------------------------------------------------
alter table public.pedidos      enable row level security;
alter table public.pedido_items enable row level security;

drop policy if exists "pedidos: ver los mios" on public.pedidos;
drop policy if exists "pedidos: admin edita"  on public.pedidos;
drop policy if exists "detalle: ver los mios" on public.pedido_items;

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

-- Comprobación rápida
select codigo, nombre, precio, descuento, stock
from public.productos
where descuento > 0 or tipo = 'Producto'
order by codigo;
