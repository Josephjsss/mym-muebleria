import { Skeleton } from "@/components/ui/skeleton";

/**
 * Se muestra al instante al entrar a una página del admin. La cabecera NO
 * desaparece: está en el layout, que se mantiene al cambiar de pestaña.
 */
export default function CargandoAdmin() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6" aria-busy="true" aria-label="Cargando">
      <span className="sr-only">Cargando…</span>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[74px] rounded-xl bg-card" />
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-5 w-48" />
            <Skeleton className="mt-4 h-52" />
          </div>
        ))}
      </div>
    </main>
  );
}
