"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { carrito, useCarrito } from "@/lib/carrito";
import { comprar } from "@/app/carrito/actions";
import { ProductImage } from "@/components/site/product-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IGV, precioFinal, sePuedeComprar, soles, type Producto } from "@/lib/types";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  LogIn,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from "lucide-react";

type ProductoCarrito = Pick<
  Producto,
  "id" | "codigo" | "nombre" | "precio" | "descuento" | "stock" | "tipo" | "imagen_url" | "activo"
>;

export function CarritoVista({ usuario }: { usuario: { nombre: string; rol: string } | null }) {
  const router = useRouter();
  const items = useCarrito();
  // Datos de la BD + para qué ids se consultaron (si no coinciden, está cargando).
  const [consulta, setConsulta] = useState<{ clave: string; mapa: Map<number, ProductoCarrito> } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pagando, iniciarPago] = useTransition();

  // Ids del carrito como texto: solo se vuelve a consultar si cambian los productos.
  const claveIds = items.map((i) => i.producto_id).sort((a, b) => a - b).join(",");

  // Precios y stock ACTUALES desde la BD (no los guardados en el navegador).
  useEffect(() => {
    if (!claveIds) return;
    let cancelado = false;
    leerProductos(claveIds).then((mapa) => {
      if (!cancelado) setConsulta({ clave: claveIds, mapa });
    });
    return () => {
      cancelado = true;
    };
  }, [claveIds]);

  const cargando = Boolean(claveIds) && consulta?.clave !== claveIds;
  const productos = cargando ? null : consulta?.mapa ?? null;

  const lineas = useMemo(
    () =>
      items.map((item) => {
        const p = productos?.get(item.producto_id);
        const valido = Boolean(p && p.activo && sePuedeComprar(p));
        const sinStock = valido && p!.stock < item.cantidad;
        return { item, producto: p, valido, sinStock };
      }),
    [items, productos]
  );

  const vendibles = lineas.filter((l) => l.valido && !l.sinStock);
  const subtotal = vendibles.reduce((s, l) => s + Number(l.producto!.precio) * l.item.cantidad, 0);
  const total = vendibles.reduce((s, l) => s + precioFinal(l.producto!) * l.item.cantidad, 0);
  const ahorro = subtotal - total;
  const gravada = total / (1 + IGV);
  const hayProblemas = lineas.some((l) => !l.valido || l.sinStock);

  function pagar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    iniciarPago(async () => {
      const r = await comprar({
        items: vendibles.map((l) => ({ producto_id: l.item.producto_id, cantidad: l.item.cantidad })),
        nombre: String(form.get("nombre") ?? ""),
        dni: String(form.get("dni") ?? ""),
        telefono: String(form.get("telefono") ?? ""),
        direccion: String(form.get("direccion") ?? ""),
      });
      if (!r.ok) {
        setError(r.mensaje);
        // Puede que otro cliente se haya llevado el stock: volver a leerlo.
        setConsulta({ clave: claveIds, mapa: await leerProductos(claveIds) });
        return;
      }
      carrito.vaciar();
      router.push(`/pedidos/${r.pedidoId}?nuevo=1`);
    });
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border bg-card px-6 py-16 text-center shadow-sm">
        <ShoppingCart className="size-12 text-muted-foreground/50" />
        <p className="font-heading text-lg font-semibold">Tu carrito está vacío</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Agrega muebles desde el catálogo. Los servicios a medida se cotizan por WhatsApp.
        </p>
        <Button nativeButton={false} render={<Link href="/productos" />} className="mt-2">
          <ArrowLeft className="size-4" />
          Ir al catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      {/* Productos */}
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <ul className="divide-y">
          {lineas.map(({ item, producto, valido, sinStock }) => {
            const tope = producto ? Math.min(producto.stock, 99) : 99;
            return (
              <li key={item.producto_id} className="flex gap-4 p-4">
                <Link
                  href={`/productos/${item.producto_id}`}
                  className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-muted sm:size-24"
                >
                  <ProductImage src={producto?.imagen_url ?? item.imagen_url} alt={item.nombre} sizes="96px" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/productos/${item.producto_id}`} className="font-medium leading-snug hover:underline">
                        {producto?.nombre ?? item.nombre}
                      </Link>
                      {producto && (
                        <p className="font-mono text-[11px] text-muted-foreground">{producto.codigo}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => carrito.quitar(item.producto_id)}
                      aria-label={`Quitar ${item.nombre}`}
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  {cargando ? (
                    <p className="text-xs text-muted-foreground">Actualizando precio…</p>
                  ) : !valido ? (
                    <p className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="size-3.5" /> Este producto ya no está disponible. Quítalo para continuar.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm">
                        <span className="font-semibold">{soles(precioFinal(producto!))}</span>
                        {producto!.descuento > 0 && (
                          <>
                            <span className="ml-1.5 text-xs text-muted-foreground line-through">
                              {soles(producto!.precio)}
                            </span>
                            <span className="ml-1.5 rounded bg-secondary px-1 text-[11px] font-semibold text-secondary-foreground">
                              -{producto!.descuento}%
                            </span>
                          </>
                        )}
                      </p>
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex h-8 items-center rounded-lg border">
                          <button
                            type="button"
                            aria-label="Menos"
                            onClick={() => carrito.cambiarCantidad(item.producto_id, item.cantidad - 1)}
                            className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium tabular-nums">{item.cantidad}</span>
                          <button
                            type="button"
                            aria-label="Más"
                            disabled={item.cantidad >= tope}
                            onClick={() => carrito.cambiarCantidad(item.producto_id, item.cantidad + 1)}
                            className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <p className="font-heading font-bold tabular-nums">
                          {soles(precioFinal(producto!) * item.cantidad)}
                        </p>
                      </div>
                      {sinStock && (
                        <p className="flex items-center gap-1 text-xs text-destructive">
                          <AlertCircle className="size-3.5" />
                          {producto!.stock === 0
                            ? "Se agotó. Quítalo para continuar."
                            : `Solo quedan ${producto!.stock}. Baja la cantidad para continuar.`}
                          {producto!.stock > 0 && (
                            <button
                              type="button"
                              className="ml-1 font-medium underline"
                              onClick={() => carrito.cambiarCantidad(item.producto_id, producto!.stock)}
                            >
                              Ajustar
                            </button>
                          )}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="flex justify-between border-t px-4 py-3 text-sm">
          <Link href="/productos" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Seguir comprando
          </Link>
          <button type="button" onClick={() => carrito.vaciar()} className="text-muted-foreground hover:text-destructive">
            Vaciar carrito
          </button>
        </div>
      </section>

      {/* Resumen y pago */}
      <aside className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm lg:sticky lg:top-20">
        <h2 className="font-heading text-lg font-semibold">Resumen</h2>
        <dl className="space-y-1.5 text-sm">
          <Fila etiqueta="Subtotal (precio de lista)" valor={soles(subtotal)} />
          {ahorro > 0 && <Fila etiqueta="Descuento por ofertas" valor={`− ${soles(ahorro)}`} destacado />}
          <Fila etiqueta="Op. gravada" valor={soles(gravada)} tenue />
          <Fila etiqueta={`IGV (${IGV * 100} %)`} valor={soles(total - gravada)} tenue />
          <div className="flex items-baseline justify-between border-t pt-2">
            <dt className="font-semibold">Total a pagar</dt>
            <dd className="font-heading text-2xl font-bold text-primary tabular-nums">{soles(total)}</dd>
          </div>
        </dl>

        {!usuario ? (
          <div className="rounded-xl bg-muted/60 p-4 text-sm">
            <p className="font-medium">Inicia sesión para pagar</p>
            <p className="mt-1 text-muted-foreground">
              Así guardamos tu boleta y puedes verla luego en «Mis pedidos».
            </p>
            {/* Recarga completa: el menú abre el diálogo de ingreso con ?login=1 */}
            <Button className="mt-3 w-full" nativeButton={false} render={<a href="/carrito?login=1" />}>
              <LogIn className="size-4" />
              Ingresar o crear cuenta
            </Button>
          </div>
        ) : (
          <form onSubmit={pagar} className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Datos para la boleta</p>
            <Campo id="nombre" etiqueta="Nombre completo *">
              <Input id="nombre" name="nombre" required minLength={3} maxLength={120} defaultValue={usuario.nombre} />
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo id="dni" etiqueta="DNI *">
                <Input id="dni" name="dni" required inputMode="numeric" pattern="\d{8}" maxLength={8} placeholder="8 dígitos" />
              </Campo>
              <Campo id="telefono" etiqueta="Celular">
                <Input id="telefono" name="telefono" type="tel" maxLength={20} placeholder="9xx xxx xxx" />
              </Campo>
            </div>
            <Campo id="direccion" etiqueta="Dirección de entrega">
              <Input id="direccion" name="direccion" maxLength={200} placeholder="Calle, número, distrito" />
            </Campo>

            {error && (
              <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" disabled={pagando || cargando || hayProblemas || vendibles.length === 0}>
              {pagando ? <Loader2 className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />}
              Pagar {soles(total)}
            </Button>
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="mt-px size-3.5 shrink-0 text-primary" />
              Pago simulado para el proyecto: se registra el pedido, se descuenta el stock y se genera tu boleta.
            </p>
          </form>
        )}
      </aside>
    </div>
  );
}

async function leerProductos(claveIds: string) {
  const { data } = await createClient()
    .from("productos")
    .select("id, codigo, nombre, precio, descuento, stock, tipo, imagen_url, activo")
    .in("id", claveIds.split(",").map(Number));
  return new Map(((data ?? []) as ProductoCarrito[]).map((p) => [p.id, p]));
}

function Fila({
  etiqueta,
  valor,
  destacado,
  tenue,
}: {
  etiqueta: string;
  valor: string;
  destacado?: boolean;
  tenue?: boolean;
}) {
  return (
    <div className={"flex justify-between " + (tenue ? "text-xs text-muted-foreground" : "")}>
      <dt>{etiqueta}</dt>
      <dd className={"tabular-nums " + (destacado ? "font-medium text-primary" : "")}>{valor}</dd>
    </div>
  );
}

function Campo({ id, etiqueta, children }: { id: string; etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{etiqueta}</Label>
      {children}
    </div>
  );
}
