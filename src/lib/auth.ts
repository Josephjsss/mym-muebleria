import { createClient } from "@/lib/supabase/server";
import type { Usuario } from "@/lib/types";

/** Devuelve el perfil (tabla usuarios) del usuario con sesión, o null. */
export async function obtenerUsuarioActual(): Promise<Usuario | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("usuarios")
    .select("id, auth_id, nombre, correo, rol")
    .eq("auth_id", user.id)
    .maybeSingle();

  return (data as Usuario | null) ?? null;
}
