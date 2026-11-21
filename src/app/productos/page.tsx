import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { SiteFooter } from "@/components/site/footer";
import { Catalogo } from "@/components/site/catalogo";
import { ProductsSlider } from "@/components/site/products-slider";
import { createClient } from "@/lib/supabase/server";
import { PRODUCTO_SELECT, type Categoria, type Producto } from "@/lib/types";
import { ProductCard } from "@/components/site/product-card";
import { BadgePercent, DatabaseZap } from "lucide-react";

export const metadata: Metadata = {
  title: "Productos y servicios · M&M Mueblería",
  description: "Catálogo de muebles en melamina y servicios del taller M&M.",
};

export default async function ProductosPage(props: PageProps<"/productos">) {
  const { categoria } = await props.searchParams;
  const supabase = await createClient();

  // Las 3 consultas van EN PARALELO (una sola espera a la BD en vez de dos).
  const [categoriasRes, productosRes, ofertasRes] = await Promise.all([
    supabase.from("categorias").select("*").order("id"),
    // Solo productos activos (los desactivados se gestionan en el panel).
    supabase.from("productos").select(PRODUCTO_SELECT).eq("activo", true).order("codigo"),
    // OFERTAS: productos activos con descuento (mínimo 5 %, lo exige la BD).
    supabase
      .from("productos")
      .select(PRODUCTO_SELECT)
      .eq("activo", true)
      .gt("descuento", 0)
      .order("descuento", { ascending: false })
      .limit(8),
  ]);
  const categorias = (categoriasRes.data ?? []) as Categoria[];
  // ?categoria=Roperos (desde los íconos del inicio) filtra desde la primera carga.
  const categoriaInicial =
    categorias.find((c) => c.nombre.toLowerCase() === String(categoria ?? "").toLowerCase()) ?? null;
  const productos = ((productosRes.data ?? []) as Producto[]).filter(
    (p) => !categoriaInicial || p.categoria_id === categoriaInicial.id
  );
  const ofertas = (ofertasRes.data ?? []) as Producto[];

  const error = productosRes.error || categoriasRes.error;

  return (
    <>
      <Navbar active="/productos" />
      <main className="flex-1">
        {/* Encabezado + slider en un solo bloque: el fondo se desvanece sin línea divisoria. */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 via-background to-background">
          <div className="bg-dot-pattern pointer-events-none absolute inset-0 text-primary/[0.1] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="relative mx-auto max-w-6xl px-4 pb-2 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Catálogo
            </span>
            <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Productos y servicios
            </h1>
            <p className="mt-2 text-muted-foreground">
              Muebles en melamina hechos en nuestro taller de Quilmaná, desde el diseño hasta la instalación.
            </p>

            <div className="mt-6">
              <ProductsSlider />
            </div>
          </div>
        </section>

        {!error && ofertas.length > 0 && (
          <section id="ofertas" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-10">
            <div className="flex items-center gap-2 text-primary">
              <BadgePercent className="size-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Ofertas</span>
            </div>
            <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight">Precios rebajados</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Descuentos desde el 5 % en muebles seleccionados, hasta agotar stock.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {ofertas.map((p) => (
                <ProductCard key={p.id} producto={p} />
              ))}
            </div>
          </section>
        )}

        <div className="mx-auto max-w-6xl px-4 pb-16">
          {error ? (
            <div className="mt-10 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm">
              <DatabaseZap className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div>
                <p className="font-medium">No se pudo conectar con la base de datos.</p>
                <p className="mt-1 text-muted-foreground">
                  Revisa el archivo <code>.env.local</code> y que el script{" "}
                  <code>supabase/mym_muebleria.sql</code> se haya ejecutado. Detalle: {error.message}
                </p>
              </div>
            </div>
          ) : (
            <Catalogo
              // key: al cambiar ?categoria= (botones del slider) el catálogo se reinicia con ese filtro.
              key={categoriaInicial?.id ?? "todas"}
              productosIniciales={productos}
              categorias={categorias}
              categoriaInicial={categoriaInicial?.id ?? null}
            />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
