import type { Metadata } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import { Navbar } from "@/components/site/navbar";
import { SiteFooter } from "@/components/site/footer";
import { NosotrosSlider } from "@/components/nosotros/nosotros-slider";
import { Organigrama } from "@/components/nosotros/organigrama";
import { EmpresaContacto } from "@/components/nosotros/empresa-contacto";
import { Desarrolladores } from "@/components/nosotros/desarrolladores";
import { Metodologia } from "@/components/nosotros/metodologia";
import { desarrolladores } from "@/data/desarrolladores";

export const metadata: Metadata = {
  title: "Nosotros · M&M Mueblería",
  description: "Equipo del proyecto UTP, la empresa M&M Mueblería, desarrolladores y metodología Scrum.",
};

export default function NosotrosPage() {
  // El botón del C.V. solo se activa si el PDF ya está en /public/cv.
  const pdfDisponible = Object.fromEntries(
    desarrolladores.map((d) => [d.cvPdf, existsSync(path.join(process.cwd(), "public", d.cvPdf))])
  );

  return (
    <>
      <Navbar active="/nosotros" />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 via-background to-background">
          <div className="bg-dot-pattern pointer-events-none absolute inset-0 text-primary/[0.1] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="relative mx-auto max-w-6xl px-4 pb-2 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Nosotros</span>
            <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              El equipo detrás de la web
            </h1>
            <p className="mt-2 text-muted-foreground">
              Estudiantes de la UTP y M&M Mueblería, trabajando juntos en este proyecto.
            </p>
            <div className="mt-6">
              <NosotrosSlider />
            </div>
          </div>
        </section>

        <Organigrama />
        <EmpresaContacto />
        <Desarrolladores lista={desarrolladores} pdfDisponible={pdfDisponible} />
        <Metodologia />
      </main>
      <SiteFooter />
    </>
  );
}
