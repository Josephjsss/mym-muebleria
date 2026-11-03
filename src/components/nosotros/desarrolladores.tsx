import { Reveal } from "@/components/reactbits/Reveal";
import { PersonaFoto } from "@/components/nosotros/persona-foto";
import { Button } from "@/components/ui/button";
import type { Desarrollador } from "@/data/desarrolladores";
import { Code2, FileText, GitBranch, Laptop, Sparkles } from "lucide-react";

/**
 * Desarrolladores: foto presentable + C.V. resumido (3 programas, 3 lenguajes y
 * 5 habilidades blandas) y un botón al C.V. completo en PDF.
 */
export function Desarrolladores({
  lista,
  pdfDisponible,
}: {
  lista: Desarrollador[];
  pdfDisponible: Record<string, boolean>;
}) {
  return (
    <section id="desarrolladores" className="bg-[#0f2a27] py-16 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary">
          <Code2 className="size-3.5" />
          Desarrolladores
        </span>
        <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Quiénes construyeron la web</h2>
        <p className="mt-2 max-w-2xl text-white/70">
          Cada integrante trabajó en su propia rama de GitHub. Aquí está su C.V. resumido y el
          enlace a su C.V. completo con certificados y capacitaciones.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {lista.map((d, i) => (
            <Reveal key={d.nombre} delay={i * 0.1}>
              <article className="flex h-full flex-col rounded-2xl bg-white p-6 text-foreground shadow-xl">
                <div className="flex items-center gap-4">
                  <PersonaFoto foto={d.foto} nombre={d.nombre} className="size-24" />
                  <div>
                    <h3 className="font-heading text-xl font-semibold">{d.nombre}</h3>
                    <p className="text-sm font-medium text-primary">{d.rol}</p>
                    <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 font-mono text-xs text-secondary-foreground">
                      <GitBranch className="size-3" />
                      rama {d.rama}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{d.resumen}</p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Lista icono={Laptop} titulo="3 programas" items={d.programas} />
                  <Lista icono={Code2} titulo="3 lenguajes de programación" items={d.lenguajes} />
                </div>
                <div className="mt-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Sparkles className="size-3.5" />
                    5 habilidades blandas
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {d.habilidades.map((h) => (
                      <span key={h} className="rounded-full border px-2.5 py-1 text-xs font-medium">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  {pdfDisponible[d.cvPdf] ? (
                    <Button
                      className="w-full"
                      nativeButton={false}
                      render={<a href={d.cvPdf} target="_blank" rel="noopener noreferrer" />}
                    >
                      <FileText className="size-4" />
                      Ver C.V. completo (PDF)
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      <FileText className="size-4" />
                      C.V. en preparación
                    </Button>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Lista({
  icono: Icono,
  titulo,
  items,
}: {
  icono: typeof Code2;
  titulo: string;
  items: readonly string[];
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icono className="size-3.5" />
        {titulo}
      </p>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map((it) => (
          <li key={it} className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
