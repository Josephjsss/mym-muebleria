import { PaginaCargando, TarjetaCargando, TituloCargando } from "@/components/site/esqueletos";
import { Skeleton } from "@/components/ui/skeleton";

/** Se muestra al instante mientras carga el catálogo. */
export default function CargandoProductos() {
  return (
    <PaginaCargando active="/productos">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <TituloCargando />
        <Skeleton className="mt-6 h-60 rounded-2xl sm:h-80" />
        <Skeleton className="mt-10 h-7 w-48" />
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <TarjetaCargando key={i} />
          ))}
        </div>
      </div>
    </PaginaCargando>
  );
}
