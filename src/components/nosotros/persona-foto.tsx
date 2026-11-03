import Image from "next/image";
import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

/** Foto circular de una persona; si aún no hay foto muestra un ícono. */
export function PersonaFoto({
  foto,
  nombre,
  className,
}: {
  foto?: string;
  nombre: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-primary ring-4 ring-white shadow-md",
        className
      )}
    >
      {foto ? (
        <Image src={foto} alt={`Foto de ${nombre}`} fill sizes="128px" className="object-cover" />
      ) : (
        <UserRound className="size-1/2 opacity-70" aria-label={`Foto de ${nombre} (pendiente)`} />
      )}
    </span>
  );
}
