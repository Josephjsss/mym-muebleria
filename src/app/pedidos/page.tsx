import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/site/navbar";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { obtenerUsuarioActual } from "@/lib/auth";
import { numeroBoleta, soles, type Pedido } from "@/lib/types";
import { ChevronRight, Receipt } from "lucide-react";

export const metadata: Metadata = {
  title: "Mis pedidos · M&M Mueblería",
};

export default async function MisPedidosPage() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect("/?login=1");

  // Solo los pedidos del usuario (filtro + RLS en la BD).
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pedidos")
    .select("id, serie, numero, total, estado, creado_en, items:pedido_items(cantidad)")
    .eq("usuario_id", usuario.id)
    .order("creado_en", { ascending: false });
  const pedidos = (data ?? []) as (Pick<Pedido, "id" | "serie" | "numero" | "total" | "estado" | "creado_en"> & {
    items: { cantidad: number }[];
  })[];

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Mi cuenta</span>
          <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">Mis pedidos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tus compras y sus boletas.</p>

          {error ? (
            <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              No se pudieron leer los pedidos: {error.message}
            </p>
          ) : pedidos.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border bg-card px-6 py-14 text-center">
              <Receipt className="size-10 text-muted-foreground/50" />
              <p className="font-medium">Aún no tienes pedidos</p>
              <Button nativeButton={false} render={<Link href="/productos" />}>
                Ver catálogo
              </Button>
            </div>
          ) : (
            <ul className="mt-6 divide-y overflow-hidden rounded-2xl border bg-card shadow-sm">
              {pedidos.map((p) => (
                <li key={p.id}>
                  <Link href={`/pedidos/${p.id}`} className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/50">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Receipt className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm font-semibold">{numeroBoleta(p)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.creado_en).toLocaleDateString("es-PE", { timeZone: "America/Lima", dateStyle: "medium" })}
                        {" · "}
                        {p.items.reduce((s, i) => s + i.cantidad, 0)} unidad(es) · {p.estado}
                      </p>
                    </div>
                    <p className="font-heading font-bold tabular-nums">{soles(p.total)}</p>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
