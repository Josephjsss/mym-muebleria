-- =====================================================================
--  M&M Mueblería — Avance 3: activar / desactivar productos
--  (eliminación lógica: al "eliminar", el producto no se borra; solo
--   se marca como inactivo y se puede reactivar desde el panel).
--
--  Cómo usarlo: Supabase > SQL Editor > New query > pegar este archivo > Run.
--  Se puede ejecutar más de una vez sin problema.
-- =====================================================================

-- 1. Nueva columna: true = se muestra en la web, false = desactivado.
alter table public.productos
  add column if not exists activo boolean not null default true;

create index if not exists productos_activo_idx on public.productos (activo);

-- 2. El público solo ve productos activos; el administrador ve todos.
drop policy if exists "catalogo publico: ver productos" on public.productos;
create policy "catalogo publico: ver productos"
  on public.productos for select using (activo or public.es_admin());

-- Comprobación rápida
select activo, count(*) from public.productos group by activo;
