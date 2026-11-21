import { cn } from "@/lib/utils";

/** Bloque gris animado que ocupa el lugar del contenido mientras carga. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export { Skeleton };
