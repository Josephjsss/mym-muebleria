import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Imagen de producto. Las fotos iniciales están en /public/images y las
 * que sube el administrador viven en Supabase Storage (URL absoluta).
 */
export function ProductImage({
  src,
  alt,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  className,
  priority,
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={/^https?:\/\//.test(src)}
      className={cn("object-cover", className)}
    />
  );
}
