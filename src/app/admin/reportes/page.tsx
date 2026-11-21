import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { obtenerUsuarioActual } from "@/lib/auth";
import { ReportesPanel } from "@/components/admin/reportes-panel";
import { calcularReportes, inicioPeriodo, type PedidoReporte, type ProductoReporte } from "@/lib/reportes";
import type { Pedido } from "@/lib/types";

export const metadata: Metadata = {
  title: "Reportes · Panel M&M Mueblería",
};

const PERIODOS = [3, 6, 12] as const;

export default async function ReportesPage(props: PageProps<"/admin/reportes">) {
  const usuario = await obtenerUsuarioActual();
  if (usuario?.rol !== "admin") return null; // el layout muestra "Acceso restringido"

  const sp = await props.searchParams;
  const meses = PERIODOS.find((p) => String(p) === sp.meses) ?? 6;

  // RLS: solo el admin puede leer TODOS los pedidos.
  const supabase = await createClient();
  const [pedidosRes, productosRes, recientesRes] = await Promise.all([
    supabase
      .from("pedidos")
      .select("creado_en, total, descuento, estado, items:pedido_items(codigo, nombre, categoria, cantidad, importe, descuento_pct)")
      .gte("creado_en", inicioPeriodo(meses)),
    supabase.from("productos").select("codigo, nombre, stock, tipo, activo"),
    supabase
      .from("pedidos")
      .select("id, serie, numero, cliente_nombre, total, estado, es_demo, creado_en")
      .order("creado_en", { ascending: false })
      .limit(8),
  ]);

  const { reportes, indicadores, periodo } = calcularReportes(
    (pedidosRes.data ?? []) as PedidoReporte[],
    (productosRes.data ?? []) as ProductoReporte[],
    meses
  );

  return (
    <ReportesPanel
        reportes={reportes}
        indicadores={indicadores}
        periodo={periodo}
        meses={meses}
        periodos={[...PERIODOS]}
        recientes={(recientesRes.data ?? []) as Pedido[]}
        generadoPor={usuario.nombre}
      errorBD={pedidosRes.error?.message ?? productosRes.error?.message ?? null}
    />
  );
}
