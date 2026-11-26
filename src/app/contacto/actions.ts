"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ASUNTOS } from "@/data/contacto";

export type EstadoFormulario = { ok: boolean; mensaje: string } | null;

const texto = (fd: FormData, campo: string) => String(fd.get(campo) ?? "").trim();

function errorBD(mensaje: string) {
  if (/relation .* does not exist|could not find the table/i.test(mensaje)) {
    return "Falta preparar la base de datos: ejecuta supabase/mym_muebleria.sql en Supabase.";
  }
  return "No se pudo enviar. Inténtalo de nuevo en unos minutos.";
}

/** FORMULARIO DE CONTACTO: guarda el mensaje en la tabla mensajes_contacto. */
export async function enviarMensaje(_prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  // Campo trampa: los robots lo llenan, las personas no lo ven.
  if (texto(fd, "sitio_web")) return { ok: true, mensaje: "¡Gracias! Recibimos tu mensaje." };

  const datos = {
    nombre: texto(fd, "nombre"),
    correo: texto(fd, "correo").toLowerCase(),
    telefono: texto(fd, "telefono") || null,
    asunto: texto(fd, "asunto"),
    mensaje: texto(fd, "mensaje"),
  };

  if (datos.nombre.length < 2) return { ok: false, mensaje: "Escribe tu nombre." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(datos.correo)) return { ok: false, mensaje: "Escribe un correo válido." };
  if (datos.telefono && !/^[0-9 +()-]{6,20}$/.test(datos.telefono))
    return { ok: false, mensaje: "El teléfono solo puede tener números (6 a 20 caracteres)." };
  if (!ASUNTOS.includes(datos.asunto as (typeof ASUNTOS)[number])) return { ok: false, mensaje: "Elige un asunto." };
  if (datos.mensaje.length < 10) return { ok: false, mensaje: "El mensaje debe tener al menos 10 caracteres." };
  if (datos.mensaje.length > 2000) return { ok: false, mensaje: "El mensaje no puede pasar de 2000 caracteres." };

  const supabase = await createClient();
  const { error } = await supabase.from("mensajes_contacto").insert({
    ...datos,
    nombre: datos.nombre.slice(0, 100),
    correo: datos.correo.slice(0, 150),
  });
  if (error) return { ok: false, mensaje: errorBD(error.message) };

  return {
    ok: true,
    mensaje: `¡Gracias, ${datos.nombre.split(" ")[0]}! Recibimos tu mensaje y te responderemos a ${datos.correo} muy pronto.`,
  };
}

/** OPINIÓN DE CLIENTE: guarda la reseña en la tabla opiniones y la muestra en la página. */
export async function enviarOpinion(_prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  if (texto(fd, "sitio_web")) return { ok: true, mensaje: "¡Gracias por tu opinión!" };

  const datos = {
    nombre: texto(fd, "nombre"),
    ciudad: texto(fd, "ciudad") || null,
    calificacion: Number(fd.get("calificacion")),
    comentario: texto(fd, "comentario"),
  };

  if (datos.nombre.length < 2) return { ok: false, mensaje: "Escribe tu nombre." };
  if (!Number.isInteger(datos.calificacion) || datos.calificacion < 1 || datos.calificacion > 5)
    return { ok: false, mensaje: "Elige de 1 a 5 estrellas." };
  if (datos.comentario.length < 10) return { ok: false, mensaje: "Cuéntanos un poco más (mínimo 10 caracteres)." };
  if (datos.comentario.length > 600) return { ok: false, mensaje: "La opinión no puede pasar de 600 caracteres." };

  const supabase = await createClient();
  const { error } = await supabase.from("opiniones").insert({
    ...datos,
    nombre: datos.nombre.slice(0, 80),
    ciudad: datos.ciudad?.slice(0, 80) ?? null,
  });
  if (error) return { ok: false, mensaje: errorBD(error.message) };

  revalidatePath("/contacto");
  return { ok: true, mensaje: "¡Gracias por tu opinión! Ya aparece en la lista." };
}
