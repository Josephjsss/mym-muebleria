import { OpinionForm } from "@/components/contacto/opinion-form";
import { Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type Opinion = {
  id: string;
  nombre: string;
  ciudad: string | null;
  calificacion: number;
  comentario: string;
  fecha: string | null;
};

/** OPINIONES DE CLIENTES: promedio, lista de reseñas y formulario para dejar la tuya. */
export function OpinionesClientes({ opiniones }: { opiniones: Opinion[] }) {
  const promedio = opiniones.length ? opiniones.reduce((s, o) => s + o.calificacion, 0) / opiniones.length : 0;

  return (
    <section id="opiniones" className="scroll-mt-20 bg-gradient-to-b from-background to-secondary/30 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Quote className="size-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Opiniones</span>
            </div>
            <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Lo que dicen nuestros clientes
            </h2>
          </div>
          {opiniones.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5 shadow-sm">
              <p className="font-heading text-3xl font-bold leading-none">{promedio.toFixed(1)}</p>
              <div>
                <Estrellas valor={Math.round(promedio)} />
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {opiniones.length} {opiniones.length === 1 ? "opinión" : "opiniones"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_340px]">
          <ul className="grid gap-4 sm:grid-cols-2">
            {opiniones.map((o) => (
              <li key={o.id} className="flex h-full flex-col rounded-xl border bg-card p-4 shadow-sm">
                <Estrellas valor={o.calificacion} />
                <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/85">“{o.comentario}”</p>
                <div className="mt-3 flex items-center gap-2.5 border-t pt-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {o.nombre
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0 text-xs">
                    <p className="truncate font-semibold text-foreground">{o.nombre}</p>
                    <p className="truncate text-muted-foreground">
                      {[o.ciudad, o.fecha].filter(Boolean).join(" · ") || "Cliente"}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <OpinionForm />
        </div>
      </div>
    </section>
  );
}

export function Estrellas({ valor, className }: { valor: number; className?: string }) {
  return (
    <div className={cn("flex gap-0.5", className)} role="img" aria-label={`${valor} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn("size-4", n <= valor ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30")}
        />
      ))}
    </div>
  );
}
