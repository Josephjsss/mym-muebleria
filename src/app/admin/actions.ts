"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { obtenerUsuarioActual } from "@/lib/auth";

export type ResultadoAccion = { ok: boolean; mensaje: string } | null;

const BUCKET = "productos";

/** Solo el administrador puede modificar productos (la BD también lo exige con RLS). */
async function exigirAdmin() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "admin") {
    throw new Error("No autorizado: solo el administrador puede hacer esto.");
  }
  return usuario;
}

function revalidarCatalogo() {
  revalidatePath("/admin");
  revalidatePath("/productos");
  revalidatePath("/");
}

/** Genera el siguiente código visible: PRD-022, SRV-006, etc. */
async function siguienteCodigo(tipo: "Producto" | "Servicio") {
  const prefijo = tipo === "Servicio" ? "SRV" : "PRD";
  const supabase = await createClient();
  const { data } = await supabase
    .from("productos")
    .select("codigo")
    .like("codigo", `${prefijo}-%`);
  const mayor = (data ?? []).reduce((max, fila) => {
    const n = Number(String(fila.codigo).split("-")[1]);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return `${prefijo}-${String(mayor + 1).padStart(3, "0")}`;
}

/** CREAR o EDITAR (si viene un id) un producto/servicio. */
export async function guardarProducto(
  _prev: ResultadoAccion,
  formData: FormData
): Promise<ResultadoAccion> {
  try {
    const usuario = await exigirAdmin();

    const id = Number(formData.get("id")) || null;
    const tipo = formData.get("tipo") === "Servicio" ? "Servicio" : "Producto";
    const datos = {
      nombre: String(formData.get("nombre") ?? "").trim(),
      descripcion: String(formData.get("descripcion") ?? "").trim(),
      marca: String(formData.get("marca") ?? "").trim(),
      tipo,
      duracion: String(formData.get("duracion") ?? "").trim() || null,
      precio: Number(formData.get("precio")),
      imagen_url: String(formData.get("imagen_url") ?? "").trim(),
      categoria_id: Number(formData.get("categoria_id")),
    };

    // Validaciones (la BD también tiene NOT NULL y CHECK).
    if (!datos.nombre) return { ok: false, mensaje: "El nombre es obligatorio." };
    if (!datos.descripcion) return { ok: false, mensaje: "La descripción es obligatoria." };
    if (!datos.marca) return { ok: false, mensaje: "La marca es obligatoria." };
    if (!Number.isFinite(datos.precio) || datos.precio < 0)
      return { ok: false, mensaje: "El precio debe ser un número mayor o igual a 0." };
    if (!datos.categoria_id) return { ok: false, mensaje: "Elige una categoría." };
    if (!datos.imagen_url) return { ok: false, mensaje: "Sube una imagen del producto." };

    const supabase = await createClient();
    let codigo = String(formData.get("codigo") ?? "").trim().toUpperCase();

    if (id) {
      // EDITAR
      const { error } = await supabase
        .from("productos")
        .update({ ...datos, ...(codigo ? { codigo } : {}) })
        .eq("id", id);
      if (error) return { ok: false, mensaje: traducirError(error.message) };
      revalidarCatalogo();
      return { ok: true, mensaje: `«${datos.nombre}» se actualizó correctamente.` };
    }

    // CREAR
    if (!codigo) codigo = await siguienteCodigo(tipo);
    const { error } = await supabase
      .from("productos")
      .insert({ ...datos, codigo, registrado_por: usuario.id });
    if (error) return { ok: false, mensaje: traducirError(error.message) };
    revalidarCatalogo();
    return { ok: true, mensaje: `«${datos.nombre}» se registró con el código ${codigo}.` };
  } catch (e) {
    return { ok: false, mensaje: e instanceof Error ? e.message : "Error inesperado." };
  }
}

/** ELIMINAR un producto (y su imagen si estaba en Supabase Storage). */
export async function eliminarProducto(id: number): Promise<ResultadoAccion> {
  try {
    await exigirAdmin();
    const supabase = await createClient();

    const { data: producto } = await supabase
      .from("productos")
      .select("nombre, imagen_url")
      .eq("id", id)
      .maybeSingle();
    if (!producto) return { ok: false, mensaje: "El producto ya no existe." };

    const { error } = await supabase.from("productos").delete().eq("id", id);
    if (error) return { ok: false, mensaje: traducirError(error.message) };

    // Borra la foto subida (las fotos de /public/images no se tocan).
    const marca = `/storage/v1/object/public/${BUCKET}/`;
    const url = String(producto.imagen_url);
    if (url.includes(marca)) {
      await supabase.storage.from(BUCKET).remove([decodeURIComponent(url.split(marca)[1])]);
    }

    revalidarCatalogo();
    return { ok: true, mensaje: `«${producto.nombre}» se eliminó.` };
  } catch (e) {
    return { ok: false, mensaje: e instanceof Error ? e.message : "Error inesperado." };
  }
}

function traducirError(mensaje: string) {
  if (/duplicate key.*codigo/i.test(mensaje)) return "Ya existe un producto con ese código.";
  if (/row-level security/i.test(mensaje)) return "La base de datos rechazó la operación: tu usuario no es administrador.";
  return mensaje;
}
