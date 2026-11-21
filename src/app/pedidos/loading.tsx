import { PaginaCargando, TituloCargando } from "@/components/site/esqueletos";
import { Skeleton } from "@/components/ui/skeleton";

/** Se muestra al instante mientras cargan los pedidos o la boleta. */
export default function CargandoPedidos() {
  return (
    <PaginaCargando fondo="bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <TituloCargando />
        <Skeleton className="mt-6 h-96 rounded-2xl" />
      </div>
    </PaginaCargando>
  );
}
