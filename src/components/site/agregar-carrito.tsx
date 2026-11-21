"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { carrito, useCarrito } from "@/lib/carrito";
import type { Producto } from "@/lib/types";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";

/** Selector de cantidad + botón «Agregar al carrito» (página de detalle). */
export function AgregarCarrito({
  producto,
}: {
  producto: Pick<Producto, "id" | "nombre" | "imagen_url" | "stock">;
}) {
  const items = useCarrito();
  const stock = Number(producto.stock ?? 0);
  const enCarrito = items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0;
  const disponible = Math.max(0, stock - enCarrito);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  if (stock <= 0) {
    return (
      <p className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
        <b className="text-foreground">Agotado.</b> Escríbenos por WhatsApp y te avisamos cuando vuelva.
      </p>
    );
  }

  function agregar() {
    carrito.agregar(
      { producto_id: producto.id, nombre: producto.nombre, imagen_url: producto.imagen_url },
      Math.min(cantidad, disponible),
      stock
    );
    setCantidad(1);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2500);
  }

  const cantidadValida = Math.min(cantidad, Math.max(disponible, 1));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 items-center rounded-lg border">
          <button
            type="button"
            aria-label="Menos"
            disabled={cantidadValida <= 1}
            onClick={() => setCantidad(Math.max(1, cantidadValida - 1))}
            className="flex size-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center font-medium tabular-nums" aria-live="polite">
            {cantidadValida}
          </span>
          <button
            type="button"
            aria-label="Más"
            disabled={cantidadValida >= disponible}
            onClick={() => setCantidad(Math.min(disponible, cantidadValida + 1))}
            className="flex size-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <Button size="lg" onClick={agregar} disabled={disponible <= 0} className="shadow-md shadow-primary/20">
          {agregado ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
          {agregado ? "Agregado" : "Agregar al carrito"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {stock <= 5 ? `¡Últimas ${stock} unidades!` : `${stock} unidades disponibles`}
        {enCarrito > 0 && (
          <>
            {" · "}
            <Link href="/carrito" className="font-medium text-primary hover:underline">
              Tienes {enCarrito} en el carrito
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
