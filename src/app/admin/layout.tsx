import Link from "next/link";
import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { ShieldAlert } from "lucide-react";

/**
 * Layout del SISTEMA INTERNO (/admin y /admin/reportes).
 * Verifica el rol UNA sola vez para todas las páginas del admin y dibuja la
 * cabecera, que se mantiene al cambiar de pestaña (solo se recarga el contenido).
 * La BD también protege los datos con RLS.
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect("/?login=1");

  if (usuario.rol !== "admin") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center">
        <ShieldAlert className="size-12 text-destructive" />
        <h1 className="font-heading text-2xl font-bold">Acceso restringido</h1>
        <p className="max-w-sm text-muted-foreground">
          Tu cuenta ({usuario.correo}) es de cliente. Solo el administrador puede entrar al sistema interno.
        </p>
        <Link href="/" className="mt-2 text-sm font-medium text-primary hover:underline">
          Volver al inicio
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-full flex-1 bg-muted/40">
      <AdminHeader usuario={usuario} />
      {children}
    </div>
  );
}
