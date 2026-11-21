import { formatoPrecio, precioFinal, type Producto } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Precio de un producto. Si está en oferta muestra el precio de lista tachado,
 * el precio final y el % de descuento.
 */
export function Precio({
  producto,
  tamano = "md",
}: {
  producto: Pick<Producto, "precio" | "descuento" | "tipo">;
  tamano?: "md" | "lg";
}) {
  const enOferta = Number(producto.descuento) > 0 && Number(producto.precio) > 0;
  const desde = producto.tipo === "Servicio" && Number(producto.precio) > 0;
  const grande = tamano === "lg";

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <p
        className={cn(
          "font-heading font-bold",
          grande ? "text-3xl" : "text-lg",
          enOferta || grande ? "text-primary" : "text-foreground"
        )}
      >
        {desde && (
          <span className={cn("mr-1 font-medium text-muted-foreground", grande ? "text-base" : "text-xs")}>
            desde
          </span>
        )}
        {formatoPrecio(precioFinal(producto))}
      </p>
      {enOferta && (
        <>
          <span className={cn("text-muted-foreground line-through", grande ? "text-lg" : "text-xs")}>
            {formatoPrecio(producto.precio)}
          </span>
          <span
            className={cn(
              "rounded-md bg-secondary font-semibold text-secondary-foreground",
              grande ? "px-2 py-0.5 text-sm" : "px-1.5 py-px text-[11px]"
            )}
          >
            -{producto.descuento}%
          </span>
        </>
      )}
    </div>
  );
}
