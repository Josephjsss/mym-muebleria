"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useUnidadesCarrito } from "@/lib/carrito";

/** Ícono del carrito en el menú, con el número de unidades. */
export function CarritoBoton() {
  const unidades = useUnidadesCarrito();
  return (
    <Link
      href="/carrito"
      aria-label={unidades ? `Carrito: ${unidades} producto(s)` : "Carrito vacío"}
      className="relative flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
    >
      <ShoppingCart className="size-5" />
      {unidades > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
          {unidades > 99 ? "99+" : unidades}
        </span>
      )}
    </Link>
  );
}
