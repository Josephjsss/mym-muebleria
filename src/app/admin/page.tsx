import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
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
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Panel de administración · M&M Mueblería",
};

export default async function AdminPage(props: PageProps<"/admin">) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect("/?login=1");

  if (usuario.rol !== "admin") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center">
        <ShieldAlert className="size-12 text-destructive" />
        <h1 className="font-heading text-2xl font-bold">Acceso restringido</h1>
        <p className="max-w-sm text-muted-foreground">
          Tu cuenta ({usuario.correo}) es de cliente. Solo el administrador puede
          gestionar los productos.
        </p>
        <Link href="/" className="mt-2 text-sm font-medium text-primary hover:underline">
          Volver al inicio
        </Link>
      </main>
    );
  }

  // BÚSQUEDA ESTÁTICA: llega por la URL (?campo=marca&q=pelikano) al pulsar
  // "Buscar". El servidor consulta la BD y devuelve la página ya filtrada.
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const campo: CampoBusqueda =
    typeof sp.campo === "string" && sp.campo in CAMPOS_BUSQUEDA
      ? (sp.campo as CampoBusqueda)
      : "nombre";

  const supabase = await createClient();
  let consulta = supabase.from("productos").select(PRODUCTO_SELECT).order("codigo");
  const termino = limpiarTermino(q);
  if (termino) consulta = consulta.ilike(campo, `%${termino}%`);

  const [productosRes, categoriasRes, totalRes] = await Promise.all([
    consulta,
    supabase.from("categorias").select("*").order("id"),
    supabase.from("productos").select("tipo"),
  ]);

  const todos = totalRes.data ?? [];
  const resumen = {
    total: todos.length,
    productos: todos.filter((p) => p.tipo === "Producto").length,
    servicios: todos.filter((p) => p.tipo === "Servicio").length,
    categorias: categoriasRes.data?.length ?? 0,
  };

  return (
    <AdminPanel
      usuario={usuario}
      productos={(productosRes.data ?? []) as Producto[]}
      categorias={(categoriasRes.data ?? []) as Categoria[]}
      resumen={resumen}
      busquedaEstatica={{ q, campo }}
      errorBD={productosRes.error?.message ?? null}
    />
  );
}
