import { PaginaCargando, TituloCargando } from "@/components/site/esqueletos";
import { Skeleton } from "@/components/ui/skeleton";

/** Se muestra al instante mientras carga el carrito. */
export default function CargandoCarrito() {
  return (
    <PaginaCargando active="/productos" fondo="bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <TituloCargando />
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-px overflow-hidden rounded-2xl border bg-card shadow-sm">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex gap-4 p-4">
                <Skeleton className="size-20 shrink-0 rounded-lg sm:size-24" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    </PaginaCargando>
  );
}
