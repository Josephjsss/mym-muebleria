import { Reveal } from "@/components/reactbits/Reveal";
import { PersonaFoto } from "@/components/nosotros/persona-foto";
import { cargos, coordinador, docente, type Persona } from "@/data/equipo";
import { Network } from "lucide-react";

/** Mapa organizacional del equipo del proyecto UTP. */
export function Organigrama() {
  return (
    <section id="equipo" className="mx-auto max-w-6xl px-4 py-16">
      <Encabezado />

      <div className="mt-10 flex flex-col items-center">
        <Reveal>
          <Nodo persona={docente} tono="suave" />
        </Reveal>
        <Conector />
        <Reveal delay={0.1}>
          <Nodo persona={coordinador} tono="fuerte" />
        </Reveal>

        {/* Ramas hacia los cargos */}
        <div className="h-6 w-px bg-primary/40" />
        <div className="hidden h-px w-2/3 bg-primary/40 md:block" />
        <div className="grid w-full gap-6 md:grid-cols-3">
          {cargos.map((c, i) => (
            <div key={c.cargo} className="flex flex-col items-center">
              <div className="hidden h-6 w-px bg-primary/40 md:block" />
              <Reveal delay={0.15 + i * 0.08} className="w-full">
                <Nodo persona={c} tono="normal" numero={i + 1} />
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Encabezado() {
  return (
    <div className="max-w-2xl">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
        <Network className="size-3.5" />
        Equipo del proyecto · UTP
      </span>
      <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Mapa organizacional</h2>
      <p className="mt-2 text-muted-foreground">
        Así nos organizamos para desarrollar el sistema web de M&M Mueblería en el curso
        Herramientas de Desarrollo.
      </p>
    </div>
  );
}

function Conector() {
  return <div className="h-8 w-px bg-primary/40" />;
}

function Nodo({
  persona,
  tono,
  numero,
}: {
  persona: Persona;
  tono: "suave" | "fuerte" | "normal";
  numero?: number;
}) {
  const estilos = {
    suave: "border-dashed bg-card",
    fuerte: "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20",
    normal: "bg-card shadow-sm",
  }[tono];

  return (
    <div className={`mx-auto flex w-full max-w-xs flex-col items-center rounded-2xl border p-5 text-center ${estilos}`}>
      <PersonaFoto foto={persona.foto} nombre={persona.nombre} className="size-16" />
      <p className={`mt-3 text-xs font-semibold uppercase tracking-wider ${tono === "fuerte" ? "text-white/80" : "text-primary"}`}>
        {numero ? `Cargo ${numero} · ` : ""}
        {persona.cargo}
      </p>
      <p className="mt-1 font-heading text-lg font-semibold">{persona.nombre}</p>
      <p className={`mt-1 text-sm ${tono === "fuerte" ? "text-white/80" : "text-muted-foreground"}`}>
        {persona.descripcion}
      </p>
    </div>
  );
}
