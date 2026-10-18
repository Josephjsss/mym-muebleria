import { ImageIcon } from "lucide-react";
import { cn } from "cn";

/**
 * Bloque de reemplazo mientras no tenemos las fotos reales del catálogo.
 * Cuando la empresa entregue fotos, poner los archivos en /public/images
 * y cambiar este componente por <Image src="/images/xxx.jpg" ... />.
 */
export function PlaceholderImage({
  label,
  className,
  variant = "light",
}: {
  label: string;
  className?: string;
  variant?: "light" | "dark";
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center p-4",
        variant === "light"
          ? "bg-muted/60 border-muted-foreground/20 text-muted-foreground"
          : "bg-primary/10 border-primary/20 text-primary",
        className
      )}
    >
      <ImageIcon className="size-6 opacity-60" />
      <span className="text-xs font-medium leading-tight">{label}</span>
    </div>
  );
}
