import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { SiteFooter } from "@/components/site/footer";
import { CarritoVista } from "@/components/tienda/carrito-vista";
import { obtenerUsuarioActual } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Carrito de compras · M&M Mueblería",
};

export default async function CarritoPage() {
  const usuario = await obtenerUsuarioActual();

  return (
    <>
      <Navbar active="/productos" />
      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Tienda</span>
          <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">Carrito de compras</h1>
          <CarritoVista usuario={usuario ? { nombre: usuario.nombre, rol: usuario.rol } : null} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
