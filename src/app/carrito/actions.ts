"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { obtenerUsuarioActual } from "@/lib/auth";

export type ResultadoCompra = { ok: true; pedidoId: number } | { ok: false; mensaje: string };

type DatosCompra = {
  items: { producto_id: number; cantidad: number }[];
  nombre: string;
  dni: string;
  telefono: string;
  direccion: string;
  clave: string; // id único de este intento de compra (evita duplicados)
};

/**
 * PAGAR el carrito. Toda la lógica crítica (precios, ofertas, stock) la hace la
 * función registrar_compra() de la BD en una sola transacción, bloqueando el
 * stock: así dos compras al mismo tiempo no pueden vender la misma unidad.
 */
export async function comprar(datos: DatosCompra): Promise<ResultadoCompra> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return { ok: false, mensaje: "Inicia sesión para completar tu compra." };

  const items = (Array.isArray(datos.items) ? datos.items : [])
    .map((i) => ({ producto_id: Number(i.producto_id), cantidad: Number(i.cantidad) }))
    .filter((i) => Number.isInteger(i.producto_id) && Number.isInteger(i.cantidad) && i.cantidad > 0);
  if (items.length === 0) return { ok: false, mensaje: "Tu carrito está vacío." };

  const nombre = String(datos.nombre ?? "").trim();
  const dni = String(datos.dni ?? "").trim();
  if (nombre.length < 3) return { ok: false, mensaje: "Escribe tu nombre completo." };
  if (!/^\d{8}$/.test(dni)) return { ok: false, mensaje: "El DNI debe tener 8 dígitos." };

  const clave = /^[0-9a-f-]{36}$/i.test(String(datos.clave)) ? datos.clave : null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("registrar_compra", {
    p_items: items,
    p_nombre: nombre.slice(0, 120),
    p_dni: dni,
    p_telefono: String(datos.telefono ?? "").trim().slice(0, 20),
    p_direccion: String(datos.direccion ?? "").trim().slice(0, 200),
    p_clave: clave,
  });

  if (error) {
    if (/could not find the function|does not exist/i.test(error.message)) {
      return {
        ok: false,
        mensaje: "Falta preparar la base de datos: ejecuta supabase/mym_muebleria.sql en Supabase.",
      };
    }
    return { ok: false, mensaje: error.message };
  }

  // El stock cambió: refrescar catálogo y panel.
  revalidatePath("/productos", "layout");
  revalidatePath("/");
  revalidatePath("/admin", "layout");
  return { ok: true, pedidoId: Number(data) };
}
