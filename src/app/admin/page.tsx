import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { obtenerUsuarioActual } from "@/lib/auth";
import { AdminPanel } from "@/components/admin/admin-panel";
import {
  CAMPOS_BUSQUEDA,
  PRODUCTO_SELECT,
  limpiarTermino,
  type CampoBusqueda,
  type Categoria,
  type Producto,
} from "@/lib/types";

export const metadata: Metadata = {
  title: "Panel de administración · M&M Mueblería",
};

export default async function AdminPage(props: PageProps<"/admin">) {
  // El layout ya muestra "Acceso restringido" a quien no es admin; aquí solo
  // se evita consultar la BD en ese caso (cache(): no repite la consulta).
  const usuario = await obtenerUsuarioActual();
  if (usuario?.rol !== "admin") return null;

  // BÚSQUEDA ESTÁTICA: llega por la URL (?campo=marca&q=pelikano) al pulsar
  // "Buscar". El servidor consulta la BD y devuelve la página ya filtrada.
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const campo: CampoBusqueda =
    typeof sp.campo === "string" && sp.campo in CAMPOS_BUSQUEDA
      ? (sp.campo as CampoBusqueda)
      : "nombre";
  // Pestaña: productos activos (por defecto) o desactivados (eliminación lógica).
  const vista: "activos" | "desactivados" = sp.vista === "desactivados" ? "desactivados" : "activos";

  const supabase = await createClient();
  let consulta = supabase
    .from("productos")
    .select(PRODUCTO_SELECT)
    .eq("activo", vista === "activos")
    .order("codigo");
  const termino = limpiarTermino(q);
  if (termino) consulta = consulta.ilike(campo, `%${termino}%`);

  const [productosRes, categoriasRes, totalRes] = await Promise.all([
    consulta,
    supabase.from("categorias").select("*").order("id"),
    supabase.from("productos").select("tipo, activo"),
  ]);

  const todos = totalRes.data ?? [];
  const activos = todos.filter((p) => p.activo);
  const resumen = {
    total: activos.length,
    productos: activos.filter((p) => p.tipo === "Producto").length,
    servicios: activos.filter((p) => p.tipo === "Servicio").length,
    desactivados: todos.length - activos.length,
  };

  return (
    <AdminPanel
      productos={(productosRes.data ?? []) as Producto[]}
      categorias={(categoriasRes.data ?? []) as Categoria[]}
      resumen={resumen}
      busquedaEstatica={{ q, campo }}
      vista={vista}
      errorBD={productosRes.error?.message ?? null}
    />
  );
}
