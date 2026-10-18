-- =====================================================================
--  M&M Mueblería y Taller en Melamine — Base de datos (Avance 2)
--  Motor: PostgreSQL (Supabase)
--
--  Cómo usarlo:
--    Supabase > SQL Editor > New query > pegar TODO este archivo > Run.
--    Se puede volver a ejecutar: borra y recrea las tablas desde cero.
--
--  Entidades:
--    usuarios   (1) ──registra──< (N) productos
--    categorias (1) ──agrupa────< (N) productos
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Limpieza (para poder ejecutar el script varias veces)
-- ---------------------------------------------------------------------
drop trigger if exists al_registrarse_usuario on auth.users;
drop function if exists public.crear_usuario_al_registrarse() cascade;
drop function if exists public.es_admin() cascade;
drop table if exists public.productos  cascade;
drop table if exists public.categorias cascade;
drop table if exists public.usuarios   cascade;

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
  creado_en       timestamptz   not null default now(),
  actualizado_en  timestamptz   not null default now()
);

create index productos_categoria_idx on public.productos (categoria_id);
create index productos_nombre_idx    on public.productos (lower(nombre));

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

-- ---------------------------------------------------------------------
-- 3. Seguridad (Row Level Security)
--    - Cualquiera puede VER productos y categorías (catálogo público).
--    - Solo el ADMIN puede crear, editar o eliminar.
--    - Cada usuario ve su propio perfil; el admin ve todos.
-- ---------------------------------------------------------------------
alter table public.usuarios   enable row level security;
alter table public.categorias enable row level security;
alter table public.productos  enable row level security;

create policy "catalogo publico: ver productos"
  on public.productos for select using (true);
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

-- ---------------------------------------------------------------------
-- 4. Almacenamiento de imágenes (Supabase Storage)
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
-- 5. Datos iniciales
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

-- ---------------------------------------------------------------------
-- 6. Administrador
--    a) Supabase > Authentication > Users > "Add user" > "Create new user"
--       correo: admin@mymmuebleria.pe  ·  contraseña: la que elijan
--       (marcar "Auto Confirm User").
--    b) Ejecutar la línea de abajo (si el usuario ya existía antes del
--       script, el insert lo registra en public.usuarios):
-- ---------------------------------------------------------------------
insert into public.usuarios (auth_id, nombre, correo, rol)
select id, 'Administrador M&M', email, 'admin'
from auth.users where email = 'admin@mymmuebleria.pe'
on conflict (auth_id) do update set rol = 'admin', nombre = 'Administrador M&M';

-- Comprobación rápida
select codigo, nombre, tipo, precio from public.productos order by id;
