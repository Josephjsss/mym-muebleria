import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/site/navbar";
import { SiteFooter } from "@/components/site/footer";
import { ProductImage } from "@/components/site/product-image";
import { ProductCard } from "@/components/site/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { company } from "@/data/company";
import { PRODUCTO_SELECT, formatoPrecio, type Producto } from "@/lib/types";
import { ArrowLeft, Clock, MessageCircle, Tag, Layers, Hash } from "lucide-react";

export default async function ProductoDetallePage(props: PageProps<"/productos/[id]">) {
  const { id } = await props.params;
  const idNumero = Number(id);
  if (!Number.isInteger(idNumero)) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("productos")
    .select(PRODUCTO_SELECT)
    .eq("id", idNumero)
    .maybeSingle();
  if (!data) notFound();
  const producto = data as Producto;

  const { data: relacionados } = await supabase
    .from("productos")
    .select(PRODUCTO_SELECT)
    .eq("categoria_id", producto.categoria_id)
    .neq("id", producto.id)
    .order("codigo")
    .limit(4);

  const whatsapp = `https://wa.me/51${company.whatsapp[0].replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hola, me interesa: ${producto.nombre} (${producto.codigo}).`
  )}`;

  return (
    <>
      <Navbar active="/productos" />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <Link
            href="/productos"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver al catálogo
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-muted shadow-sm">
              <ProductImage
                src={producto.imagen_url}
                alt={producto.nombre}
                sizes="(min-width: 1024px) 55vw, 100vw"
                priority
              />
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={producto.tipo === "Producto" ? "secondary" : "outline"}>
                  {producto.tipo}
                </Badge>
                <span className="font-mono text-xs text-muted-foreground">{producto.codigo}</span>
              </div>
              <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight">
                {producto.nombre}
              </h1>
              <p className="mt-3 font-heading text-3xl font-bold text-primary">
                {producto.tipo === "Servicio" && Number(producto.precio) > 0 && (
                  <span className="mr-1.5 text-base font-medium text-muted-foreground">desde</span>
                )}
                {formatoPrecio(producto.precio)}
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">{producto.descripcion}</p>

              <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <Dato icono={Layers} etiqueta="Categoría" valor={producto.categoria?.nombre ?? "—"} />
                <Dato icono={Tag} etiqueta="Marca" valor={producto.marca} />
                <Dato icono={Clock} etiqueta="Duración / entrega" valor={producto.duracion ?? "No aplica"} />
                <Dato icono={Hash} etiqueta="Código" valor={producto.codigo} />
              </dl>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  nativeButton={false}
                  className="shadow-md shadow-primary/20"
                  render={<a href={whatsapp} target="_blank" rel="noopener noreferrer" />}
                >
                  <MessageCircle className="size-4" />
                  Consultar por WhatsApp
                </Button>
                <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/productos" />}>
                  Ver más productos
                </Button>
              </div>
            </div>
          </div>

          {relacionados && relacionados.length > 0 && (
            <section className="mt-16">
              <h2 className="font-heading text-xl font-semibold">
                Más en {producto.categoria?.nombre}
              </h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {(relacionados as Producto[]).map((p) => (
                  <ProductCard key={p.id} producto={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Dato({
  icono: Icono,
  etiqueta,
  valor,
}: {
  icono: typeof Tag;
  etiqueta: string;
  valor: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icono className="size-3.5" />
        {etiqueta}
      </dt>
      <dd className="mt-1 font-medium">{valor}</dd>
    </div>
  );
}
