import { PaginaCargando } from "@/components/site/esqueletos";
import { Skeleton } from "@/components/ui/skeleton";

/** Se muestra al instante mientras carga el detalle de un producto. */
export default function CargandoProducto() {
  return (
    <PaginaCargando active="/productos">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Skeleton className="h-4 w-36" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <Skeleton className="aspect-[4/3] rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-4/5" />
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-16 w-full" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-10 w-56" />
          </div>
        </div>
      </div>
    </PaginaCargando>
  );
}
