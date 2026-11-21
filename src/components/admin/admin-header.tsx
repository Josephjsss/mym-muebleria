"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { Usuario } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BarChart3, Boxes, LogOut, Store } from "lucide-react";

const secciones = [
  { href: "/admin", etiqueta: "Productos", icono: Boxes },
  { href: "/admin/reportes", etiqueta: "Reportes", icono: BarChart3 },
] as const;

/** Barra superior del sistema interno (administrador). */
export function AdminHeader({
  usuario,
  activa,
}: {
  usuario: Pick<Usuario, "nombre" | "correo" | "rol">;
  activa: "/admin" | "/admin/reportes";
}) {
  const router = useRouter();

  async function cerrarSesion() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-[#0f2a27] text-white print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-3">
          <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white">
            <Image src="/images/logo-mark.png" alt="Logo M&M" fill sizes="36px" className="object-contain p-1" />
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="font-heading text-sm font-semibold">Panel de administración</p>
            <p className="text-xs text-white/60">M&M Mueblería · Sistema interno</p>
          </div>
          <nav className="ml-1 flex items-center gap-1 rounded-lg bg-white/10 p-1 sm:ml-4">
            {secciones.map(({ href, etiqueta, icono: Icono }) => (
              <Link
                key={href}
                href={href}
                aria-current={activa === href ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                  activa === href ? "bg-white text-[#0f2a27]" : "text-white/75 hover:text-white"
                )}
              >
                <Icono className="size-3.5" />
                {etiqueta}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-right text-xs leading-tight lg:block">
            <span className="block font-medium">{usuario.nombre}</span>
            <span className="text-white/60">
              {usuario.correo} · {usuario.rol}
            </span>
          </span>
          <Button
            size="sm"
            variant="ghost"
            nativeButton={false}
            className="text-white hover:bg-white/10 hover:text-white"
            render={<Link href="/" />}
          >
            <Store className="size-3.5" />
            <span className="hidden sm:inline">Ver web</span>
          </Button>
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={cerrarSesion}>
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
