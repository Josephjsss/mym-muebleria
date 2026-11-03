import { Reveal } from "@/components/reactbits/Reveal";
import { fasesScrum, sprints } from "@/data/equipo";
import { RefreshCcw } from "lucide-react";

/** Metodología de programación: Scrum con todas sus fases y los 4 sprints. */
export function Metodologia() {
  return (
    <section id="metodologia" className="mx-auto max-w-6xl px-4 py-16">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
        <RefreshCcw className="size-3.5" />
        Metodología de programación
      </span>
      <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Trabajamos con Scrum</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Scrum es una metodología ágil: el proyecto se divide en sprints cortos y al final de
        cada uno se entrega una parte funcionando. En nuestro caso, cada sprint es un avance
        del curso.
      </p>

      {/* Fases */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fasesScrum.map((f, i) => (
          <Reveal key={f.fase} delay={i * 0.06}>
            <div className="h-full rounded-2xl border bg-card p-5 shadow-sm">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <p className="mt-3 font-heading text-lg font-semibold">{f.fase}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.detalle}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Sprints */}
      <h3 className="mt-12 font-heading text-xl font-semibold">Nuestros 4 sprints</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        {sprints.map((s, i) => (
          <Reveal key={s.nombre} delay={i * 0.08}>
            <div className="relative h-full rounded-2xl border-t-4 border-t-primary bg-secondary/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">{s.avance}</p>
              <p className="font-heading text-lg font-semibold">{s.nombre}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.contenido}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
