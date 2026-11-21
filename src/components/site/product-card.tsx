import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/site/product-image";
import { Precio } from "@/components/site/precio";
import { sePuedeComprar, type Producto } from "@/lib/types";
import { Clock, ArrowUpRight } from "lucide-react";

export function ProductCard({ producto }: { producto: Producto }) {
  return (
    <Link
      href={`/productos/${producto.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <ProductImage
          src={producto.imagen_url}
          alt={producto.nombre}
          className="transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <Badge
          variant={producto.tipo === "Producto" ? "secondary" : "outline"}
          className="absolute left-3 top-3 bg-background/90 backdrop-blur"
        >
          {producto.tipo}
        </Badge>
        {Number(producto.descuento) > 0 && (
          <span className="absolute bottom-3 left-3 rounded-md bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground shadow-sm">
            Oferta -{producto.descuento}%
          </span>
        )}
        {sePuedeComprar(producto) && producto.stock <= 0 && (
          <span className="absolute bottom-3 right-3 rounded-md bg-foreground/85 px-2 py-0.5 text-xs font-semibold text-background">
            Agotado
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-md bg-background/90 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground backdrop-blur">
          {producto.codigo}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          {producto.categoria?.nombre} · {producto.marca}
        </p>
        <h3 className="font-heading text-base font-semibold leading-snug">
          {producto.nombre}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {producto.descripcion}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <Precio producto={producto} />
            {producto.duracion && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {producto.duracion}
              </p>
            )}
          </div>
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
