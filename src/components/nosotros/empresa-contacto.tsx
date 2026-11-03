import { Reveal } from "@/components/reactbits/Reveal";
import { PersonaFoto } from "@/components/nosotros/persona-foto";
import { agradecimiento, empresa, finalidad, type Persona } from "@/data/equipo";
import { Building2, HeartHandshake, MapPin, Target } from "lucide-react";

/** La empresa: jefe, organización, persona de contacto, finalidad y agradecimiento. */
export function EmpresaContacto() {
  return (
    <section id="empresa" className="bg-gradient-to-b from-secondary/40 to-background py-16">
      <div className="mx-auto max-w-6xl px-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          <Building2 className="size-3.5" />
          La organización
        </span>
        <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{empresa.organizacion}</h2>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
          <span>{empresa.rubro}</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-4" />
            {empresa.ubicacion}
          </span>
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Reveal>
            <Tarjeta etiqueta="Jefe de la organización" persona={empresa.jefe} />
          </Reveal>
          <Reveal delay={0.1}>
            <Tarjeta etiqueta="Persona de contacto" persona={empresa.contacto} />
          </Reveal>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Reveal delay={0.15}>
            <div className="h-full rounded-2xl border bg-card p-6 shadow-sm">
              <p className="flex items-center gap-2 font-heading text-lg font-semibold">
                <Target className="size-5 text-primary" />
                Finalidad del proyecto
              </p>
              <p className="mt-2 leading-relaxed text-muted-foreground">{finalidad}</p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="h-full rounded-2xl bg-[#0f2a27] p-6 text-white shadow-sm">
              <p className="flex items-center gap-2 font-heading text-lg font-semibold">
                <HeartHandshake className="size-5 text-secondary" />
                Agradecimiento
              </p>
              <p className="mt-2 leading-relaxed text-white/80">{agradecimiento}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Tarjeta({ etiqueta, persona }: { etiqueta: string; persona: Persona }) {
  return (
    <div className="flex h-full items-center gap-5 rounded-2xl border bg-card p-5 shadow-sm">
      <PersonaFoto foto={persona.foto} nombre={persona.nombre} className="size-24" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{etiqueta}</p>
        <p className="mt-1 font-heading text-xl font-semibold">{persona.nombre}</p>
        <p className="text-sm font-medium">{persona.cargo}</p>
        <p className="mt-1 text-sm text-muted-foreground">{persona.descripcion}</p>
      </div>
    </div>
  );
}
