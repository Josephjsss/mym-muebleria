-- =====================================================================
--  M&M Mueblería — DATOS DE DEMOSTRACIÓN para los reportes (opcional)
--
--  Crea ~80 pedidos de los últimos 6 meses para que los 6 reportes del
--  panel tengan datos que mostrar en la presentación.
--  - Quedan marcados con es_demo = true (no son ventas reales).
--  - NO descuentan stock.
--  - Requiere haber ejecutado antes final_ofertas_compras.sql.
--
--  Para BORRARLOS:   delete from public.pedidos where es_demo;
-- =====================================================================

do $$
declare
  v_usuario  integer;
  v_pedido   integer;
  v_fecha    timestamptz;
  v_prod     record;
  v_cant     integer;
  v_final    numeric(10,2);
  v_n_items  integer;
  nombres    text[] := array['Rosa Huamán','Jorge Salvatierra','Milagros Ccorimanya','Édgar Palomino',
                             'Katherine Vilca','Luis Arapa','Fiorella Mendoza','Renzo Quispe',
                             'Doris Ñahui','Carmen Rojas','Pedro Yupanqui','Ana Lucía Torres'];
begin
  select id into v_usuario from public.usuarios where rol = 'admin' order by id limit 1;
  if v_usuario is null then
    raise exception 'No hay un usuario admin: ejecuta primero mym_avance2.sql.';
  end if;

  delete from public.pedidos where es_demo;   -- se puede volver a ejecutar
  perform setseed(0.42);                      -- siempre los mismos datos

  for i in 1..80 loop
    -- Fecha aleatoria en los últimos 180 días; más ventas en los meses recientes.
    v_fecha := now() - (power(random(), 1.4) * interval '180 days');

    insert into public.pedidos
      (usuario_id, cliente_nombre, cliente_dni, cliente_telefono, direccion, estado, es_demo, creado_en)
    values
      (v_usuario,
       nombres[1 + floor(random() * array_length(nombres, 1))::int],
       lpad((10000000 + floor(random() * 89999999))::bigint::text, 8, '0'),
       '9' || lpad(floor(random() * 99999999)::bigint::text, 8, '0'),
       (array['Quilmaná','San Vicente de Cañete','Imperial','Nuevo Imperial','Mala'])[1 + floor(random() * 5)::int],
       case when v_fecha < now() - interval '10 days' then 'Entregado' else 'Pagado' end,
       true,
       v_fecha)
    returning id into v_pedido;

    v_n_items := 1 + floor(random() * 2.2)::int;   -- 1 a 3 productos distintos
    for v_prod in
      select p.id, p.codigo, p.nombre, p.precio, p.descuento, c.nombre as categoria
      from public.productos p
      join public.categorias c on c.id = p.categoria_id
      where p.tipo = 'Producto' and p.precio > 0
      order by random() * (case when c.nombre in ('Roperos','Closets','Camas') then 0.6 else 1 end)
      limit v_n_items
    loop
      v_cant  := case when random() < 0.8 then 1 else 2 end;
      v_final := round(v_prod.precio * (100 - v_prod.descuento) / 100.0, 2);
      insert into public.pedido_items
        (pedido_id, producto_id, codigo, nombre, categoria, cantidad,
         precio_unitario, descuento_pct, precio_final, importe)
      values
        (v_pedido, v_prod.id, v_prod.codigo, v_prod.nombre, v_prod.categoria, v_cant,
         v_prod.precio, v_prod.descuento, v_final, v_final * v_cant);
    end loop;

    update public.pedidos p
       set subtotal  = t.subtotal,
           descuento = t.subtotal - t.total,
           total     = t.total
      from (select sum(precio_unitario * cantidad) as subtotal, sum(importe) as total
              from public.pedido_items where pedido_id = v_pedido) t
     where p.id = v_pedido;
  end loop;
end $$;

-- Comprobación rápida: ventas de demostración por mes
select to_char(date_trunc('month', creado_en), 'YYYY-MM') as mes,
       count(*) as pedidos, sum(total) as ventas
from public.pedidos where es_demo
group by 1 order by 1;
