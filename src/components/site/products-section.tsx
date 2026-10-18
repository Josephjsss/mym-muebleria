import Link from "next/link";
import { Reveal } from "@/components/reactbits/Reveal";
import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { PRODUCTO_SELECT, type Producto } from "@/lib/types";
import { ArrowRight } from "lucide-react";

// Un producto destacado por categoría, leídos desde la base de datos.
const DESTACADOS = ["PRD-002", "PRD-004", "PRD-010", "PRD-013", "PRD-016", "SRV-001"];

export async function ProductsSection() {
  const supabase = await createClient();
  const [{ data }, { count }] = await Promise.all([
    supabase.from("productos").select(PRODUCTO_SELECT).in("codigo", DESTACADOS).order("codigo"),
    supabase.from("productos").select("id", { count: "exact", head: true }),
  ]);
  const productos = (data ?? []) as Producto[];

  return (
    <section id="productos" className="relative py-16">
      <div className="relative mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Catálogo
              </span>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                Productos y servicios
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Fabricamos e instalamos muebles en melamina, y acompañamos cada
                proyecto desde la cotización hasta la entrega.
              </p>
            </div>
            <Button nativeButton={false} variant="outline" render={<Link href="/productos" />}>
              Ver los {count ?? ""} productos
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Reveal>

        {productos.length === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            El catálogo se carga desde la base de datos. Configura Supabase para verlo aquí.
          </p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {productos.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 0.08}>
                <ProductCard producto={p} />
              </Reveal>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button size="lg" nativeButton={false} className="shadow-md shadow-primary/20" render={<Link href="/productos" />}>
            Explorar el catálogo completo
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
