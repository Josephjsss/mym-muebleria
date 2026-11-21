import { Navbar } from "@/components/site/navbar";
import { Skeleton } from "@/components/ui/skeleton";

// Pantallas de carga (las usan los archivos loading.tsx).
// Se muestran AL INSTANTE al navegar, mientras el servidor consulta la BD.

/** Página pública: menú real + contenido gris animado. */
export function PaginaCargando({
  active,
  fondo,
  children,
}: {
  active?: string;
  fondo?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar active={active} />
      <main className={"flex-1 " + (fondo ?? "")} aria-busy="true" aria-label="Cargando">
        <span className="sr-only">Cargando…</span>
        {children}
      </main>
    </>
  );
}

export function TarjetaCargando() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
}

export function TituloCargando() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-64 max-w-full" />
    </div>
  );
}
