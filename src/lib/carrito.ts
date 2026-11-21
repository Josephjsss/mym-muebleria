"use client";

import { useSyncExternalStore } from "react";

/**
 * CARRITO DE COMPRAS (lado del navegador).
 * Se guarda en localStorage para que no se pierda al recargar o cambiar de página.
 * Solo guarda id + cantidad (y una copia de nombre/imagen para mostrarlo rápido);
 * los precios y el stock reales se vuelven a leer de la BD en /carrito y, al
 * pagar, los calcula la propia BD (función registrar_compra).
 */
export type ItemCarrito = {
  producto_id: number;
  cantidad: number;
  nombre: string;
  imagen_url: string;
};

const CLAVE = "mym-carrito";
const MAX_POR_PRODUCTO = 99;
const VACIO: ItemCarrito[] = [];

let items: ItemCarrito[] = VACIO;
let cargado = false;
const oyentes = new Set<() => void>();

function leer(): ItemCarrito[] {
  if (!cargado) {
    cargado = true;
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? "[]");
      if (Array.isArray(guardado)) {
        items = guardado.filter(
          (i) => Number.isInteger(i?.producto_id) && Number.isInteger(i?.cantidad) && i.cantidad > 0
        );
      }
    } catch {
      items = VACIO;
    }
  }
  return items;
}

function guardar(nuevos: ItemCarrito[]) {
  items = nuevos;
  try {
    localStorage.setItem(CLAVE, JSON.stringify(nuevos));
  } catch {
    // Navegación privada o almacenamiento lleno: el carrito sigue en memoria.
  }
  oyentes.forEach((o) => o());
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  // Si el carrito cambia en otra pestaña, se actualiza aquí también.
  const alCambiarOtraPestana = (e: StorageEvent) => {
    if (e.key === CLAVE) {
      cargado = false;
      oyente();
    }
  };
  window.addEventListener("storage", alCambiarOtraPestana);
  return () => {
    oyentes.delete(oyente);
    window.removeEventListener("storage", alCambiarOtraPestana);
  };
}

export const carrito = {
  agregar(item: Omit<ItemCarrito, "cantidad">, cantidad = 1, maximo = MAX_POR_PRODUCTO) {
    const actual = leer();
    const existente = actual.find((i) => i.producto_id === item.producto_id);
    const tope = Math.min(maximo, MAX_POR_PRODUCTO);
    if (existente) {
      guardar(
        actual.map((i) =>
          i.producto_id === item.producto_id ? { ...i, cantidad: Math.min(i.cantidad + cantidad, tope) } : i
        )
      );
    } else {
      guardar([...actual, { ...item, cantidad: Math.min(cantidad, tope) }]);
    }
  },
  cambiarCantidad(productoId: number, cantidad: number) {
    if (cantidad < 1) return carrito.quitar(productoId);
    guardar(
      leer().map((i) =>
        i.producto_id === productoId ? { ...i, cantidad: Math.min(cantidad, MAX_POR_PRODUCTO) } : i
      )
    );
  },
  quitar(productoId: number) {
    guardar(leer().filter((i) => i.producto_id !== productoId));
  },
  vaciar() {
    guardar([]);
  },
};

/** Hook: devuelve los items del carrito y se actualiza al cambiar. */
export function useCarrito() {
  return useSyncExternalStore(suscribir, leer, () => VACIO);
}

/** Total de unidades (para el contador del menú). */
export function useUnidadesCarrito() {
  const lista = useCarrito();
  return lista.reduce((suma, i) => suma + i.cantidad, 0);
}
