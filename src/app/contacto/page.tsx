import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/site/navbar";
import { SiteFooter } from "@/components/site/footer";
import { ContactoSlider } from "@/components/contacto/contacto-slider";
import { FormularioContacto } from "@/components/contacto/formulario-contacto";
import { MapaSucursal } from "@/components/contacto/mapa-sucursal";
import { OpinionesClientes, type Opinion } from "@/components/contacto/opiniones-clientes";
import { createClient } from "@/lib/supabase/server";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "Contacto · M&M Mueblería",
  description: "Escríbenos, visítanos en Quilmaná (Cañete) y lee las opiniones de nuestros clientes.",
};

async function OpinionesContacto() {
  // Opiniones guardadas en la BD (solo las visibles, lo exige la RLS).
  const supabase = await createClient();
  const { data } = await supabase
    .from("opiniones")
    .select("id, nombre, ciudad, calificacion, comentario, creado_en")
    .order("creado_en", { ascending: false })
    .limit(12);

  const deLaBD: Opinion[] = (data ?? []).map((o) => ({
    id: `bd-${o.id}`,
    nombre: o.nombre,
    ciudad: o.ciudad,
    calificacion: o.calificacion,
    comentario: o.comentario,
    fecha: new Date(o.creado_en).toLocaleDateString("es-PE", { timeZone: "America/Lima", dateStyle: "medium" }),
  }));

  // Si aún hay pocas en la BD, se completan con los testimonios del sitio.
  const testimonios: Opinion[] = company.testimonials.map((t, i) => ({
    id: `t-${i}`,
    nombre: t.name,
    ciudad: t.location,
    calificacion: t.rating,
    comentario: t.quote,
    fecha: null,
  }));
  const opiniones = deLaBD.length >= 6 ? deLaBD : [...deLaBD, ...testimonios].slice(0, 6);

  return <OpinionesClientes opiniones={opiniones} />;
}

function OpinionesCargando() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14" aria-busy="true" aria-label="Cargando opiniones">
      <p role="status" className="mb-6 text-sm text-muted-foreground">Cargando opiniones…</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
      </div>
    </section>
  );
}

export default function ContactoPage() {

  return (
    <>
      <Navbar active="/contacto" />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 via-background to-background">
          <div className="bg-dot-pattern pointer-events-none absolute inset-0 text-primary/[0.1] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="relative mx-auto max-w-6xl px-4 pb-2 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Contacto</span>
            <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight sm:text-4xl">Hablemos de tu mueble</h1>
            <p className="mt-2 text-muted-foreground">
              Escríbenos, visítanos en {company.location} o llámanos: te ayudamos a diseñarlo a tu medida.
            </p>
            <div className="mt-6">
              <ContactoSlider />
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl items-stretch gap-6 px-4 py-12 lg:grid-cols-[1.15fr_1fr]">
          <FormularioContacto />
          <MapaSucursal />
        </section>

        <Suspense fallback={<OpinionesCargando />}>
          <OpinionesContacto />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
