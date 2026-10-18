import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { SiteFooter } from "@/components/site/footer";
import { Catalogo } from "@/components/site/catalogo";
import { ProductsSlider } from "@/components/site/products-slider";
import { createClient } from "@/lib/supabase/server";
import { PRODUCTO_SELECT, type Categoria, type Producto } from "@/lib/types";
import { DatabaseZap } from "lucide-react";

export const metadata: Metadata = {
  title: "Productos y servicios · M&M Mueblería",
  description: "Catálogo de muebles en melamina y servicios del taller M&M.",
};

export default async function ProductosPage(props: PageProps<"/productos">) {
  const { categoria } = await props.searchParams;
  const supabase = await createClient();

  const categoriasRes = await supabase.from("categorias").select("*").order("id");
  const categorias = (categoriasRes.data ?? []) as Categoria[];
  // ?categoria=Roperos (desde los íconos del inicio) filtra desde la primera carga.
  const categoriaInicial =
    categorias.find((c) => c.nombre.toLowerCase() === String(categoria ?? "").toLowerCase()) ?? null;

  let consulta = supabase.from("productos").select(PRODUCTO_SELECT).order("codigo");
  if (categoriaInicial) consulta = consulta.eq("categoria_id", categoriaInicial.id);
  const productosRes = await consulta;

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

        <div className="mx-auto max-w-6xl px-4 pb-16">
          {error ? (
            <div className="mt-10 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm">
              <DatabaseZap className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div>
                <p className="font-medium">No se pudo conectar con la base de datos.</p>
                <p className="mt-1 text-muted-foreground">
                  Revisa el archivo <code>.env.local</code> y que el script{" "}
                  <code>supabase/mym_avance2.sql</code> se haya ejecutado. Detalle: {error.message}
                </p>
              </div>
            </div>
          ) : (
            <Catalogo
              // key: al cambiar ?categoria= (botones del slider) el catálogo se reinicia con ese filtro.
              key={categoriaInicial?.id ?? "todas"}
              productosIniciales={(productosRes.data ?? []) as Producto[]}
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
